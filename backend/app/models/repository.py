from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class Repository(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    github_repo_id: int = Field(index=True)
    name: str
    full_name: str
    owner_login: str
    html_url: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    pull_requests: List["PullRequest"] = Relationship(back_populates="repository")
