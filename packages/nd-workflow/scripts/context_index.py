#!/usr/bin/env python3
"""Derived context index and freshness checks for ND projects.

Scope: read-only with respect to project sources. The only write is an ignored,
disposable cache (``.nd-cache/context-index.json``) replaced atomically.

Guarantees and limits:
- Routing metadata only: repository-relative paths, document class, topics,
  headings, requirement IDs and fingerprints. No rewritten project facts, no
  model calls, no daemon, no external services.
- Freshness is content-based (size + mtime first, sha256 on mismatch). It
  detects file changes, not semantic agreement between requirement, code,
  test and docs.
- A missing, corrupted or stale cache never yields a "current" claim and
  never yields an empty locate result by itself; bounded live file search is
  used instead. Absence from the index is not absence from the repository.
- Secret-shaped names, ignored trees and out-of-project links are skipped.
- Historical tasks are excluded from default lookup; ``--include-history``
  is an explicit opt-in.
"""
import ast
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
from setup_project import checked_path, safe_target
from stage_project import reject_links

SCHEMA_VERSION = 1
CACHE_DIR = '.nd-cache'
CACHE_NAME = 'context-index.json'
MAX_SOURCE_BYTES = 100_000
MAX_EXCERPT_CHARS = 140
DEFAULT_LIMIT = 5
MAX_LIMIT = 5  # PC-003: at most five proposed routes by default.
DEFAULT_SUMMARY_TOKENS = 500

CURRENT_POLICY = 'current_policy'
CURRENT_BEHAVIOR = 'current_behavior'
ACTIVE_TASK = 'active_task'
DRAFT = 'draft'
HISTORICAL = 'historical'
CLASS_RANK = {CURRENT_POLICY: 0, CURRENT_BEHAVIOR: 1, ACTIVE_TASK: 2, DRAFT: 3, HISTORICAL: 4}

ROOT_FILES = ('AGENTS.md', 'CLAUDE.md', 'START-HERE.md')
SCAN_DIRS = ('docs', '.agents/docs', '.agents/skills', '.agents/templates')
EXCLUDED_DIRS = {'__pycache__', 'node_modules', '.git', '.nd-cache'}
CATALOG = 'docs/README.md'
POLICY_FILES = {
    'AGENTS.md', 'CLAUDE.md', 'START-HERE.md', 'docs/README.md',
    'docs/tasks/README.md', 'docs/prd/README.md', 'docs/plans/README.md',
}
FINISHED_STATUS = {'implemented', 'released', 'accepted', 'done', 'complete', 'archived', 'superseded'}

LIMITS = (
    'Derived and disposable: rebuild with `nd index build`. Fingerprints detect file changes, not '
    'semantic agreement; source files remain authoritative. Host loading, actual token usage and '
    'model behavior are not measured here.'
)


def classify_path(rel, text=None):
    """Deterministic document-class mapping; frontmatter may mark finished proposals historical."""
    if hasattr(rel, 'as_posix'):
        rel = rel.as_posix()
    rel = str(rel).replace('\\', '/')
    if rel.startswith('docs/tasks/done/'):
        return HISTORICAL
    if rel.startswith('docs/tasks/'):
        name = rel.rsplit('/', 1)[-1]
        if name.startswith(('wip-', 'blocked-')):
            return ACTIVE_TASK
        if name == 'README.md':
            return CURRENT_POLICY
        return DRAFT
    if rel.startswith(('docs/prd/', 'docs/plans/')):
        if rel.endswith('README.md'):
            return CURRENT_POLICY
        status = _frontmatter_status(text) if text is not None else None
        return HISTORICAL if status in FINISHED_STATUS else DRAFT
    if rel.startswith('.agents/templates/'):
        return CURRENT_POLICY
    if rel in POLICY_FILES:
        return CURRENT_POLICY
    if rel.startswith('.agents/skills/'):
        return CURRENT_POLICY
    if rel.startswith('.agents/docs/'):
        return CURRENT_POLICY if rel.endswith('WORKFLOW.md') else CURRENT_BEHAVIOR
    if rel.startswith('docs/'):
        return CURRENT_BEHAVIOR
    return CURRENT_BEHAVIOR


