"""Preview guided adoption; apply only an explicitly reviewed, hash-bound plan."""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import os

from stage_project import bundle_files, reject_links, unique_object
from validate import is_safe_relative_path, looks_like_secret

SCHEMA = 1
JOURNAL = '.nd-workflow-adoption'
MAX_PLAN = 4_000_000


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe_target(target):
    target = Path(os.path.abspath(target))
    reject_links(target)
    if not target.is_dir():
        raise ValueError('Target must be an existing directory')
    return target


def checked_path(target, name):
    if not isinstance(name, str) or not is_safe_relative_path(name)[0] or looks_like_secret(name):
        raise ValueError('Unsafe adoption path')
    current = target
    for part in name.split('/'):
        if current.exists():
            if not current.is_dir():
                raise ValueError('Non-directory ancestor: ' + name)
            matches = [p.name for p in current.iterdir() if p.name.casefold() == part.casefold()]
            if matches and matches != [part]:
                raise ValueError('Case collision: ' + name)
        current = current / part
        reject_links(current)
    if current.exists() and not current.is_file():
        raise ValueError('Not a regular file: ' + name)
    return current


def before_hash(path):
    return digest(path.read_bytes()) if path.exists() else None


def source_files(source):
    source = safe_target(source)
    metadata = source / 'bundle.json'
    if metadata.exists() or metadata.is_symlink():
        return bundle_files(source)
    from core_export import collect_core
    return collect_core(source)


def adoption_files(source):
    # Keep resource closure, but do not transplant repository-maintenance files.
    files = source_files(source)
    internal_skills = {'nd-setup-project', 'nd-skill-creator', 'nd-skill-editor'}
    internal_docs = {'docs/PLUGINS.md', 'docs/ONBOARDING.md'}
    selected = {name: data for name, data in files.items()
                if (name in ('AGENTS.md', 'CLAUDE.md') or name.startswith(('.agents/', 'docs/')))
                and name not in internal_docs
                and not (name.startswith('.agents/skills/') and name.split('/')[2] in internal_skills)}
    skills = sorted({name.split('/')[2] for name in selected
                     if name.startswith('.agents/skills/') and name.endswith('/SKILL.md')})
    selected['.agents/skill-selection.json'] = (json.dumps({'schema': 1, 'skills': skills}, indent=2) + '\n').encode('utf-8')
    # Ensure adoption journal is gitignored in adopted projects.
    selected['.gitignore'] = b'# ND Workflow adoption recovery journal (private project text)\n.nd-workflow-adoption/\n'
    from core_export import LINK
    import posixpath
    excluded = set(files) - set(selected)
    for name, data in selected.items():
        if name.endswith('.md'):
            def replace_link(match):
                link = match.group(2).split('#', 1)[0]
                resolved = posixpath.normpath(posixpath.join(posixpath.dirname(name), link))
                if resolved in files and resolved not in selected:
                    return match.group(1) + ' (reference in original ND Workflow package)'
                return match.group(0)
            text = data.decode('utf-8')
            # Drop catalog rows for package-only resources rather than advertising
            # setup/authoring tools as installed end-user capabilities.
            lines = []
            for line in text.splitlines(keepends=True):
                targets = [posixpath.normpath(posixpath.join(posixpath.dirname(name), m.group(2).split('#', 1)[0]))
                           for m in LINK.finditer(line)]
                if name in ('AGENTS.md', 'docs/README.md') and any(t in excluded for t in targets):
                    continue
                lines.append(line)
            selected[name] = LINK.sub(replace_link, ''.join(lines)).encode('utf-8')
    return selected


def warn_nested_source(source, target):
    """Location warning only: never move/delete a source clone during adoption."""
    import sys
    source = safe_target(source)
    target = safe_target(target)
    if source == target:
        raise ValueError('Source and adoption target must be different directories')
    if target in source.parents:
        print(f'REVIEW_REQUIRED: source {source} is inside target {target}. '
              'Recommend source outside project; ask user before relocating. '
              'No files moved or deleted; nested instructions may cause duplicate discovery.', file=sys.stderr)


def preview(source, target):
    target = safe_target(target)
    warn_nested_source(source, target)
    files = adoption_files(source)
    entries = []
    for name, data in sorted(files.items()):
        path = checked_path(target, name)
        before = before_hash(path)
        after = digest(data)
        entries.append({'path': name, 'source_sha256': after, 'before_sha256': before,
                        'action': 'add' if before is None else 'reuse' if before == after else 'conflict',
                        'merged_text': None})
    return {'schema': SCHEMA, 'target': str(target), 'entries': entries}


def load_plan(path):
    reject_links(path)
    if path.stat().st_size > MAX_PLAN:
        raise ValueError('Plan too large')
    return json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=unique_object)


