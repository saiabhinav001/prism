import asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select
from app.models.user import User
from app.core.security import create_access_token
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def test_trigger():
    # 1. Get User and Token
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    token = ""
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == "debug999@prism.com"))
        user = result.scalars().first()
        if user:
            print(f"Found User: {user.email}")
            token = create_access_token(user.id, expires_delta=timedelta(minutes=5))
        else:
            print("User not found!")
            return

    await engine.dispose()
    
    if not token:
        print("Failed to generate token")
        return

    # 2. Hit Trigger Endpoint
    url = "http://localhost:8000/api/v1/analysis/trigger-live"
    payload = {
        "repo_id": 16,
        "pr_number": 3,
        "title": "Test PR from Debug Script",
        "html_url": "https://github.com/saiabhinav001/ai/pull/3",
        "author": "saiabhinav001"
    }
    
    print(f"Sending Request to {url} with payload: {payload}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url, 
            json=payload, 
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_trigger())
