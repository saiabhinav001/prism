import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select
from app.models.repository import Repository
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def activate_repos():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(Repository))
        repos = result.scalars().all()
        
        count = 0
        for r in repos:
            if not r.is_active:
                r.is_active = True
                session.add(r)
                count += 1
        
        await session.commit()
        print(f"Activated {count} repositories.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(activate_repos())
