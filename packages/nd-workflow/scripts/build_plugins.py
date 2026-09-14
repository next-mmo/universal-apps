"""Build deterministic offline skill plugins. No installation, networking or hooks."""
from pathlib import Path
import argparse
import hashlib
import json
import sys
import zipfile

from validate import validate_repo, is_safe_relative_path
from package import _check_output_path
from core_export import collect_core

ROOT = Path(__file__).resolve().parent.parent

ADAPTER = '''## Plugin resources and project authority
- Locate this SKILL.md through the host-provided skill path. Its plugin root is two directories above; bundled starter resources are in `../../starter/` relative to this skill directory.
- Follow the target project's instructions and approved scope. Bundled files are reference/templates, not authority to overwrite project policy or facts.
- Repo paths in the workflow below mean the target project. If a referenced template/workflow file is missing there, read the matching path under bundled `starter/`; never invent that it already exists in the project.
- For guided project adoption use setup-project and bundled `scripts/setup_project.py --target <project>` preview; apply only an explicitly reviewed plan. `stage_project.py --apply` remains review-copy only. Helpers are under plugin root, not target project. Do not write into installed plugin files or global settings.
- Native skill selectors can namespace these names. Prefer explicit workflow-starter skills when another plugin exposes the same name; do not execute missing sibling paths as shell commands.
- Release operations use the target project's verified commands. Bundled starter scripts validate/package the starter, not arbitrary application code. No hooks, MCP servers, or automatic commands are installed.

'''


def encode(data):
    return (json.dumps(data, indent=2, ensure_ascii=False) + '\n').encode('utf-8')


class BaseProvider:
    """Base provider strategy for target platform bundle generation."""

    manifest_path: str = ''

    def build_identity(self, config: dict) -> dict:
        return {key: config[key] for key in ('name', 'version', 'description')}

    def build_skill_files(self, skill_name: str, root: Path) -> dict[str, bytes]:
        return {}

    def build_extra_files(self, config: dict, root: Path) -> dict[str, bytes]:
        return {}


class ClaudeCodeProvider(BaseProvider):
    manifest_path = '.claude-plugin/plugin.json'


class CursorProvider(BaseProvider):
    manifest_path = '.cursor-plugin/plugin.json'

    def build_extra_files(self, config: dict, root: Path) -> dict[str, bytes]:
        rules = (
            '# Cursor Rules: ND Workflow\n\n'
            + config['description'] + '\n\n'
            + '- Spec before code: Use .agents/templates/PRD.md for new features.\n'
            + '- Checkpoints: Track multi-step work in .agents/templates/TASK.md.\n'
            + '- Verification: Run converge-check before completing tasks.\n'
            + '- Durable learnings: Capture gotchas with compound skill.\n'
        )
        return {'.cursorrules': rules.encode('utf-8')}


class CodexProvider(BaseProvider):
    manifest_path = 'plugin.json'

    def build_identity(self, config: dict) -> dict:
        base = super().build_identity(config)
        return {
            '$schema': 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
            **base,
            'extensions': {
                'com.openai': {
                    'interface': {
                        'displayName': config['displayName'],
                        'shortDescription': config['description'],
                        'defaultPrompt': config['defaultPrompts'],
                        'category': 'Productivity',
                    }
                }
            },
        }

    def build_skill_files(self, skill_name: str, root: Path) -> dict[str, bytes]:
        content = (
            'interface:\n  display_name: '
            + json.dumps('Workflow: ' + skill_name)
            + '\n  short_description: '
            + json.dumps('Project-scoped ' + skill_name + ' workflow')
            + '\n'
        )
        return {f'skills/{skill_name}/agents/openai.yaml': content.encode('utf-8')}


