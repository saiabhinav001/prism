from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True, 
    future=True,
    pool_pre_ping=True,  # Fix for "connection is closed" errors
    pool_recycle=300     # Recycle connections every 5 minutes
)

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

import asyncio
from sqlalchemy.exc import OperationalError

async def init_db():
    retries = 5
    for i in range(retries):
        try:
            async with engine.begin() as conn:
                # await conn.run_sync(SQLModel.metadata.drop_all)
                await conn.run_sync(SQLModel.metadata.create_all)
            print("Database initialized successfully.")
            return
        except (OperationalError, OSError) as e:
            if i == retries - 1:
                print("Could not connect to database after max retries.")
                raise e
            print(f"Database not ready, retrying in 2s... ({i+1}/{retries})")
            await asyncio.sleep(2)
