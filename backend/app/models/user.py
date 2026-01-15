from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(default=None)
    github_id: Optional[str] = None
    github_token: Optional[str] = None # Store OAuth token for API calls
    is_active: bool = True
    plan_tier: str = Field(default="free")
    hashed_password: Optional[str] = None

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: int
    bio: Optional[str] = None
    created_at: datetime

class UserSignup(SQLModel):
    email: str
    password: str
    full_name: Optional[str] = None

class Token(SQLModel):
    access_token: str
    token_type: str