class ChatGPTProvider(BaseProvider):
    manifest_path = '.chatgpt/plugin.json'

    def build_identity(self, config: dict) -> dict:
        base = super().build_identity(config)
        instructions = (
            '# ' + config['displayName'] + ' (Web Chat Plugin)\n\n'
            + config['description'] + '\n\n'
            + '## Operational Environment: Web Chat Without Direct Write\n'
            + 'This assistant operates in web chat environments without direct filesystem write or shell execution access.\n'
            + '- Deliver all files as self-contained code blocks declaring exact relative target paths (e.g. `// filepath: src/auth/token.ts`).\n'
            + '- Provide explicit Git commands for branching, committing (conventional commits), and opening Pull Requests.\n'
            + '- Enforce workflow gates conversationally before delivering code.\n\n'
            + '## Core Workflow Principles\n'
            + '1. Spec before code: For non-trivial capabilities, draft a PRD and pause for explicit scope approval before writing code.\n'
            + '2. Risk-tiered governance: Classify requests as Low, Medium, High, or Critical risk and enforce corresponding verification.\n'
            + '3. Task checkpoints: Break approved scope into step-by-step checklists in `docs/tasks/`.\n'
            + '4. Evidence-first verification: Run converge check against acceptance criteria before PR creation.\n'
            + '5. Durable learnings: Capture reusable technical insights and environment quirks.\n\n'
            + '## Conversation Starters\n'
            + '\n'.join(f'- {p}' for p in config['defaultPrompts']) + '\n'
        )
        return {
            **base,
            'displayName': config['displayName'],
            'instructions': instructions,
            'defaultPrompts': config['defaultPrompts'],
            'category': 'Productivity',
        }

    def build_extra_files(self, config: dict, root: Path) -> dict[str, bytes]:
        instructions = self.build_identity(config)['instructions']
        return {'INSTRUCTIONS.md': instructions.encode('utf-8')}


class WindsurfProvider(BaseProvider):
    manifest_path = '.windsurf/plugin.json'

    def build_identity(self, config: dict) -> dict:
        base = super().build_identity(config)
        return {**base, 'displayName': config['displayName'], 'category': 'Productivity'}

    def build_extra_files(self, config: dict, root: Path) -> dict[str, bytes]:
        rules = (
            '# Windsurf Cascade Rules: ND Workflow\n\n'
            + config['description'] + '\n\n'
            + '## Agent Behavior\n'
            + '- Spec before code: Check or create Delta PRD in docs/prd/ before substantive implementation.\n'
            + '- Task tracking: Maintain active task checklist in docs/tasks/.\n'
            + '- Risk tiers: Match verification intensity to risk level (low, medium, high, critical).\n'
            + '- Verification: Require passing automated tests before marking tasks complete.\n'
            + '- Durable knowledge: Compound environment gotchas and decisions in canonical docs.\n'
        )
        return {
            '.windsurfrules': rules.encode('utf-8'),
            '.windsurf/rules/workflow.md': rules.encode('utf-8'),
        }


class ContinueProvider(BaseProvider):
    manifest_path = '.continue/plugin.json'

    def build_identity(self, config: dict) -> dict:
        base = super().build_identity(config)
        return {**base, 'displayName': config['displayName'], 'category': 'Productivity'}

    def build_extra_files(self, config: dict, root: Path) -> dict[str, bytes]:
        entries = {}
        for skill in config['skills']:
            prompt_body = (
                f'Invoke the workflow skill: {skill}.\n'
                f'Refer to skills/{skill}/SKILL.md and follow its step-by-step instructions.\n'
            )
            entries[f'.continue/prompts/{skill}.prompt'] = prompt_body.encode('utf-8')
        return entries


PROVIDERS: dict[str, BaseProvider] = {
    'claude-code': ClaudeCodeProvider(),
    'cursor': CursorProvider(),
    'codex': CodexProvider(),
    'chatgpt': ChatGPTProvider(),
    'windsurf': WindsurfProvider(),
    'continue': ContinueProvider(),
}

TARGETS = {name: provider.manifest_path for name, provider in PROVIDERS.items()}


def resolve_active_skills(config: dict, skills_override: list[str] | None = None) -> list[str]:
    if skills_override is not None:
        active = [s.strip() for s in skills_override if s.strip()]
        if not active:
            raise ValueError('Empty skills override list')
        return active
    raw_skills = config.get('skills', [])
    if isinstance(raw_skills, dict):
        return [k for k, enabled in raw_skills.items() if enabled]
    if isinstance(raw_skills, list):
        return list(raw_skills)
    raise ValueError('Invalid skills configuration')


