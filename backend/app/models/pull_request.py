from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class PullRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    repo_id: int = Field(foreign_key="repository.id")
    github_pr_number: int
    title: str
    state: str
    author_login: str
    author_avatar_url: Optional[str] = None
    html_url: str
    body: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    repository: "Repository" = Relationship(back_populates="pull_requests")
    analyses: List["Analysis"] = Relationship(back_populates="pull_request")
