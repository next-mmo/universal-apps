"""Review regressions for portable output paths without weakening link checks."""
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import package


class PackagePathTests(unittest.TestCase):
    def simulate(self, root, output, links, *, platform='darwin'):
        """Model macOS aliases without creating or changing system directories."""
        def resolve(path, strict=False):
            for source, target in sorted(links.items(), key=lambda item: -len(item[0].parts)):
                if path == source or source in path.parents:
                    return target / path.relative_to(source)
            return path

        with patch.object(package.sys, 'platform', platform), \
             patch.object(Path, 'resolve', autospec=True, side_effect=resolve), \
             patch.object(Path, 'is_symlink', autospec=True, side_effect=lambda path: path in links), \
             patch.object(Path, 'exists', return_value=False):
            return package._check_output_path(Path(root), Path(output), [])

    def test_expected_macos_system_aliases_are_accepted(self):
        for name in ('tmp', 'var', 'etc'):
            with self.subTest(alias=name):
                self.assertEqual(self.simulate(
                    f'/{name}/nd-source', f'/{name}/nd-source/artifacts/nd.tgz',
                    {Path('/' + name): Path('/private/' + name)}), [])

    def test_system_alias_exception_is_not_a_general_link_bypass(self):
        cases = [
            ('/var/nd', '/var/nd/out.tgz', {Path('/var'): Path('/unexpected')}, 'darwin'),
            ('/var/nd', '/var/nd/out.tgz', {Path('/var'): Path('/private/var')}, 'linux'),
            ('/private', '/var', {Path('/var'): Path('/private/var')}, 'darwin'),
            ('/var/nd', '/var/nd/linked/out.tgz',
             {Path('/var'): Path('/private/var'),
              Path('/var/nd/linked'): Path('/private/var/nd/real')}, 'darwin'),
            ('/var/nd', '/var/elsewhere/out.tgz', {Path('/var'): Path('/private/var')}, 'darwin'),
        ]
        for root, output, links, platform in cases:
            with self.subTest(root=root, output=output, links=links, platform=platform):
                self.assertTrue(self.simulate(root, output, links, platform=platform))

    @unittest.skipUnless(sys.platform == 'darwin', 'Real macOS alias integration')
    def test_real_macos_alias_builds_both_transports(self):
        from core_export import collect_core
        from package_npm import package_npm

        # Retain the lexical /tmp spelling. Resolving it here hides the defect.
        with tempfile.TemporaryDirectory(prefix='nd-alias-', dir='/tmp') as directory:
            source = Path('/tmp') / Path(directory).name / 'independent-source'
            for name, data in collect_core(ROOT).items():
                destination = source / name
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(data)
            self.assertEqual(package_npm(source, source / 'artifacts/nd.tgz')['status'], 'PASS')
            self.assertEqual(package.package_repo(source, source / 'artifacts/nd.zip')['status'], 'PASS')


if __name__ == '__main__':
    unittest.main()
