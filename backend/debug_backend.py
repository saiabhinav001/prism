
import asyncio
from typing import Any
from datetime import timedelta
from app.db.session import engine
from app.models.user import User
from app.core import security, config
from sqlmodel import Session, select
import httpx
from jose import jwt

# 1. Create/Get User
async def get_debug_token():
    async with Session(engine) as session:
        statement = select(User).where(User.email == "debug@prism.com")
        results = await session.exec(statement) # Sync exec in AsyncSession wrapper? No, async engine needs async session.
        # Wait, the app uses AsyncSession. We should use that.
        pass

# Simpler: Just make a minimal request.
# We need to manually generate a token.
# SECRET_KEY
settings = config.settings

def create_access_token(subject: str | Any) -> str:
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# But we need a valid USER ID in the DB.
# Let's use raw SQL insert or just assumes ID 1 exists?
# Checking users:
import sqlalchemy
from sqlalchemy import text

async def run_test():
    async with httpx.AsyncClient() as client:
        # 1. Check Health
        print("Checking Health...")
        r = await client.get("http://127.0.0.1:8000/health")
        print(f"Health: {r.status_code}")

        # 2. Login (or Signup) to get a REAL token
        print("Signing up Debug User...")
        signup_data = {
            "email": "debug_test_123@prism.com",
            "password": "password123",
            "full_name": "Debug User"
        }
        # Note: /signup might fail if exists, so try login too
        r = await client.post("http://127.0.0.1:8000/api/v1/auth/signup", json=signup_data)
        if r.status_code == 200:
             print("Signup Success")
             token = r.json()["access_token"]
        else:
             print(f"Signup Failed ({r.status_code}), trying login...")
             # Login form data
             r = await client.post("http://127.0.0.1:8000/api/v1/auth/login/access-token", 
                data={"username": "debug_test_123@prism.com", "password": "password123"},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
             )
             if r.status_code != 200:
                 print(f"Login Failed: {r.text}")
                 return
             print("Login Success")
             token = r.json()["access_token"]

        # 3. Hit Toggle
        print(f"Using Token: {token[:10]}...")
        repo_payload = {
            "name": "debug-repo",
            "stars": 10,
            "forks": 2,
            "updated_at": "2023-01-01T00:00:00Z",
            "private": False,
            "html_url": "https://github.com/debug/repo",
            "is_active": False
        }
        
        print("Sending POST /toggle...")
        r = await client.post(
            "http://127.0.0.1:8000/api/v1/repos/toggle",
            json=repo_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Toggle Response: {r.status_code}")
        print(r.text)

if __name__ == "__main__":
    from typing import Any
    from datetime import datetime
    asyncio.run(run_test())
