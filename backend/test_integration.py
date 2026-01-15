
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_test():
    print("1. Testing Health...")
    try:
        r = requests.get("http://127.0.0.1:8000/health")
        print(f"Health: {r.status_code}")
    except Exception as e:
        print(f"Health Connection Failed: {e}")
        return

    print("\n2. Simulating Login to get Token...")
    # We'll use the signup endpoint or login endpoint.
    # Note: Using your existing verifying verified email logic might be hard.
    # Let's try to hit the /me endpoint with a fake token to see if it even reaches backend?
    # No, we need a real token for toggle.
    
    # Or, we can just hit toggle with a BAD token and see 401.
    # If we see 401, network is fine.
    print("Testing /toggle with BAD token (Expect 401)...")
    try:
        r = requests.post(
            f"{BASE_URL}/repos/toggle", 
            json={
                "name": "test-repo", 
                "stars": 0, "forks": 0, "updated_at": "2023-01-01", 
                "private": False, "html_url": "http://github.com/owner/test-repo"
            },
            headers={"Authorization": "Bearer BAD_TOKEN"}
        )
        print(f"Toggle (Bad Token): {r.status_code}")
    except Exception as e:
        print(f"Toggle Connection Failed: {e}")

    # Now let's try to see if we can use a mock token or if we can bypass auth for debugging?
    # Ideally we inspect the backend logs to see the USER'S request.

if __name__ == "__main__":
    run_test()
