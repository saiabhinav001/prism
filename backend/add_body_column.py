import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def add_column():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            print("Attempting to add 'body' column to pullrequest table...")
            await session.execute(text("ALTER TABLE pullrequest ADD COLUMN IF NOT EXISTS body TEXT;"))
            await session.commit()
            print("Success!")
        except Exception as e:
            print(f"Error: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_column())
