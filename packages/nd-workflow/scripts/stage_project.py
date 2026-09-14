"""Preview or stage core workflow files from source or a bundle; never merge live files."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import re

from validate import is_safe_relative_path, looks_like_secret

STAGE = '.workflow-starter-review'


def linked(path):
    return path.is_symlink() or (os.name == 'nt' and path.exists() and bool(path.lstat().st_file_attributes & 1024))


def top_level_component(path):
    """True for the filesystem root and its direct children.

    Those components belong to the operating system, not to the project
    path a caller controls: macOS ships /var, /tmp and /etc as symlinks
    into /private, so treating them as escapes would refuse every target
    reached through a platform directory such as the system temp dir.
    """
    parent = path.parent
    return parent == Path(parent.anchor)


def reject_links(path):
    # The requested path is always inspected. Above it, only
    # caller-controlled components are; the walk stops at the platform's
    # top level instead of continuing to the filesystem root.
    for index, candidate in enumerate((path, *path.parents)):
        if index and top_level_component(candidate):
            break
        if linked(candidate):
            raise ValueError('Path contains link/reparse point')


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate metadata key: ' + key)
        result[key] = value
    return result


def bundle_files(plugin):
    metadata_path = plugin / 'bundle.json'
    reject_links(metadata_path)
    metadata = json.loads(metadata_path.read_text(encoding='utf-8'), object_pairs_hook=unique_object)
    files = metadata.get('canonical_sha256') if isinstance(metadata, dict) else None
    if not isinstance(files, dict) or not files:
        raise ValueError('Bundle requires a nonempty checksum map')
    seen = set()
    # Validate the entire plan before reading any bundled content.
    for name, digest in files.items():
        safe, reason = is_safe_relative_path(name)
        if not safe or looks_like_secret(name):
            raise ValueError('Unsafe bundled path: ' + name + ' ' + reason)
        if name.casefold() in seen:
            raise ValueError('Case-fold duplicate bundled path')
        seen.add(name.casefold())
        if not isinstance(digest, str) or not re.fullmatch('[0-9a-f]{64}', digest):
            raise ValueError('Invalid bundle checksum')
        source = plugin / 'starter' / name
        reject_links(source)
        if not source.is_file():
            raise ValueError('Bundle source must be a regular file: ' + name)
    planned = {}
    for name, digest in files.items():
        source = plugin / 'starter' / name
        reject_links(source)
        data = source.read_bytes()
        if hashlib.sha256(data).hexdigest() != digest:
            raise ValueError('Bundle checksum mismatch: ' + name)
        planned[name] = data
    return planned


def stage(plugin, target, apply=False):
    plugin = plugin.absolute()
    target = target.absolute()
    reject_links(plugin)
    reject_links(target)
    if not target.is_dir():
        raise ValueError('Target must be an existing project directory')
    destination = target / STAGE
    if destination.exists() or linked(destination):
        raise FileExistsError('Review staging directory exists; preserved')
    metadata_path = plugin / 'bundle.json'
    # A present but invalid bundle must never silently fall back to source mode.
    if metadata_path.exists() or linked(metadata_path):
        planned = bundle_files(plugin)
        mode = 'bundle'
    else:
        from core_export import collect_core
        planned = collect_core(plugin)
        mode = 'source'
    result = {
        'status': 'PREVIEW', 'source_mode': mode, 'profile': 'core',
        'target': str(target), 'stage': str(destination), 'files': len(planned),
        'project_collisions': [name for name in planned if (target / name).exists() or linked(target / name)],
        'note': 'No files merged; inspect staged content and merge deliberately.',
    }
    if apply:
        destination.mkdir(exist_ok=False)
        for name, data in planned.items():
            out = destination / name
            reject_links(out)
            out.parent.mkdir(parents=True, exist_ok=True)
            with out.open('xb') as handle:
                handle.write(data)
        result['status'] = 'STAGED'
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', type=Path, required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    source = Path(__file__).resolve().parent.parent
    try:
        print(json.dumps(stage(source, args.target, args.apply), indent=2))
    except (OSError, ValueError, KeyError) as exc:
        print(json.dumps({'status': 'FAIL', 'error': str(exc)}))
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
