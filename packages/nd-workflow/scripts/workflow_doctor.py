"""Read-only ND Workflow file diagnosis; does not run project or host commands."""
from pathlib import Path
import argparse
import json
import os
import re
from setup_project import safe_target, checked_path, JOURNAL

CORE_PATHS = [
    'AGENTS.md',
    'CLAUDE.md',
    '.agents/docs/PROJECT.md',
    '.agents/docs/ARCHITECTURE.md',
    '.agents/docs/WORKFLOW.md',
]

SKILLS = (
    'nd-setup-project',
    'nd-workflow-doctor',
    'nd-doc-lookup',
    'nd-task-status',
    'nd-spec-feature',
    'nd-converge-check',
    'nd-compound',
    'nd-bump-version',
    'nd-skill-creator',
    'nd-skill-editor',
    'nd-feedback-collector',
    'nd-user-testing',
)

LEGACY_SKILLS = (
    'setup-project',
    'workflow-doctor',
    'doc-lookup',
    'task-status',
    'spec-feature',
    'converge-check',
    'compound',
    'bump-version',
)

TOKEN_BUDGET_THRESHOLD = 2500  # estimated tokens per file (~10KB)


def evaluate_token_efficiency(target, paths):
    """Inspects files for character count, line count, and estimated token footprint.
    Heuristic: (char_count + 3) // 4. Threshold: 2500 tokens.
    """
    file_breakdown = []
    warnings = []
    total_tokens = 0
    has_over_budget = False

    for rel_path in paths:
        path = checked_path(target, rel_path)
        if not path.exists():
            continue
        try:
            with path.open('rb') as handle:
                data = handle.read(100_001)
            if len(data) > 100_000:
                raise ValueError('Too large for bounded diagnosis')
            text = data.decode('utf-8')
        except (OSError, ValueError) as exc:
            warnings.append(f'{rel_path}: token footprint UNKNOWN ({exc})')
            file_breakdown.append({'path': rel_path, 'status': 'UNKNOWN', 'estimated_tokens': None})
            continue
        chars = len(text)
        lines = len(text.splitlines())
        tokens = (chars + 3) // 4
        total_tokens += tokens
        status = 'WITHIN_BUDGET'
        if tokens > TOKEN_BUDGET_THRESHOLD:
            status = 'OVER_BUDGET'
            has_over_budget = True
            warnings.append(f'{rel_path}: {tokens} estimated tokens exceeds budget ({TOKEN_BUDGET_THRESHOLD})')
        file_breakdown.append({
            'path': rel_path,
            'characters': chars,
            'lines': lines,
            'estimated_tokens': tokens,
            'status': status
        })

    return {
        'status': 'TOKEN_BURNER' if has_over_budget else ('UNKNOWN' if warnings or not file_breakdown else 'TOKEN_SAVER'),
        'total_estimated_tokens': total_tokens,
        'threshold_tokens': TOKEN_BUDGET_THRESHOLD,
        'file_breakdown': file_breakdown,
        'warnings': warnings
    }


