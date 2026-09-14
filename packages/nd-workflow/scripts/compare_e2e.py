import subprocess
import time
import json
import urllib.request
import urllib.error
import sys

def run_test_suite(port):
    base = f"http://127.0.0.1:{port}"
    results = {}

    # 1. Health check
    t0 = time.perf_counter()
    req = urllib.request.Request(f"{base}/api/health")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        assert data.get("status") == "ok"
    results["health"] = (time.perf_counter() - t0) * 1000

    # 2. Static index.html
    t0 = time.perf_counter()
    req = urllib.request.Request(f"{base}/")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        html = resp.read().decode()
        assert "<title>" in html
    results["static_html"] = (time.perf_counter() - t0) * 1000

    # 3. Create Todo 1
    t0 = time.perf_counter()
    payload = json.dumps({"title": "Test Task 1", "priority": "high"}).encode()
    req = urllib.request.Request(f"{base}/api/todos", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 201
        res1 = json.loads(resp.read().decode())
        assert res1["success"] is True
        todo1_id = res1["data"]["id"]
    results["create_todo_1"] = (time.perf_counter() - t0) * 1000

    # 4. Create Todo 2
    t0 = time.perf_counter()
    payload = json.dumps({"title": "Test Task 2", "priority": "urgent"}).encode()
    req = urllib.request.Request(f"{base}/api/todos", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 201
        res2 = json.loads(resp.read().decode())
        todo2_id = res2["data"]["id"]
    results["create_todo_2"] = (time.perf_counter() - t0) * 1000

    # 5. List Todos
    t0 = time.perf_counter()
    req = urllib.request.Request(f"{base}/api/todos")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        list_res = json.loads(resp.read().decode())
        assert len(list_res["data"]) >= 2
    results["list_todos"] = (time.perf_counter() - t0) * 1000

    # 6. Patch Todo 1 (complete)
    t0 = time.perf_counter()
    patch_payload = json.dumps({"completed": True, "priority": "urgent"}).encode()
    req = urllib.request.Request(f"{base}/api/todos/{todo1_id}", data=patch_payload, headers={"Content-Type": "application/json"}, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        patch_res = json.loads(resp.read().decode())
        assert patch_res["data"]["completed"] is True
    results["patch_todo"] = (time.perf_counter() - t0) * 1000

    # 7. Delete Todo 2
    t0 = time.perf_counter()
    req = urllib.request.Request(f"{base}/api/todos/{todo2_id}", method="DELETE")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
    results["delete_todo"] = (time.perf_counter() - t0) * 1000

    # 8. Validation Error Check (empty title)
    t0 = time.perf_counter()
    bad_payload = json.dumps({"title": "   "}).encode()
    req = urllib.request.Request(f"{base}/api/todos", data=bad_payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        urllib.request.urlopen(req)
        assert False, "Should have failed with 400"
    except urllib.error.HTTPError as e:
        assert e.code == 400
    results["validation_reject"] = (time.perf_counter() - t0) * 1000

    return results

def test_target(name, cwd, port):
    print(f"\n--- Testing {name} on port {port} ---")
    env = dict(PORT=str(port))
    proc = subprocess.Popen(["cargo", "run", "--bin", "todo-full-stack-rust"], cwd=cwd, env={**dict(**sys.modules["os"].environ), "PORT": str(port)}, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for server ready
    ready = False
    for _ in range(30):
        time.sleep(0.5)
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=1) as r:
                if r.status == 200:
                    ready = True
                    break
        except Exception:
            pass

    if not ready:
        proc.kill()
        out, err = proc.communicate()
        print(f"Failed to start {name}:\nSTDOUT: {out.decode()}\nSTDERR: {err.decode()}")
        return None

    try:
        results = run_test_suite(port)
        print(f"All 8 HTTP workflow assertions PASSED for {name}")
        for k, v in results.items():
            print(f"  {k}: {v:.2f} ms")
        return results
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()

if __name__ == "__main__":
    sp_results = test_target("Superpowers", "example/harden-full-superpower/todo-full-stack-rust", 4001)
    nd_results = test_target("ND Workflow", "example/harden-full-nd/todo-full-stack-rust", 4002)
    print("\n=== Workflow E2E Comparison Summary ===")
    print(f"Superpowers: {'PASSED (8/8)' if sp_results else 'FAILED'}")
    print(f"ND Workflow: {'PASSED (8/8)' if nd_results else 'FAILED'}")
