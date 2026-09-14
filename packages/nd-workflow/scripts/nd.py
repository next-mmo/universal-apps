#!/usr/bin/env python3
"""Small ND command facade. File estimates are not model usage measurements."""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Existing tooling uses sibling imports, including when invoked as scripts.nd.
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
from setup_project import checked_path, safe_target
from stage_project import reject_links


def detect_stack(target):
    """Return supported command with provenance; never fabricate a test script."""
    target = safe_target(target)
    result = {'name': 'Unknown', 'test_cmd': None, 'argv': None, 'source': None}
    for name in ('Cargo.toml', 'package.json', 'go.mod', 'pyproject.toml', 'setup.py'):
        path = checked_path(target, name)
        if not path.exists():
            continue
        result['source'] = name
        if name == 'Cargo.toml':
            result.update(name='Rust', argv=['cargo', 'test'])
        elif name == 'go.mod':
            result.update(name='Go', argv=['go', 'test', './...'])
        elif name == 'package.json':
            data = json.loads(path.read_text(encoding='utf-8-sig'))
            result['name'] = 'Node.js / TypeScript'
            if not isinstance(data, dict):
                raise ValueError('package.json must contain an object')
            scripts = data.get('scripts', {})
            test = scripts.get('test') if isinstance(scripts, dict) else None
            if not isinstance(test, str) or not test.strip():
                break
            manager_value = data.get('packageManager', '')
            if not isinstance(manager_value, str):
                raise ValueError('packageManager must be a string')
            manager = manager_value.split('@')[0]
            locks = [(m, checked_path(target, p)) for m, p in (
                ('pnpm', 'pnpm-lock.yaml'), ('yarn', 'yarn.lock'), ('npm', 'package-lock.json'))]
            present = {m for m, p in locks if p.exists()}
            if manager and manager not in ('npm', 'pnpm', 'yarn'):
                break
            if len(present) > 1 or (manager and present and manager not in present):
                break
            manager = manager or next(iter(present), 'npm')
            result.update(argv=[manager, 'test'], source='package.json scripts.test / packageManager / lockfiles')
        else:
            result['name'] = 'Python'
            # A Python manifest does not select pytest vs unittest or prove discovery.
            break
        break
    if result['argv']:
        result['test_cmd'] = ' '.join(result['argv'])
    return result