def _frontmatter_status(text):
    head = text[:800]
    match = re.search(r'^status\s*:\s*"?([A-Za-z-]+)"?\s*$', head, re.M)
    return match.group(1).strip().lower() if match else None


def _headings(text):
    found = []
    for line in text.splitlines():
        match = re.match(r'^(#{1,3})\s+(.+?)\s*$', line)
        if not match:
            continue
        found.append(match.group(2).strip())
        if len(found) >= 12:
            break
    return found


CODE_EXTS = ('.py', '.js', '.ts', '.mjs', '.cjs')
CODE_DIRS = ('src', 'scripts', 'lib', 'app')


def _extract_symbols(rel, text):
    """Extract code symbols (functions, classes, exports) and doc symbols (backticked identifiers)."""
    symbols = set()
    rel_low = rel.lower()
    if rel_low.endswith('.py'):
        try:
            tree = ast.parse(text)
            for node in tree.body:
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    symbols.add(node.name)
                    if isinstance(node, ast.ClassDef):
                        for item in node.body:
                            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                                symbols.add(item.name)
        except SyntaxError:
            symbols.update(re.findall(r'^(?:async\s+)?def\s+([A-Za-z0-9_]+)\b', text, re.MULTILINE))
            symbols.update(re.findall(r'^class\s+([A-Za-z0-9_]+)\b', text, re.MULTILINE))
    elif rel_low.endswith(('.js', '.ts', '.mjs', '.cjs')):
        symbols.update(re.findall(r'(?:export\s+(?:default\s+)?)?(?:async\s+)?function\*?\s+([A-Za-z0-9_$]+)', text))
        symbols.update(re.findall(r'(?:export\s+)?class\s+([A-Za-z0-9_$]+)', text))
        symbols.update(re.findall(r'export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)', text))
    elif rel_low.endswith('.md'):
        symbols.update(re.findall(r'`([A-Za-z_][A-Za-z0-9_]{2,40})`', text))
    return sorted(symbols)[:40]


def _requirement_ids(text):
    return sorted(set(re.findall(r'\b(?:PC|LP)-\d{3}\b', text)))[:8]


def read_bounded(target, rel):
    """Read one in-project text source within the bounded size cap. Returns (text, bytes)."""
    path = checked_path(target, rel)
    with path.open('rb') as handle:
        data = handle.read(MAX_SOURCE_BYTES + 1)
    if len(data) > MAX_SOURCE_BYTES:
        raise ValueError(f'{rel}: exceeds bounded read limit ({MAX_SOURCE_BYTES} bytes)')
    return data.decode('utf-8', errors='replace'), len(data)


def iter_source_files(target):
    """Bounded set of in-scope sources: root policy/code files, docs, agents docs/skills/templates."""
    items = set()
    for name in ROOT_FILES:
        try:
            if checked_path(target, name).is_file():
                items.add(name)
        except ValueError:
            continue
    # Discover root code files
    try:
        for entry in target.iterdir():
            if entry.is_file() and entry.suffix.lower() in CODE_EXTS:
                if not entry.is_symlink() and entry.name not in EXCLUDED_DIRS:
                    try:
                        checked_path(target, entry.name)
                        items.add(entry.name)
                    except ValueError:
                        pass
    except OSError:
        pass
    # Discover code files in standard source directories
    for code_dir in CODE_DIRS:
        base = target / code_dir
        if not base.is_dir() or base.is_symlink():
            continue
        for dirpath, dirnames, filenames in os.walk(base, followlinks=False):
            dirnames[:] = sorted(
                name for name in dirnames
                if name not in EXCLUDED_DIRS and not (Path(dirpath) / name).is_symlink())
            for filename in sorted(filenames):
                ext = Path(filename).suffix.lower()
                if ext not in CODE_EXTS and ext != '.md':
                    continue
                path = Path(dirpath) / filename
                if path.is_symlink():
                    continue
                rel = path.relative_to(target).as_posix()
                try:
                    checked_path(target, rel)
                except ValueError:
                    continue
                items.add(rel)
    for root in SCAN_DIRS:
        base = target / root
        if not base.is_dir() or base.is_symlink():
            continue
        for dirpath, dirnames, filenames in os.walk(base, followlinks=False):
            dirnames[:] = sorted(
                name for name in dirnames
                if name not in EXCLUDED_DIRS and not (Path(dirpath) / name).is_symlink())
            for filename in sorted(filenames):
                if not filename.lower().endswith('.md'):
                    continue
                path = Path(dirpath) / filename
                if path.is_symlink():
                    continue
                rel = path.relative_to(target).as_posix()
                try:
                    checked_path(target, rel)
                except ValueError:
                    continue
                items.add(rel)
    return sorted(items)


