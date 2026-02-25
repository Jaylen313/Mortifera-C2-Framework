"""
Agent Model

Represents a compromised machine (agent) in the C2 network.

This is the heart of your C2 - every compromised machine
has an entry in this table.
"""

import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum

from app.models.database.base import Base, TimeStampMixin


class AgentStatus(str, enum.Enum):
    """
    Enum for agent status.
    
    Enum = A set of named constants.
    Instead of using strings like "active", "inactive",
    we use AgentStatus.ACTIVE, AgentStatus.INACTIVE.
    
    Benefits:
    - Prevents typos (can't accidentally use "activ" instead of "active")
    - IDE autocomplete
    - Easy to see all possible values
    """
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEAD = "dead"


class Agent(Base, TimeStampMixin):
    """
    Agent database model.
    
    Inherits from:
    - Base: Makes this a SQLAlchemy model (database table)
    - TimeStampMixin: Adds created_at and updated_at fields
    
    Each instance of this class = one row in the agents table.
    """
    
    __tablename__ = "agents"
    
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
    """
    Unique identifier for this agent.
    
    UUID = Universally Unique Identifier
    Example: 550e8400-e29b-41d4-a716-446655440000
    
    Why UUID instead of integer?
    - UUIDs are unique across ALL databases (important if you merge data)
    - Harder to enumerate (attacker can't guess IDs)
    - More secure
    
    default=uuid.uuid4 means:
    Automatically generate a new UUID when creating an agent.
    """
    
    # ============================================
    # AGENT IDENTIFICATION
    # ============================================
    agent_id = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )
    """
    Agent's self-generated ID.
    
    The agent generates this ID when it first runs.
    Used to identify the agent in beacon requests.
    
    index=True means:
    Create a database index on this column for faster lookups.
    Like an index in a book - helps find things quickly.
    """
    
    hostname = Column(String(255), nullable=False)
    """
    Computer name of the compromised machine.
    Example: "DESKTOP-GAMING-PC"
    """
    
    username = Column(String(100))
    """
    Username the agent is running as.
    Example: "john.doe"
    """
    
    domain = Column(String(255))
    """
    Active Directory domain (if any).
    Example: "CORP.LOCAL"
    """
    
    # ============================================
    # NETWORK INFORMATION
    # ============================================
    internal_ip = Column(String(45))
    """
    Internal IP address.
    Example: "192.168.1.100"
    
    45 chars because IPv6 can be long:
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
    """
    
    external_ip = Column(String(45))
    """
    External/public IP address.
    Example: "203.0.113.42"
    """
    
    # ============================================
    # SYSTEM INFORMATION
    # ============================================
    os = Column(String(50))
    """
    Operating system.
    Examples: "Windows 11", "Ubuntu 22.04", "macOS 13.0"
    """
    
    os_version = Column(String(50))
    """
    OS version details.
    Example: "10.0.22621"
    """
    
    architecture = Column(String(20))
    """
    CPU architecture.
    Examples: "x64", "x86", "arm64"
    """
    
    # ============================================
    # PROCESS INFORMATION
    # ============================================
    process_name = Column(String(255))
    """
    Name of the agent process.
    Example: "svchost.exe" (if disguised as Windows service)
    """
    
    process_id = Column(Integer)
    """
    Process ID (PID).
    Example: 1234
    """
    
    privilege_level = Column(String(20))
    """
    What privileges the agent has.
    Examples: "user", "admin", "SYSTEM"
    
    This is CRITICAL - determines what actions agent can perform.
    """
    
    # ============================================
    # BEACON CONFIGURATION
    # ============================================
    sleep_interval = Column(Integer, default=60)
    """
    How often agent checks in (seconds).
    
    Default: 60 seconds = 1 beacon per minute
    
    Trade-off:
    - Shorter interval = faster response, more detectable
    - Longer interval = slower response, more stealthy
    """
    
    jitter = Column(Float, default=0.0)
    """
    Random variation in sleep time (0.0 to 1.0).
    
    Example with jitter=0.2 and sleep_interval=60:
    - Actual sleep time will be between 48-72 seconds
    - Makes timing unpredictable (harder to detect)
    
    0.0 = no jitter (always exactly sleep_interval)
    0.2 = ±20% variation
    0.5 = ±50% variation
    """
    
    # ============================================
    # STATUS TRACKING
    # ============================================
    status = Column(
        Enum(AgentStatus),
        default=AgentStatus.ACTIVE,
        nullable=False
    )
    """
    Current agent status.
    
    ACTIVE = Agent is checking in regularly
    INACTIVE = Agent hasn't checked in recently (but not dead)
    DEAD = Agent is confirmed dead/removed
    """
    
    last_seen = Column(DateTime, default=datetime.utcnow)
    """
    When agent last checked in.
    
    Used to determine if agent is still alive.
    If last_seen is > 5 minutes ago, might be inactive.
    """
    
    # ============================================
    # ADDITIONAL METADATA
    # ============================================
    listener_id = Column(UUID(as_uuid=True))
    """
    Which listener this agent connected through.
    We'll create the Listener model later.
    """
    
    group_id = Column(UUID(as_uuid=True))
    """
    Agent group (for organization).
    Example groups: "Production Servers", "HR Department", etc.
    """
    
    # ============================================
    # METHODS
    # ============================================
    def __repr__(self):
        """
        String representation of agent (for debugging).
        
        When you print(agent), this is what you see.
        """
        return f"<Agent {self.agent_id} - {self.hostname} ({self.status})>"
    
    def update_last_seen(self):
        """
        Update last_seen to current time.
        
        Call this every time agent checks in.
        """
        self.last_seen = datetime.utcnow()
    
    def is_active(self) -> bool:
        """
        Check if agent is currently active.
        
        Returns True if:
        - Status is ACTIVE
        - Last seen within last 5 minutes
        """
        if self.status != AgentStatus.ACTIVE:
            return False
        
        time_since_last_seen = datetime.utcnow() - self.last_seen
        return time_since_last_seen.total_seconds() < 300  # 5 minutes