import requests
try:
    # Test Toggle Endpoint (Expect 401 Unauthorized, NOT Connection Error)
    r = requests.post("http://127.0.0.1:8000/api/v1/repos/toggle", json={"name": "test"})
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"Error: {e}")
