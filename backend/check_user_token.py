import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select
from app.models.user import User
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def check_token():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get the first user (assuming single user for now or the one being used)
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        for user in users:
            print(f"User: {user.email}, ID: {user.id}")
            if user.github_token:
                print(f"  Token Present: Yes (Length: {len(user.github_token)})")
                print(f"  Token Preview: {user.github_token[:10]}...")
            else:
                print("  Token Present: NO")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_token())
