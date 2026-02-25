"""
Result Model

Stores the output/result of a task execution.

Why separate from Task?
- Keeps Task table smaller (results can be large)
- Easy to clear old results without touching tasks
- Better for querying (can query results independently)
"""

import uuid
from sqlalchemy import Column, Text, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.database.base import Base, TimeStampMixin


class Result(Base, TimeStampMixin):
    """
    Result database model.
    
    Stores the output from task execution.
    """
    
    __tablename__ = "results"
    
    # ============================================
    # PRIMARY KEY
    # ============================================
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    
    # ============================================
    # FOREIGN KEYS
    # ============================================
    task_id = Column(
        UUID(as_uuid=True),
        ForeignKey('tasks.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    """
    Which task this result belongs to.
    
    ondelete='CASCADE': If task is deleted, delete its result too.
    """
    
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey('agents.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    """
    Which agent executed this task.
    
    Redundant (we could get agent from task), but makes queries faster.
    """
    
    # ============================================
    # RESULT DATA
    # ============================================
    output = Column(Text)
    """
    Standard output from the command.
    
    Example:
    Task: "whoami"
    Output: "DESKTOP\\Administrator"
    
    Text type = can store large outputs (like file listings)
    """
    
    error = Column(Text)
    """
    Error output (if any).
    
    Example:
    Task: "cat /root/secret.txt"
    Error: "Permission denied"
    """
    
    # ============================================
    # METRICS
    # ============================================
    execution_time = Column(Float)
    """
    How long the task took to execute (in seconds).
    
    Example: 0.234 = task took 234 milliseconds
    
    Useful for:
    - Performance monitoring
    - Detecting anomalies (unusually slow tasks)
    """
    
    # ============================================
    # METHODS
    # ============================================
    def __repr__(self):
        return f"<Result {self.id} for Task {self.task_id}>"
    
    def has_error(self) -> bool:
        """Check if result contains an error"""
        return self.error is not None and len(self.error) > 0
    
    def is_empty(self) -> bool:
        """Check if result has no output"""
        return (not self.output or len(self.output) == 0) and not self.has_error()