
import asyncio
from datetime import timedelta
import httpx
from jose import jwt
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Config
SECRET_KEY = "CHANGEME" # Using default from .env or config if known. 
# Better: Load from config
from app.core.config import settings
from app.core import security

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

from app.models.user import User
from app.db.session import engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

async def inject_user():
    print("Injecting Debug User via SQLModel...")
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session_maker() as session:
        statement = select(User).where(User.email == "debug999@prism.com")
        result = await session.execute(statement) # execute for select
        user = result.scalars().first()
        
        if not user:
            print("Creating new user...")
            user = User(
                id=999,
                email="debug999@prism.com",
                hashed_password="dummy",
                is_active=True,
                plan_tier="free",
                github_token="gh_dummy_token"
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            print("User Created.")
        else:
            print("User Exists.")
            
        return user.id, user.email

async def run_test():
    # 1. Inject User
    user_id, email = await inject_user()
    
    # 2. Forge Token
    print(f"Forging Token for User ID: {user_id}")
    # Security module uses str(subject) for sub
    access_token = security.create_access_token(subject=user_id)
    print(f"Token: {access_token[:20]}...")

    # 3. Hit Toggle
    async with httpx.AsyncClient() as client:
        print("Checking Health...")
        try:
             r = await client.get("http://127.0.0.1:8000/health")
             print(f"Health: {r.status_code}")
        except:
             print("Health Failed - backend might not be up yet")
             return

        repo_payload = {
            "name": "debug-repo-manual",
            "stars": 5,
            "forks": 1,
            "updated_at": "2023-01-01T00:00:00Z",
            "private": False,
            "html_url": "https://github.com/debug/repo-manual",
            "is_active": False
        }
        
        print("Sending POST /toggle...")
        r = await client.post(
            "http://127.0.0.1:8000/api/v1/repos/toggle",
            json=repo_payload,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        print(f"Toggle Response: {r.status_code}")
        print(r.text)

if __name__ == "__main__":
    asyncio.run(run_test())
