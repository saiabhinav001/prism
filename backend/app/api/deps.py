from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import security
from app.core.config import settings
from app.db.session import get_session
from app.models.user import User, Token
from app.crud.user import user as user_crud

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)

async def get_current_user(
    db: AsyncSession = Depends(get_session), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        # print(f"DEBUG: Validating Token: {token[:10]}...") 
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = payload.get("sub")
        # print(f"DEBUG: Token Sub: {token_data}")
    except (JWTError, ValidationError) as e:
        print(f"DEBUG: Token Validation Failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = await user_crud.get(db, id=int(token_data))
    if not user:
        print(f"DEBUG: User {token_data} not found in DB")
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user
