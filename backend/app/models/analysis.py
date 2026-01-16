from typing import Optional, Dict
from sqlmodel import Field, SQLModel, Relationship, JSON
from datetime import datetime

class Analysis(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pr_id: int = Field(foreign_key="pullrequest.id")
    status: str = Field(default="pending") # pending, processing, completed, failed
    
    security_score: int = Field(default=0)
    performance_score: int = Field(default=0)
    reliability_score: int = Field(default=0)
    maintainability_score: int = Field(default=0)
    merge_confidence_score: int = Field(default=0)
    
    raw_llm_output: Optional[Dict] = Field(default=None, sa_type=JSON)
    diff_snapshot: Optional[str] = Field(default=None) # removed deferred to fix crash
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    pull_request: "PullRequest" = Relationship(back_populates="analyses")