def parse_catalog(target):
    """Parse docs/README.md routing rows: topic, target path, read-when guidance."""
    routes = {}
    try:
        text, _ = read_bounded(target, CATALOG)
    except (OSError, ValueError):
        return routes
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith('|'):
            continue
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        if len(cells) < 3 or cells[0].lower() in ('topic',) or set(cells[0]) <= set('-: '):
            continue
        link = re.match(r'\[([^\]]*)\]\(([^)]+)\)', cells[1])
        if not link:
            continue
        target_path = link.group(2).split('#', 1)[0].strip()
        if not target_path or '://' in target_path or target_path.startswith(('mailto:', '#')):
            continue
        relative = os.path.normpath(os.path.join('docs', target_path)).replace('\\', '/')
        if relative.startswith('..') or os.path.isabs(relative):
            continue
        routes[relative] = {
            'topic': cells[0] or link.group(1),
            'read_when': cells[2],
            'label': link.group(1),
        }
    return routes


def git_state(target):
    """Cheap revision/dirty fingerprint; UNKNOWN when git is unavailable or fails."""
    if not shutil.which('git'):
        return {'status': 'UNKNOWN', 'reason': 'git not on PATH'}
    def run(*args):
        result = subprocess.run(['git', *args], cwd=target, capture_output=True, text=True,
                                encoding='utf-8', errors='replace', timeout=15)
        if result.returncode:
            raise OSError((result.stderr or '').strip() or f'git {args[0]} failed')
        return result.stdout.strip()
    try:
        return {'status': 'OK', 'head': run('rev-parse', 'HEAD'),
                'branch': run('rev-parse', '--abbrev-ref', 'HEAD'),
                'dirty': bool(run('status', '--porcelain'))}
    except (OSError, subprocess.SubprocessError, ValueError):
        return {'status': 'UNKNOWN', 'reason': 'git inspection failed'}


def build_entry(target, rel, route=None):
    """One index entry: routing metadata plus fingerprint. Missing targets stay visible."""
    entry = {
        'path': rel,
        'class': None,
        'topic': (route or {}).get('topic') or Path(rel).stem.replace('-', ' '),
        'read_when': (route or {}).get('read_when'),
        'source': 'catalog' if route else 'scan',
        'headings': [],
        'requirement_ids': [],
        'symbols': [],
        'exists': False,
        'fingerprint': None,
        'content_sha256': None,
    }
    try:
        text, _ = read_bounded(target, rel)
    except (OSError, ValueError) as error:
        entry['class'] = classify_path(rel)
        try:
            entry['exists'] = checked_path(target, rel).is_file()
        except ValueError:
            entry['exists'] = False
        entry['note'] = f'not indexed: {error}'[:200]
        return entry
    entry['exists'] = True
    entry['class'] = classify_path(rel, text)
    entry['headings'] = _headings(text)
    entry['requirement_ids'] = _requirement_ids(text)
    entry['symbols'] = _extract_symbols(rel, text)
    entry['content_sha256'] = hashlib.sha256(text.encode('utf-8')).hexdigest()
    stat = checked_path(target, rel).stat()
    entry['fingerprint'] = {'size': stat.st_size, 'mtime_ns': stat.st_mtime_ns}
    if not (route or {}).get('topic'):
        first = next((h for h in entry['headings'] if h), None)
        if first:
            entry['topic'] = first
    return entry