def inspect_project(target):
    target = safe_target(target)
    findings = []
    missing = []
    unknowns = []
    superpowers = []
    duplicates = []

    # Check core paths
    for name in CORE_PATHS:
        path = checked_path(target, name)
        if not path.exists():
            missing.append(name)
            continue
        if path.stat().st_size > 100_000:
            findings.append({'path': name, 'issue': 'Too large for bounded diagnosis'})
            continue
        text = path.read_text(encoding='utf-8')
        if name.endswith(('PROJECT.md', 'ARCHITECTURE.md')) and 'UNSET' in text:
            unknowns.append(name)
        if name in ('AGENTS.md', 'CLAUDE.md') and re.search('superpowers?', text, re.I):
            superpowers.append(name)
        for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', text):
            link = link.split('#', 1)[0]
            if not link or '://' in link or link.startswith(('mailto:', '#')):
                continue
            candidate = Path(os.path.abspath(path.parent / link))
            if candidate != target and target not in candidate.parents:
                findings.append({'path': name, 'issue': 'Reference outside project; not inspected'})
                continue
            relative = candidate.relative_to(target).as_posix()
            try:
                linked = checked_path(target, relative)
                if not linked.exists():
                    findings.append({'path': name, 'issue': 'Missing reference', 'reference': relative})
            except ValueError:
                findings.append({'path': name, 'issue': 'Unsafe or non-file reference; not inspected'})

    # Explicit bundle selection survives adoption; missing selected files remain errors.
    expected_skills = SKILLS
    selection = checked_path(target, '.agents/skill-selection.json')
    if selection.exists():
        from stage_project import unique_object
        if selection.stat().st_size > 100_000:
            raise ValueError('Skill selection too large')
        metadata = json.loads(selection.read_text(encoding='utf-8'), object_pairs_hook=unique_object)
        values = metadata.get('skills') if isinstance(metadata, dict) else None
        if (not isinstance(metadata, dict) or metadata.get('schema') != 1 or
                not isinstance(values, list) or not all(isinstance(s, str) and s in SKILLS for s in values) or
                len(values) != len(set(values))):
            raise ValueError('Invalid skill selection')
        expected_skills = values
    # Check skills with both nd- and legacy prefix support
    for name in expected_skills:
        cand_nd = f'.agents/skills/{name}/SKILL.md'
        legacy_name = name[3:] if name.startswith('nd-') else name
        cand_legacy = f'.agents/skills/{legacy_name}/SKILL.md'
        path_nd = checked_path(target, cand_nd)
        path_legacy = checked_path(target, cand_legacy)
        active_path = None
        if path_nd.exists():
            active_path = path_nd
            active_name = cand_nd
        elif path_legacy.exists():
            active_path = path_legacy
            active_name = cand_legacy
        else:
            missing.append(cand_nd)
            continue

        if active_path.stat().st_size > 100_000:
            findings.append({'path': active_name, 'issue': 'Too large for bounded diagnosis'})
            continue

        text = active_path.read_text(encoding='utf-8')
        for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', text):
            link = link.split('#', 1)[0]
            if not link or '://' in link or link.startswith(('mailto:', '#')):
                continue
            candidate = Path(os.path.abspath(active_path.parent / link))
            if candidate != target and target not in candidate.parents:
                findings.append({'path': active_name, 'issue': 'Reference outside project; not inspected'})
                continue
            relative = candidate.relative_to(target).as_posix()
            try:
                linked = checked_path(target, relative)
                if not linked.exists():
                    findings.append({'path': active_name, 'issue': 'Missing reference', 'reference': relative})
            except ValueError:
                findings.append({'path': active_name, 'issue': 'Unsafe or non-file reference; not inspected'})

        # Check claude duplicates
        candidate_claude = checked_path(target, f'.claude/skills/{name}/SKILL.md')
        candidate_claude_legacy = checked_path(target, f'.claude/skills/{legacy_name}/SKILL.md')
        if (candidate_claude.exists() or candidate_claude_legacy.exists()) and active_path.exists():
            duplicates.append(name)

    # Evaluate token efficiency for present files
    inspected_paths = [p for p in CORE_PATHS if checked_path(target, p).exists()]
    skills_dir = target / '.agents' / 'skills'
    if skills_dir.exists() and skills_dir.is_dir():
        for skill_dir in sorted(skills_dir.iterdir()):
            if skill_dir.is_dir():
                skill_md = skill_dir / 'SKILL.md'
                if skill_md.exists():
                    rel = skill_md.relative_to(target).as_posix()
                    if rel not in inspected_paths:
                        inspected_paths.append(rel)
    token_efficiency = evaluate_token_efficiency(target, inspected_paths)

    journal = target / JOURNAL
    from stage_project import reject_links
    reject_links(journal)
    journal_state = 'ABSENT'
    if journal.exists():
        complete = checked_path(target, JOURNAL + '/COMPLETE')
        journal_state = 'COMPLETE_MARKER_PRESENT' if complete.exists() else 'INCOMPLETE_REVIEW_REQUIRED'

    has_token_burner = token_efficiency['status'] != 'TOKEN_SAVER'
    context_health = {'status': 'UNAVAILABLE', 'reason': 'context_index import failed'}
    try:
        from context_index import context_check
        ctx = context_check(target)
        context_health = {
            'status': ctx.get('status', 'UNAVAILABLE'),
            'checkpoint': ctx.get('checkpoint', 'UNKNOWN'),
            'active_tasks': [item.get('path') for item in ctx.get('active_tasks', [])],
            'ambiguous': ctx.get('ambiguous', []),
            'cache': ctx.get('cache', 'UNKNOWN'),
            'cache_freshness': ctx.get('cache_freshness', 'UNKNOWN'),
            'missing_anchors': ctx.get('missing_anchors', []),
            'host_loading': 'UNVERIFIED',
        }
    except (OSError, ValueError, ImportError) as error:
        context_health = {'status': 'UNAVAILABLE', 'reason': str(error)[:200]}
    return {
        'status': 'ATTENTION' if missing or unknowns or findings or superpowers or duplicates or has_token_burner or journal_state == 'INCOMPLETE_REVIEW_REQUIRED' else 'FILES_PRESENT',
        'project': str(target),
        'package_available': 'DOCTOR_EXECUTABLE',
        'project_adoption': 'INCOMPLETE' if missing or unknowns or findings else 'REQUIRES_SEMANTIC_REVIEW',
        'host_loading': 'UNVERIFIED',
        'application_baseline': 'NOT_RUN',
        'context_health': context_health,
        'missing': missing,
        'template_unknowns': unknowns,
        'findings': findings,
        'superpowers_references': superpowers,
        'potential_duplicate_skills': duplicates,
        'journal': journal_state,
        'token_efficiency': token_efficiency,
        'next_action': 'Review file findings, inspect host context in a fresh session, then run approved source-backed application checks. No global configuration inspected.'
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', type=Path, required=True)
    args = parser.parse_args()
    try:
        result = inspect_project(args.target)
        print(json.dumps(result, indent=2))
        return 0 if result['status'] == 'FILES_PRESENT' else 2
    except (OSError, ValueError, TypeError) as exc:
        print(json.dumps({'status': 'FAIL', 'error': str(exc)}))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
