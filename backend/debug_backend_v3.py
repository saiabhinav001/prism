
import asyncio
from datetime import timedelta
import httpx
from jose import jwt
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.models.user import User
from sqlmodel import select
from app.core import security, config

# Use direct connection string
DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"
engine = create_async_engine(DATABASE_URL)

async def inject_user():
    print("Injecting Debug User via SQLModel...")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    user_id = 999
    
    async with async_session() as session:
        # Check if user exists
        statement = select(User).where(User.id == user_id)
        result = await session.execute(statement)
        user = result.scalars().first()
        
        if not user:
            print("Creating new user...")
            user = User(
                id=user_id,
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
            
        return user.id

async def run_test():
    # 1. Inject User
    user_id = await inject_user()
    
    # 2. Forge Token
    print(f"Forging Token for User ID: {user_id}")
    # We must ensure we use the SAME secret key as the app.
    # Assuming config.settings loads it correctly.
    access_token = security.create_access_token(subject=user_id)
    print(f"Token: {access_token[:20]}...")

    # 3. Hit Endpoints
    async with httpx.AsyncClient() as client:
        # Test 1: GET /list
        print("\n--- TEST 1: GET /list ---")
        try:
             r = await client.get(
                 "http://127.0.0.1:8000/api/v1/repos/list",
                 headers={"Authorization": f"Bearer {access_token}"}
             )
             print(f"List Response: {r.status_code}")
             # print(r.text[:100])
        except Exception as e:
             print(f"List Failed: {e}")

        # Test 2: GET /pulls
        print("\n--- TEST 2: GET /pulls ---")
        try:
             r = await client.get(
                 "http://127.0.0.1:8000/api/v1/repos/pulls",
                 headers={"Authorization": f"Bearer {access_token}"}
             )
             print(f"Pulls Response: {r.status_code}")
             print(r.text[:500])
        except Exception as e:
             print(f"Pulls Failed: {e}")

        # Test 3: POST /toggle (Skipping to avoid noise)
        print("\n--- TEST 3: POST /toggle (Skipped) ---")
        # ...
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_test())