def build_index(target):
    """Build the derived payload in memory; caller decides whether to persist."""
    target = safe_target(target)
    routes = parse_catalog(target)
    entries = {}
    for rel in iter_source_files(target):
        entries[rel] = build_entry(target, rel, routes.get(rel) or routes.get(rel.replace('\\', '/')))
    for rel, route in routes.items():
        if rel not in entries:
            entries[rel] = build_entry(target, rel, route)
    payload = {
        'schema': SCHEMA_VERSION,
        'tool': 'nd context index',
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'git': git_state(target),
        'entries': [entries[rel] for rel in sorted(entries)],
        'limits': LIMITS,
    }
    return payload


def cache_rel_path():
    return f'{CACHE_DIR}/{CACHE_NAME}'


def load_cache(target):
    """Return (state, payload). STATE is OK, MISSING or CORRUPTED; never raises on bad cache."""
    path = Path(target) / CACHE_DIR / CACHE_NAME
    if not path.is_file():
        return 'MISSING', None
    try:
        raw = path.read_bytes()
        if len(raw) > 5_000_000:
            return 'CORRUPTED', None
        payload = json.loads(raw.decode('utf-8'))
        if (not isinstance(payload, dict) or payload.get('schema') != SCHEMA_VERSION
                or not isinstance(payload.get('entries'), list)):
            return 'CORRUPTED', None
        return 'OK', payload
    except (OSError, ValueError, UnicodeDecodeError):
        return 'CORRUPTED', None


def save_cache(target, payload):
    """Atomic replacement: interrupted writes leave the previous cache or no cache."""
    directory = Path(target) / CACHE_DIR
    reject_links(directory)
    directory.mkdir(parents=True, exist_ok=True)
    final = directory / CACHE_NAME
    handle = tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=directory,
                                         prefix='.tmp-', suffix='.json', delete=False)
    try:
        with handle:
            json.dump(payload, handle, ensure_ascii=False, indent=1)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(handle.name, final)
    except BaseException:
        try:
            os.unlink(handle.name)
        except OSError:
            pass
        raise
    return final


def _hash(target, rel):
    text, _ = read_bounded(target, rel)
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def check_freshness(target, payload):
    """Compare cached fingerprints with live source; detects edit, rename, delete, HEAD change."""
    target = safe_target(target)
    report = {'state': 'FRESH', 'changed': [], 'missing': [], 'added': [],
              'unresolved_routes': [], 'git': 'UNKNOWN'}
    cached = {entry['path']: entry for entry in payload.get('entries', []) if isinstance(entry, dict)}
    live = set(iter_source_files(target))
    for rel, entry in cached.items():
        try:
            path = checked_path(target, rel)
            exists = path.is_file()
        except ValueError:
            report['missing'].append(rel)
            continue
        if not exists:
            if entry.get('exists'):
                report['missing'].append(rel)
            else:
                report['unresolved_routes'].append(rel)  # catalog route without a target file
            continue
        if not entry.get('exists'):
            report['changed'].append(f'{rel} (route target now present)')
            continue
        if not entry.get('fingerprint'):
            continue  # oversized/unreadable sources are recorded as not indexed, not fingerprinted
        stat = path.stat()
        fingerprint = entry.get('fingerprint') or {}
        if stat.st_size == fingerprint.get('size') and stat.st_mtime_ns == fingerprint.get('mtime_ns'):
            continue
        report['changed'].append(rel)
    report['added'] = sorted(live - set(cached))
    head_cached = (payload.get('git') or {}).get('head')
    live_git = git_state(target)
    report['git'] = live_git.get('head') or live_git.get('status')
    if head_cached and live_git.get('status') == 'OK' and live_git.get('head') != head_cached:
        report['changed'].append('git HEAD changed')
    if report['changed'] or report['missing'] or report['added']:
        report['state'] = 'STALE'
    return report


def _tokens(topic):
    return [token for token in re.findall(r'[a-z0-9][a-z0-9_.-]+', topic.lower()) if len(token) > 1]


