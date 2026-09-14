"""Create a closed, example-free starter export without modifying source files."""
from pathlib import Path
import json
import posixpath
import re

from validate import load_manifest, validate_repo

EXAMPLE_PREFIXES = ('example/', 'examples/')
LINK = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')


def encode(data):
    return (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def collect_core(root: Path) -> dict[str, bytes]:
    # validate_repo bails before source content reads on unsafe manifest paths.
    report = validate_repo(root)
    if report['status'] != 'PASS':
        raise ValueError('Core source validation failed: ' + '; '.join(report['errors']))
    manifest, errors = load_manifest(root)
    if errors:
        raise ValueError('; '.join(errors))
    files = [name for name in manifest['files'] if not name.startswith(EXAMPLE_PREFIXES)]
    entries = {}
    for name in files:
        data = (root / name).read_bytes()
        if name.endswith('.md'):
            def replace_link(match):
                target = match.group(2).split('#', 1)[0]
                resolved = posixpath.normpath(posixpath.join(posixpath.dirname(name), target))
                if resolved.startswith(EXAMPLE_PREFIXES):
                    return match.group(1) + ' (optional example; available in full source distribution)'
                return match.group(0)
            data = LINK.sub(replace_link, data.decode('utf-8')).encode('utf-8')
        entries[name] = data
    # Generate the exact export inventory; never leave missing example entries.
    entries['package-files.json'] = encode({**manifest, 'files': files})
    return entries
