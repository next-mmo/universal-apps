"""One-time, branch-local package wiring. Removed from the final tree by its workflow."""
import json
from pathlib import Path

root = Path.cwd()
nd = root / 'packages/nd-workflow'
assert (nd / 'scripts/nd.py').is_file()
assert not (nd / 'package.json').exists()

def write_json(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8')

write_json(nd / 'package.json', {
    'name': '@next-mmo/nd-workflow', 'version': '0.1.0-beta.1',
    'description': 'Framework-independent, evidence-driven AI development workflow. Python core with an optional Node launcher.',
    'type': 'module', 'license': 'MIT', 'bin': {'nd': './bin/nd.mjs'},
    'engines': {'node': '>=20'},
    'scripts': {'test:launcher': 'node --test tests/launcher.test.mjs', 'pack:standalone': 'node bin/nd-package.mjs'},
    'files': ['bin/', 'scripts/', '.agents/', 'docs/', 'plugins/', 'tests/', 'package-files.json',
              'AGENTS.md', 'CLAUDE.md', 'START-HERE.md', 'README.md', 'STANDALONE.md',
              'BENHMARK.md', 'LICENSE', '.gitattributes', '.gitignore', 'IMPORT.json'],
})
write_json(nd / 'IMPORT.json', {
    'schema': 1, 'source': 'https://github.com/next-mmo/nd-workflow',
    'revision': '04d875d63c5eac80d35e5c6fb329dcdefd02a393',
    'tree': '5bc838ce31cf54a85e241f49cc5468568c1cdcff',
    'method': 'Pinned tracked-source import; no nested Git repository or runtime synchronization.',
    'license': 'MIT', 'canonical_path_after_acceptance': 'packages/nd-workflow',
})
manifest_path = nd / 'package-files.json'
manifest = json.loads(manifest_path.read_text())
for name in ['package.json', 'IMPORT.json', 'STANDALONE.md', 'bin/nd.mjs', 'bin/nd-package.mjs',
             'scripts/python-launcher.mjs', 'scripts/package_npm.py',
             'tests/launcher.test.mjs', 'tests/test_standalone_package.py']:
    assert (nd / name).is_file(), name
    if name not in manifest['files']:
        manifest['files'].append(name)
write_json(manifest_path, manifest)
readme = nd / 'README.md'
text = readme.read_text()
first, rest = text.split('\n', 1)
readme.write_text(first + '\n\nStandalone package maintained in a monorepo, with no framework dependency. See [standalone usage and distribution](STANDALONE.md).\n' + rest)
package_path = root / 'package.json'
package = json.loads(package_path.read_text())
assert 'nd' not in package['scripts']
package['scripts']['nd'] = 'node packages/nd-workflow/bin/nd.mjs'
package['scripts']['nd:pack'] = 'node packages/nd-workflow/bin/nd-package.mjs'
write_json(package_path, package)
lock_path = root / 'pnpm-lock.yaml'
lock = lock_path.read_text()
assert '\n  packages/nd-workflow:' not in lock
assert '\npackages:\n' in lock
lock = lock.replace('\npackages:\n', '\n  packages/nd-workflow: {}\n\npackages:\n', 1)
lock_path.write_text(lock)
readme = root / 'README.md'
readme.write_text(readme.read_text() + '\n## Standalone ND Workflow\n\n`packages/nd-workflow` is an independently distributable, general-purpose workflow package. It has no Universal Apps or workspace dependencies. `pnpm nd` exposes its optional Node launcher; Python users can invoke its scripts directly. `pnpm nd:pack` builds an example-free standalone tarball without installing the framework. See [standalone ND usage](packages/nd-workflow/STANDALONE.md). This does not replace this repository\'s agent policy, task board, or framework-specific discovery tools.\n')
print('Standalone package metadata, manifest, workspace scripts, and lockfile wired.')