def _score(meta, tokens, text_low=None):
    path_low = meta.get('path', '').lower()
    topic_low = (meta.get('topic') or '').lower()
    headings_low = ' '.join(meta.get('headings') or []).lower()
    symbols_low = [s.lower() for s in (meta.get('symbols') or [])]
    symbols_str = ' '.join(symbols_low)
    score = 0
    for token in tokens:
        if token in symbols_low:
            score += 8
        elif token in symbols_str:
            score += 4
        if token in path_low:
            score += 3
        if token in topic_low:
            score += 3
        if token in headings_low:
            score += 2
        if text_low is not None and token in text_low:
            score += 1
    return score


def _excerpt(text, tokens, limit_chars=MAX_EXCERPT_CHARS):
    lines = text.splitlines()
    best_index = None
    for index, line in enumerate(lines):
        lowered = line.lower()
        if any(f'def {token}' in lowered or f'class {token}' in lowered or f'function {token}' in lowered or f'#{token}' in lowered for token in tokens):
            best_index = index
            break
    if best_index is None:
        for index, line in enumerate(lines):
            lowered = line.lower()
            if any(token in lowered for token in tokens):
                best_index = index
                break
    if best_index is not None:
        chunk = ' '.join(part.strip() for part in lines[best_index:best_index + 3] if part.strip())
        if len(chunk) > limit_chars:
            chunk = chunk[:limit_chars - 3] + '...'
        return chunk, best_index + 1
    return '', None


def _live_candidates(target, tokens, include_history, stats):
    """Scoped live scan with honest read accounting: used whenever cache cannot be trusted."""
    candidates = []
    sources = iter_source_files(target)
    stats['live_scanned'] = len(sources)
    for rel in sources:
        try:
            text, size = read_bounded(target, rel)
        except (OSError, ValueError):
            continue
        stats['files_read'] += 1
        stats['bytes_read'] += size
        klass = classify_path(rel, text)
        if klass == HISTORICAL and not include_history:
            continue
        meta = {'path': rel, 'class': klass, 'topic': Path(rel).stem.replace('-', ' '),
                'headings': _headings(text), 'symbols': _extract_symbols(rel, text)}
        score = _score(meta, tokens, text.lower())
        if score <= 0:
            continue
        excerpt, line = _excerpt(text, tokens)
        candidates.append({**meta, 'score': score, 'excerpt': excerpt, 'line': line,
                           'source': 'live', 'verified': True})
    return candidates


def locate(target, topic, limit=DEFAULT_LIMIT, include_history=False):
    """Bounded lookup: max five ranked routes; stale cache never served as current."""
    target = safe_target(target)
    tokens = _tokens(topic)
    if not tokens:
        raise ValueError('Topic must contain at least one searchable token')
    try:
        limit = max(1, min(int(limit), MAX_LIMIT))
    except (TypeError, ValueError):
        limit = DEFAULT_LIMIT
    state, payload = load_cache(target)
    notes = {'cache_state': state, 'cache_freshness': 'UNKNOWN', 'stale_excluded': 0,
             'live_fallback': False}
    stats = {'live_scanned': 0, 'files_read': 0, 'bytes_read': 0}
    results = []
    if state == 'OK':
        notes['cache_freshness'] = check_freshness(target, payload)['state']
        for entry in payload.get('entries', []):
            klass = entry.get('class')
            if klass == HISTORICAL and not include_history:
                continue
            if not entry.get('exists'):
                continue
            score = _score(entry, tokens)
            if score <= 0:
                continue
            try:
                if _hash(target, entry['path']) != entry.get('content_sha256'):
                    raise ValueError('changed')
            except (OSError, ValueError):
                notes['stale_excluded'] += 1
                continue
            try:
                text, size = read_bounded(target, entry['path'])
            except (OSError, ValueError):
                notes['stale_excluded'] += 1
                continue
            stats['files_read'] += 1
            stats['bytes_read'] += size
            excerpt, line = _excerpt(text, tokens)
            results.append({**entry, 'score': score, 'excerpt': excerpt, 'line': line,
                            'source': 'cache', 'verified': True})
    if state != 'OK' or len(results) < limit:
        notes['live_fallback'] = True
        known = {item['path'] for item in results}
        results.extend(item for item in _live_candidates(target, tokens, include_history, stats)
                       if item['path'] not in known)
    results.sort(key=lambda item: (CLASS_RANK.get(item.get('class'), 9), -item.get('score', 0), item['path']))
    bounded_results = []
    for item in results[:limit]:
        bounded_results.append({
            'path': item['path'],
            'class': item.get('class'),
            'topic': item.get('topic'),
            'excerpt': item.get('excerpt') or '',
            'line': item.get('line'),
            'expand': f"{item['path']}:{item.get('line') or 1} (read ~50 lines around it)",
            'source': item.get('source'),
            'verified': bool(item.get('verified')),
        })
    return {
        'topic': topic,
        'cache': state,
        'include_history': bool(include_history),
        'results': bounded_results,
        'matched_total': len(results),
        'counts': notes,
        'read_cost': stats,
        'limits': LIMITS + ' Historical tasks require --include-history; absence from the index is not absence from the repository.',
    }


