from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.user import User, UserCreate
from app.core import security

class CRUDUser:
    async def get_by_email(self, session: AsyncSession, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        result = await session.execute(statement)
        return result.scalars().first()

    async def get(self, session: AsyncSession, id: int) -> Optional[User]:
        statement = select(User).where(User.id == id)
        result = await session.execute(statement)
        return result.scalars().first()

    async def get_by_github_id(self, session: AsyncSession, github_id: str) -> Optional[User]:
        statement = select(User).where(User.github_id == github_id)
        result = await session.execute(statement)
        return result.scalars().first()

    async def create(self, session: AsyncSession, user_in: UserCreate) -> User:
        db_obj = User.model_validate(user_in)
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def update(self, session: AsyncSession, db_obj: User, obj_in: dict) -> User:
        for key, value in obj_in.items():
            setattr(db_obj, key, value)
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def authenticate(self, session: AsyncSession, email: str, password: str) -> Optional[User]:
        user = await self.get_by_email(session, email)
        if not user:
            return None
        if not user.hashed_password:
             return None
        if not security.verify_password(password, user.hashed_password):
            return None
        return user

user = CRUDUser()