def collect(root: Path, target: str, skills_override: list[str] | None = None) -> dict[str, bytes]:
    if target not in PROVIDERS:
        raise ValueError('Unknown target')
    provider = PROVIDERS[target]
    report = validate_repo(root)
    if report['status'] != 'PASS':
        raise ValueError('Core validation failed: ' + '; '.join(report['errors']))
    config = json.loads((root / 'plugins/plugin-config.json').read_text(encoding='utf-8'))
    active_skills = resolve_active_skills(config, skills_override)
    config = {**config, 'skills': active_skills}
    entries: dict[str, bytes] = {}
    source_hashes = {}
    # Core export has its own closed manifest and example-free documentation links.
    core = collect_core(root)
    selected = set(active_skills)
    known = {p.split('/')[2] for p in core if p.startswith('.agents/skills/') and p.endswith('/SKILL.md')}
    if len(selected) != len(active_skills) or not selected <= known:
        raise ValueError('Duplicate or unknown selected skill')
    removed = {p for p in core if '/feedback/' in p or
               (p.startswith('.agents/skills/') and p.split('/')[2] not in selected)}
    core = {p: data for p, data in core.items() if p not in removed}
    # Remove links to intentionally omitted resources from the closed starter.
    import posixpath
    from core_export import LINK
    for p, data in list(core.items()):
        if p.endswith('.md'):
            def rewrite(match):
                dest = match.group(2).split('#', 1)[0]
                resolved = posixpath.normpath(posixpath.join(posixpath.dirname(p), dest))
                return match.group(1) + ' (not included in selected bundle)' if resolved in removed else match.group(0)
            core[p] = LINK.sub(rewrite, data.decode('utf-8')).encode('utf-8')
    if selected != known:
        core['.agents/skill-selection.json'] = encode({'schema': 1, 'skills': active_skills})
    if removed or selected != known:
        manifest = json.loads(core['package-files.json'])
        core['package-files.json'] = encode({**manifest, 'files': sorted(core)})
    upstream_hashes = {}
    for name, data in core.items():
        # Exclude feedback files from plugin bundles
        if '/feedback/' in name or name.endswith('/feedback'):
            continue
        entries['starter/' + name] = data
        source_hashes[name] = hashlib.sha256(data).hexdigest()
        if (root / name).is_file():
            upstream_hashes[name] = hashlib.sha256((root / name).read_bytes()).hexdigest()
    for name in config['skills']:
        if not is_safe_relative_path(name)[0] or '/' in name:
            raise ValueError('Unsafe skill name')
        path = f'.agents/skills/{name}/SKILL.md'
        text = (root / path).read_text(encoding='utf-8')
        header, body = text.split('\n---\n', 1)
        entries[f'skills/{name}/SKILL.md'] = (header + '\n---\n\n' + ADAPTER + body.lstrip('\n')).encode('utf-8')
        prefix = f'.agents/skills/{name}/references/'
        for resource, data in core.items():
            if resource.startswith(prefix):
                if '/feedback/' in resource:
                    continue
                entries[f'skills/{name}/references/' + resource[len(prefix):]] = data
        for subpath, data in provider.build_skill_files(name, root).items():
            entries[subpath] = data

    for subpath, data in provider.build_extra_files(config, root).items():
        entries[subpath] = data

    identity = provider.build_identity(config)
    entries[provider.manifest_path] = encode(identity)
    for helper in ('stage_project.py', 'setup_project.py', 'workflow_doctor.py', 'validate.py', 'core_export.py'):
        entries['scripts/' + helper] = (root / 'scripts' / helper).read_bytes()
    entries['INSTALL.md'] = (root / 'docs/PLUGINS.md').read_bytes()
    entries['bundle.json'] = encode({
        'target': target,
        'name': config['name'],
        'version': config['version'],
        'canonical_sha256': source_hashes,
        'source_sha256': upstream_hashes,
        'profile': 'core',
        'adapter': 'resource-resolution-v2',
        'not_installed': True,
    })
    return entries


def build(root: Path, target: str, output: Path, skills_override: list[str] | None = None) -> dict:
    root = root.resolve()
    output = output.absolute()
    errors = _check_output_path(root, output, [])
    if errors:
        raise ValueError('; '.join(errors))
    if output.exists() or output.is_symlink():
        raise FileExistsError('Output exists; preserved')
    entries = collect(root, target, skills_override=skills_override)
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'x', compression=zipfile.ZIP_DEFLATED) as z:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo(name)
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, data)
    with zipfile.ZipFile(output) as z:
        if z.testzip() is not None or set(z.namelist()) != set(entries):
            raise ValueError('Archive mismatch')
        for name, data in entries.items():
            if z.read(name) != data:
                raise ValueError('Archive byte mismatch')
    return {
        'status': 'PASS',
        'target': target,
        'artifact': str(output),
        'entries': len(entries),
        'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
        'size_bytes': output.stat().st_size,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', choices=sorted(PROVIDERS), required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--skills', help='Comma-separated list of skill names to bundle (overrides plugin-config.json)')
    args = parser.parse_args()
    skills_override = [s.strip() for s in args.skills.split(',') if s.strip()] if args.skills else None
    try:
        print(json.dumps(build(args.root, args.target, Path(args.output), skills_override=skills_override), indent=2))
    except (OSError, ValueError, KeyError) as exc:
        print(json.dumps({'status': 'FAIL', 'error': str(exc)}))
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
