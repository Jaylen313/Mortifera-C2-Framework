"""
Task API Routes

Endpoints for task management (used by operators via dashboard).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.core.database import get_db
from app.models.database.agent import Agent
from app.models.database.task import Task, TaskType, TaskStatus
from app.models.database.result import Result
from app.api.deps import get_current_operator
from app.models.database.operator import Operator






router = APIRouter()


@router.post("")
async def create_task(
    task_data: dict,
    current_user: Operator = Depends(get_current_operator),  
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new task.
    
    Example request:
    POST /api/v1/tasks
    {
        "agent_id": "abc-123",
        "task_type": "shell",
        "command": "whoami",
        "priority": 5
    }
    
    Response:
    {
        "task_id": "...",
        "status": "created"
    }
    """
    
    # Find agent by agent_id
    agent_result = await db.execute(
        select(Agent).where(Agent.agent_id == task_data["agent_id"])
    )
    agent = agent_result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Create task
    task = Task(
        agent_id=agent.id,
        task_type=TaskType(task_data["task_type"]),
        command=task_data["command"],
        priority=task_data.get("priority", 5),
        status=TaskStatus.PENDING,
        created_by=current_user.id
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    print(f"📋 Task created: {task.task_type.value} for {agent.agent_id}")
    
    return {
        "task_id": str(task.id),
        "status": "created",
        "agent_id": agent.agent_id
    }


@router.get("")
async def list_tasks(
    agent_id: str = None,
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List tasks with optional filters.
    
    Examples:
    - GET /api/v1/tasks
    - GET /api/v1/tasks?agent_id=abc-123
    - GET /api/v1/tasks?status=pending
    """
    
    query = select(Task)
    
    if agent_id:
        # Find agent first
        agent_result = await db.execute(
            select(Agent).where(Agent.agent_id == agent_id)
        )
        agent = agent_result.scalar_one_or_none()
        if agent:
            query = query.where(Task.agent_id == agent.id)
    
    if status:
        try:
            status_enum = TaskStatus(status)
            query = query.where(Task.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    
    result = await db.execute(query.order_by(Task.created_at.desc()))
    tasks = result.scalars().all()
    
    return [
        {
            "id": str(task.id),
            "agent_id": str(task.agent_id),
            "task_type": task.task_type.value,
            "command": task.command,
            "status": task.status.value,
            "priority": task.priority,
            "created_at": task.created_at.isoformat(),
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }
        for task in tasks
    ]


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get specific task with its result.
    
    Example: GET /api/v1/tasks/550e8400-e29b-41d4-a716-446655440000
    """
    
    task_uuid = uuid.UUID(task_id)
    
    # Get task
    task_result = await db.execute(
        select(Task).where(Task.id == task_uuid)
    )
    task = task_result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get result if exists
    result_query = await db.execute(
        select(Result).where(Result.task_id == task_uuid)
    )
    result = result_query.scalar_one_or_none()
    
    return {
        "id": str(task.id),
        "agent_id": str(task.agent_id),
        "task_type": task.task_type.value,
        "command": task.command,
        "status": task.status.value,
        "priority": task.priority,
        "created_at": task.created_at.isoformat(),
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "result": {
            "output": result.output,
            "error": result.error,
            "execution_time": result.execution_time
        } if result else None
    }