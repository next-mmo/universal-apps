import sys
import time
from pathlib import Path

# Add scripts to sys.path
sys.path.insert(0, str(Path("scripts").resolve()))
from context_index import build_index, save_cache, locate, cache_rel_path

projects = [
    ("py-expense-cli", Path("example/harden-full-nd/py-expense-cli")),
    ("py-logstat", Path("example/harden-full-nd/py-logstat")),
    ("js-md-links", Path("example/harden-full-nd/js-md-links")),
    ("workflow-starter", Path(".")),
]

print("PROJECT INDEXING BENCHMARK (MEASURED 2026-09-11)")
print("=" * 60)
for name, root in projects:
    t0 = time.perf_counter()
    index_data = build_index(root)
    cache_path = save_cache(root, index_data)
    elapsed_build = (time.perf_counter() - t0) * 1000
    cache_size = cache_path.stat().st_size if cache_path.exists() else 0
    entries_count = len(index_data.get("entries", {}))

    query = "store" if "expense" in name else ("parse" if "logstat" in name else ("link" if "links" in name else "handover"))
    t1 = time.perf_counter()
    locate_res = locate(root, query, include_history=False)
    elapsed_locate = (time.perf_counter() - t1) * 1000

    results = locate_res.get("results", [])
    read_cost = locate_res.get("read_cost", {})

    print(f"Project: {name}")
    print(f"  Target Root: {root}")
    print(f"  Indexed Sources: {entries_count}")
    print(f"  Index Build Time: {elapsed_build:.2f} ms")
    print(f"  Cache Disk Footprint: {cache_size} bytes ({cache_size / 1024:.1f} KB)")
    print(f"  Locate Query: '{query}'")
    print(f"  Locate Query Time: {elapsed_locate:.2f} ms")
    print(f"  Matches Found: {len(results)} (capped at 5)")
    print(f"  Read Cost: {read_cost.get('files_read', 0)} files read, {read_cost.get('bytes_read', 0)} bytes read")
    print("-" * 60)