def validate_plan(source, target, plan):
    target = safe_target(target)
    warn_nested_source(source, target)
    if not isinstance(plan, dict) or set(plan) != {'schema', 'target', 'entries'} or type(plan['schema']) is not int or plan['schema'] != SCHEMA:
        raise ValueError('Invalid plan schema')
    if plan['target'] != str(target):
        raise ValueError('Plan target mismatch')
    entries = plan['entries']
    if not isinstance(entries, list) or not entries or len(entries) > 1000:
        raise ValueError('Invalid entries')
    # Validate every name before reading destination content.
    seen = set()
    for entry in entries:
        if not isinstance(entry, dict) or set(entry) != {'path', 'source_sha256', 'before_sha256', 'action', 'merged_text'}:
            raise ValueError('Invalid entry schema')
        path = checked_path(target, entry['path'])
        folded = entry['path'].casefold()
        if folded in seen:
            raise ValueError('Duplicate plan path')
        seen.add(folded)
    files = adoption_files(source)
    if set(files) != {entry['path'] for entry in entries}:
        raise ValueError('Plan inventory differs from source; regenerate preview')
    writes = []
    for entry in entries:
        name = entry['path']
        data = files[name]
        path = checked_path(target, name)
        before = before_hash(path)
        if entry['source_sha256'] != digest(data) or entry['before_sha256'] != before:
            raise ValueError('Stale source or target: ' + name)
        action = entry['action']
        if action not in ('add', 'reuse', 'merge', 'skip'):
            raise ValueError('Resolve conflict before apply: ' + name)
        if action != 'merge' and entry['merged_text'] is not None:
            raise ValueError('Only merge accepts merged_text')
        if action == 'add' and before is not None:
            raise ValueError('Add cannot overwrite: ' + name)
        if action == 'reuse' and before != digest(data):
            raise ValueError('Reuse must match source: ' + name)
        if action == 'merge':
            if before is None or not isinstance(entry['merged_text'], str):
                raise ValueError('Merge requires existing file and reviewed merged_text')
            data = entry['merged_text'].encode('utf-8')
        if action in ('add', 'merge'):
            writes.append((name, before, data))
    return target, writes


def write_exclusive(path, data):
    with path.open('xb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def apply_plan(source, target, plan):
    target, writes = validate_plan(source, target, plan)
    journal = target / JOURNAL
    reject_links(journal)
    if journal.exists():
        raise FileExistsError('Adoption journal exists; inspect prior run before another apply')
    if not writes:
        return {'status': 'NO_CHANGES', 'writes': 0, 'host_loading': 'UNVERIFIED', 'application_baseline': 'NOT_RUN'}
    # Parent journal stays for recovery even if any later write fails.
    journal.mkdir()
    records = []
    for name, before, data in writes:
        path = checked_path(target, name)
        old = path.read_bytes() if before is not None else None
        if (digest(old) if old is not None else None) != before:
            raise ValueError('Target changed before backup: ' + name)
        records.append({'path': name, 'before_sha256': before, 'after_sha256': digest(data),
                        'before_base64': base64.b64encode(old).decode() if old is not None else None,
                        'after_base64': base64.b64encode(data).decode()})
    write_exclusive(journal / 'recovery.json', (json.dumps({'schema': SCHEMA, 'target': str(target), 'files': records}, indent=2) + '\n').encode())
    # Recheck complete plan after durable backups, before touching live files.
    validate_plan(source, target, plan)
    for index, (name, before, data) in enumerate(writes):
        path = checked_path(target, name)
        if before_hash(path) != before:
            raise ValueError('Target changed during apply: ' + name)
        write_exclusive(journal / f'{index:04d}.intent', name.encode('utf-8'))
        path.parent.mkdir(parents=True, exist_ok=True)
        checked_path(target, name)
        if before is None:
            write_exclusive(path, data)
        else:
            pending = journal / f'{index:04d}.pending'
            write_exclusive(pending, data)
            if before_hash(path) != before:
                raise ValueError('Target changed during merge: ' + name)
            os.replace(pending, path)
        write_exclusive(journal / f'{index:04d}.done', digest(data).encode())
    write_exclusive(journal / 'COMPLETE', b'File application complete; host and app checks remain unverified.\n')
    return {'status': 'APPLIED', 'writes': len(writes), 'journal': str(journal),
            'host_loading': 'UNVERIFIED', 'application_baseline': 'NOT_RUN'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', required=True, type=Path)
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--plan', type=Path, help='Write exclusive review plan outside target; default prints preview')
    group.add_argument('--apply-plan', type=Path, help='Apply explicitly reviewed plan; target must match')
    args = parser.parse_args()
    source = Path(__file__).resolve().parent.parent
    try:
        if args.apply_plan:
            result = apply_plan(source, args.target, load_plan(args.apply_plan))
        else:
            result = preview(source, args.target)
            if args.plan:
                output = Path(os.path.abspath(args.plan))
                reject_links(output)
                target = safe_target(args.target)
                if output == target or target in output.parents:
                    raise ValueError('Save review plan outside target to keep preview non-mutating')
                write_exclusive(output, (json.dumps(result, indent=2) + '\n').encode())
        print(json.dumps(result, indent=2))
        return 0
    except (OSError, ValueError, TypeError, KeyError) as exc:
        print(json.dumps({'status': 'FAIL', 'error': str(exc)}))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