def cmd_init(target_path='.', plan=None, apply_plan=None):
    """Delegate to canonical preview/hash-bound adoption; no silent file copying."""
    target = safe_target(Path(target_path))
    argv = [sys.executable, str(ROOT / 'scripts' / 'setup_project.py'), '--target', str(target)]
    if plan:
        argv += ['--plan', str(plan)]
    if apply_plan:
        argv += ['--apply-plan', str(apply_plan)]
    print('Reviewed adoption: preview only unless --apply-plan is supplied. Host loading remains unverified.', flush=True)
    result = subprocess.run(argv, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    try:
        report = json.loads(result.stdout)
    except json.JSONDecodeError:
        print(result.stdout.strip())
    else:
        if 'entries' in report:
            entries = report['entries']
            counts = {action: sum(e['action'] == action for e in entries) for action in ('add', 'reuse', 'conflict')}
            print(json.dumps({'status': 'PREVIEW', 'target': str(target), 'counts': counts,
                              'conflicts': [e['path'] for e in entries if e['action'] == 'conflict'][:10]}))
            print('No files applied. Save full plan with --plan outside target; review before --apply-plan.')
        else:
            print(json.dumps(report))
    return result.returncode


def cmd_doctor(target_path='.'):
    from workflow_doctor import inspect_project
    report = inspect_project(safe_target(Path(target_path)))
    summary = {key: report.get(key) for key in ('status', 'project_adoption', 'host_loading',
                                                'application_baseline', 'context_health')}
    for key in ('missing', 'findings', 'template_unknowns'):
        values = report.get(key, [])
        summary[key + '_count'] = len(values)
        summary[key + '_sample'] = values[:3]
    print(json.dumps(summary, indent=2))
    print('File presence is not semantic adoption, host loading, or application verification. Full detail: scripts/workflow_doctor.py --target PROJECT')
    # 0 means file checks clean, not a deployment or model compliance certificate.
    return 0 if report.get('status') == 'FILES_PRESENT' else 1


def cmd_check(target_path='.'):
    target = safe_target(Path(target_path))
    stack = detect_stack(target)
    if not stack['argv']:
        print('UNVERIFIED: no unambiguous supported test command. Inspect project manifests/docs and run approved checks explicitly.')
        return 2
    argv = stack['argv'][:]
    executable = shutil.which(argv[0])
    if not executable:
        print(f'UNVERIFIED: {argv[0]} missing. No software installed.')
        return 2
    argv[0] = executable
    print(f"Project code execution: {stack['test_cmd']} (source: {stack['source']}). Trust project scripts before running.", flush=True)
    started = time.perf_counter()
    code = subprocess.call(argv, cwd=target, shell=False)
    print(f'Command exit={code}; elapsed={time.perf_counter() - started:.3f}s. Check test counts and coverage; exit 0 alone does not prove acceptance.')
    return code


def token_inventory(target_path='.'):
    target = safe_target(Path(target_path))
    entries = []
    for name in ('AGENTS.md', 'CLAUDE.md'):
        path = checked_path(target, name)
        if path.is_file():
            text = path.read_text(encoding='utf-8')
            entries.append({'path': name, 'characters': len(text), 'estimated_tokens': (len(text) + 3) // 4})
    skills = checked_path(target, '.agents/skills') if not (target / '.agents/skills').is_dir() else target / '.agents/skills'
    reject_links(skills)
    skill_entries = []
    if skills.is_dir():
        for directory in sorted(skills.iterdir()):
            reject_links(directory)
            if directory.is_dir():
                path = directory / 'SKILL.md'
                reject_links(path)
                if path.is_file():
                    text = path.read_text(encoding='utf-8')
                    skill_entries.append({'path': path.relative_to(target).as_posix(), 'estimated_tokens': (len(text) + 3) // 4})
    return {
        'status': 'ESTIMATE' if any(e['path'] == 'AGENTS.md' for e in entries) else 'UNKNOWN',
        'method': 'ceil(Unicode character count / 4), not a tokenizer or runtime measurement',
        'root_instruction_files': entries,
        'root_estimated_tokens': sum(e['estimated_tokens'] for e in entries),
        'available_skill_bodies': skill_entries,
        'available_skill_body_estimated_tokens': sum(e['estimated_tokens'] for e in skill_entries),
        'limits': 'Host imports, skill metadata/index, referenced docs, nested policies, caching, repeated inputs, tool outputs and actual context loading are unmeasured. No competitor ranking or per-session savings inferred.'
    }


def cmd_tokens(target_path='.'):
    report = token_inventory(target_path)
    print(json.dumps(report, indent=2))
    return 0 if report['status'] == 'ESTIMATE' else 2


def cmd_task(title, target_path='.'):
    target = safe_target(Path(target_path))
    if not title.strip() or len(title) > 120 or any(ord(c) < 32 for c in title):
        raise ValueError('Task title must be 1-120 characters on one line')
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:80]
    if not slug:
        raise ValueError('Task title needs an ASCII letter or number for filename')
    name = f'docs/tasks/wip-{time.strftime("%Y%m%d")}-{slug}.md'
    path = checked_path(target, name)
    if path.exists():
        raise FileExistsError('Task already exists; preserved. Resume exact task instead.')
    content = f'''# Task: {title}

- Mode: draft; this scaffold does not authorize implementation
- Risk / scope approval: pending; highest applicable risk wins
- Owner / branch / write scope: pending
- Goal: {title}

## Acceptance Criteria
- [ ] Record approved outcomes and feature/doc consumers before implementation

## Checkpoint
- Decisions / affected docs / context index: pending
- Source-backed verification command / tested inputs / result: not run
- Blockers / next action: review scope, risk, ownership and acceptance
- Status: draft; implemented, integrated and deployed remain unverified
'''
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x', encoding='utf-8') as stream:
        stream.write(content)
    print(f'Created draft checkpoint: {name}')
    return 0


def _print_bounded(report, budget_tokens=500):
    """Print one JSON report plus an honest footprint line; no silent truncation."""
    text = json.dumps(report, indent=2)
    print(text)
    print(f'Output footprint: {len(text)} characters (~{(len(text) + 3) // 4} estimated tokens; '
          f'budget {budget_tokens}). Estimation is heuristic, not model usage.')


def cmd_context_check(target_path='.'):
    """Read-only audit; an index never grants approval or ownership."""
    from context_index import context_check
    report = context_check(safe_target(Path(target_path)))
    _print_bounded(report)
    print('Checkpoint fields, approval and ownership come from task files, never from the index.')
    return 0 if report['status'] == 'READY' else 2


def cmd_context_locate(topic, target_path='.', limit=5, include_history=False):
    from context_index import locate
    report = locate(safe_target(Path(target_path)), topic, limit=limit, include_history=include_history)
    _print_bounded(report)
    if not report['results']:
        print('No match in indexed or scoped live sources. Absence of a match is not proof that no document exists; widen the search explicitly.')
        return 2
    return 0


def cmd_index_build(target_path='.'):
    from context_index import build_index, cache_rel_path, save_cache
    target = safe_target(Path(target_path))
    payload = build_index(target)
    path = save_cache(target, payload)
    classes = {}
    for entry in payload['entries']:
        classes[entry['class']] = classes.get(entry['class'], 0) + 1
    print(json.dumps({
        'status': 'BUILT',
        'cache': cache_rel_path(),
        'entries': len(payload['entries']),
        'by_class': classes,
        'git': payload['git'].get('head') or payload['git'].get('status'),
        'limits': payload['limits'],
    }, indent=2))
    print(f'Wrote derived cache to {path.relative_to(target).as_posix()}; it is disposable and must be ignored by Git.')
    return 0


def cmd_index_check(target_path='.'):
    from context_index import cache_rel_path, check_freshness, load_cache
    target = safe_target(Path(target_path))
    state, payload = load_cache(target)
    if state != 'OK':
        print(json.dumps({'status': state, 'cache': cache_rel_path(),
                          'next_action': 'Run `nd index build` to create a derived cache; live lookup still works without it.'}, indent=2))
        return 2
    report = check_freshness(target, payload)
    report['cache'] = cache_rel_path()
    print(json.dumps(report, indent=2))
    print('A FRESH fingerprint means files match the cache, not that docs agree with current behavior.')
    return 0 if report['state'] == 'FRESH' else 2


def cmd_plugins(output_dir='artifacts/plugins'):
    output = Path(os.path.abspath(output_dir))
    reject_links(output)
    for target in ('claude-code', 'cursor', 'windsurf', 'codex', 'continue', 'chatgpt'):
        code = subprocess.call([sys.executable, str(ROOT / 'scripts/build_plugins.py'),
                                '--target', target, '--output', str(output / f'nd-workflow-{target}.zip')])
        if code:
            return code
    print('Bundles generated; host installation/discovery and runtime behavior unverified.')
    return 0


def cmd_handover(target_path='.', prompt=False):
    """Inspect active task and output verified handover status or fresh-agent prompt."""
    target = safe_target(Path(target_path))
    from context_index import context_check
    check = context_check(target)
    active = check.get('active_tasks', [])

    if not active:
        print(json.dumps({
            'status': 'NO_ACTIVE_TASK',
            'target': str(target),
            'message': 'No active task found in docs/tasks/ (no wip-*.md or blocked-*.md).',
            'next_action': 'Run `nd task "<title>"` to start a tracked task before handover.'
        }, indent=2))
        return 1

    task_info = active[0]
    fields = task_info.get('fields', {})
    task_path = task_info.get('path', 'unknown')
    owner = fields.get('owner', 'unassigned')
    scope_approval = fields.get('scope_approval', 'unapproved')
    next_action = fields.get('next_action', 'none recorded')
    revision = task_info.get('revision', 'UNKNOWN')

    if prompt:
        print('=' * 60)
        print('ND FRESH-SESSION HANDOVER PROMPT (Ready to paste into successor agent)')
        print('=' * 60)
        print('Resume work on this project under ND Workflow:')
        print(f'1. Active Task: {task_path}')
        print(f'   - Owner: {owner}')
        print(f'   - Scope Approval: {scope_approval}')
        print(f'   - Next Action: {next_action}')
        print(f'   - Git Base Revision: {revision}')
        print('2. Core Policy:')
        print('   - Consult AGENTS.md for risk precedence.')
        print(f'   - Inspect {task_path} before editing code.')
        print('   - Fail closed: run project tests before claiming completion.')
        print('=' * 60)
        return 0

    print(json.dumps({
        'status': 'HANDOVER_READY',
        'task': task_path,
        'owner': owner,
        'scope_approval': scope_approval,
        'next_action': next_action,
        'revision': revision,
        'checkpoint_health': check.get('checkpoint'),
        'hint': 'Run `nd handover --prompt` to generate prompt text for the successor agent.'
    }, indent=2))
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    init = sub.add_parser('init', help='Preview adoption; optionally save/apply reviewed plan')
    init.add_argument('target', nargs='?', default='.')
    group = init.add_mutually_exclusive_group()
    group.add_argument('--plan')
    group.add_argument('--apply-plan')
    for name in ('doctor', 'check', 'tokens'):
        command = sub.add_parser(name)
        command.add_argument('target', nargs='?', default='.')
    task = sub.add_parser('task', help='Create exclusive draft checkpoint')
    task.add_argument('title')
    task.add_argument('--target', default='.')
    context = sub.add_parser('context', help='Read-only context audit and bounded lookup')
    context_sub = context.add_subparsers(dest='context_command', required=True)
    check_cmd = context_sub.add_parser('check', help='Audit active task, approval, anchors, freshness')
    check_cmd.add_argument('target', nargs='?', default='.')
    locate_cmd = context_sub.add_parser('locate', help='Bounded ranked lookup (max five routes)')
    locate_cmd.add_argument('topic')
    locate_cmd.add_argument('--target', default='.')
    locate_cmd.add_argument('--limit', type=int, default=5)
    locate_cmd.add_argument('--include-history', action='store_true',
                            help='Explicit opt-in to completed/archived tasks')
    index = sub.add_parser('index', help='Derived, disposable context cache')
    index_sub = index.add_subparsers(dest='index_command', required=True)
    for name in ('build', 'check'):
        index_cmd = index_sub.add_parser(name)
        index_cmd.add_argument('target', nargs='?', default='.')
    plugins = sub.add_parser('plugins')
    plugins.add_argument('--output', default='artifacts/plugins')
    handover = sub.add_parser('handover', help='Generate fresh-session handover prompt and state')
    handover.add_argument('target', nargs='?', default='.')
    handover.add_argument('--prompt', action='store_true', help='Output ready-to-paste fresh agent bootstrap prompt')
    args = parser.parse_args()
    try:
        if args.command == 'init':
            return cmd_init(args.target, args.plan, args.apply_plan)
        if args.command == 'task':
            return cmd_task(args.title, args.target)
        if args.command == 'plugins':
            return cmd_plugins(args.output)
        if args.command == 'handover':
            return cmd_handover(args.target, prompt=args.prompt)
        if args.command == 'context':
            if args.context_command == 'check':
                return cmd_context_check(args.target)
            return cmd_context_locate(args.topic, args.target, args.limit, args.include_history)
        if args.command == 'index':
            return {'build': cmd_index_build, 'check': cmd_index_check}[args.index_command](args.target)
        return {'doctor': cmd_doctor, 'check': cmd_check, 'tokens': cmd_tokens}[args.command](args.target)
    except (ValueError, OSError, TypeError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