def context_check(target):
    """Read-only audit: checkpoint completeness, anchors, ambiguity, cache freshness."""
    target = safe_target(target)
    active = []
    for rel in iter_source_files(target):
        try:
            text, _ = read_bounded(target, rel)
        except (OSError, ValueError):
            continue
        if classify_path(rel, text) != ACTIVE_TASK:
            continue
        fields = {}
        patterns = {
            'owner': r'^-\s*Owner[^:]*:\s*(.+)$',
            'scope_approval': r'^-\s*(?:Scope approval|Approval)[^:]*:\s*(.+)$',
            'authorization': r'^-\s*(?:Execution authorization|Authorization)[^:]*:\s*(.+)$',
            'next_action': r'^-\s*(?:Exact next action|Next action)[^:]*:\s*(.+)$',
            'blockers': r'^-\s*Blockers?[^:]*:\s*(.+)$',
            'status': r'^-\s*Status[^:]*:\s*(.+)$',
        }
        for key, pattern in patterns.items():
            found = re.findall(pattern, text, re.M)
            if found:
                fields[key] = found[-1].strip()[:200]
        missing = [key for key in ('owner', 'scope_approval', 'authorization', 'next_action')
                   if key not in fields]
        heads = re.findall(r'\b[0-9a-f]{40}\b', text)
        active.append({'path': rel, 'missing': missing, 'fields': fields,
                       'recorded_revision': heads[-1] if heads else None})
    live_git = git_state(target)
    head = live_git.get('head') if live_git.get('status') == 'OK' else None
    for item in active:
        recorded = item.pop('recorded_revision', None)
        if not recorded or not head:
            item['revision'] = 'UNKNOWN'
        else:
            item['revision'] = 'MATCH' if recorded == head else 'MISMATCH'
    state, payload = load_cache(target)
    freshness = check_freshness(target, payload) if state == 'OK' else None
    routes = parse_catalog(target)
    missing_anchors = []
    for rel in sorted(routes):
        try:
            path = checked_path(target, rel)
        except ValueError:
            missing_anchors.append(rel)
            continue
        if not path.is_file():
            missing_anchors.append(rel)
    complete = bool(active) and all(not item['missing'] for item in active)
    ready = (complete and len(active) == 1 and state in ('OK', 'MISSING')
             and (freshness is None or freshness['state'] == 'FRESH') and not missing_anchors)
    report = {
        'status': 'READY' if ready else 'ATTENTION',
        'active_tasks': active[:3],
        'ambiguous': [item['path'] for item in active] if len(active) > 1 else [],
        'checkpoint': 'COMPLETE' if complete else ('INCOMPLETE' if active else 'ABSENT'),
        'cache': state,
        'cache_freshness': (freshness or {}).get('state', 'UNKNOWN'),
        'stale_or_changed': ((freshness or {}).get('changed', []) + (freshness or {}).get('missing', []))[:5],
        'added_sources': ((freshness or {}).get('added') or [])[:5],
        'missing_anchors': missing_anchors[:5],
        'host_loading': 'UNVERIFIED',
        'limits': LIMITS,
    }
    return report


def bounded_summary(report):
    """Estimated output size guard for default summaries (PC/skill budget)."""
    text = json.dumps(report, ensure_ascii=False, indent=2)
    return {'characters': len(text), 'estimated_tokens': (len(text) + 3) // 4}
