#!/usr/bin/env python3
"""Build a closed, example-free npm-compatible tarball using only Python stdlib.

Uses ND's validated core allowlist; no npm, framework, network, or install step.
The output is exclusive-create and must remain inside the package root.
"""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import tarfile

from core_export import collect_core
from package import _check_output_path


def package_npm(root, output):
    root, output = Path(root).absolute(), Path(output).absolute()
    entries = collect_core(root)
    metadata = json.loads(entries['package.json'])
    if metadata.get('name') != '@next-mmo/nd-workflow':
        raise ValueError('Unexpected standalone package name')
    for field in ('dependencies', 'peerDependencies', 'optionalDependencies', 'devDependencies'):
        if metadata.get(field):
            raise ValueError('Standalone ND must not require npm or workspace dependencies')
    errors = _check_output_path(root, output, list(entries))
    if errors:
        raise ValueError('; '.join(errors))
    if output.exists() or output.is_symlink():
        raise FileExistsError('Output already exists; preserved: ' + str(output))
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('xb') as raw:
        with gzip.GzipFile(filename='', fileobj=raw, mode='wb', mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode='w|', format=tarfile.PAX_FORMAT) as archive:
                for name, data in sorted(entries.items()):
                    info = tarfile.TarInfo('package/' + name)
                    info.size = len(data)
                    info.mode = 0o755 if name in ('bin/nd', 'bin/nd.mjs', 'bin/nd-package.mjs') else 0o644
                    archive.addfile(info, io.BytesIO(data))
    with tarfile.open(output, 'r:gz') as archive:
        if sorted(archive.getnames()) != sorted('package/' + name for name in entries):
            raise ValueError('Archive inventory mismatch')
        for member in archive.getmembers():
            if not member.isfile() or archive.extractfile(member).read() != entries[member.name[8:]]:
                raise ValueError('Archive content mismatch: ' + member.name)
    return {'status': 'PASS', 'artifact': str(output), 'entries': len(entries),
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
            'version': metadata['version'], 'runtime': 'Python >=3.10; Node >=20 only for the optional launcher',
            'limits': 'Packaging is not publication, host loading, application acceptance, or measured token savings.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(package_npm(args.root, args.output), indent=2))
        return 0
    except (OSError, ValueError, KeyError, tarfile.TarError) as error:
        print(json.dumps({'status': 'FAIL', 'error': str(error)}))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
