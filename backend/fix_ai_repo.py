import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select
from app.models.repository import Repository
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def check_specific_repo():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check specifically for 'ai' repo
        result = await session.execute(select(Repository).where(Repository.name == "ai"))
        repo = result.scalars().first()
        
        if repo:
            print(f"Found 'ai' repo: ID={repo.id}, FullName={repo.full_name}, Active={repo.is_active}")
            if not repo.is_active:
                print("activating...")
                repo.is_active = True
                session.add(repo)
                await session.commit()
                print("Activated 'ai' repo.")
        else:
            print("Repo 'ai' NOT FOUND in DB.")
            # Check all again to be sure
            result_all = await session.execute(select(Repository))
            all_repos = result_all.scalars().all()
            print(f"Total Repos in DB: {len(all_repos)}")
            for r in all_repos:
                print(f" - {r.name} ({r.full_name})")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_specific_repo())
