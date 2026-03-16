"""
Agent Cleanup Service

Background task that automatically updates agent status
and removes old dead agents and orphaned tasks.

This runs every 60 seconds and:
- Marks agents as inactive after 5 minutes without beacon
- Marks agents as dead after 30 minutes without beacon  
- Deletes dead agents after 7 days
- Deletes orphaned tasks (tasks for deleted agents)
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.database.agent import Agent, AgentStatus


class AgentCleanupService:
    """Service to clean up stale agents and orphaned tasks"""
    
    # Configuration (adjust these as needed)
    INACTIVE_THRESHOLD_MINUTES = 5   # 5 minutes without beacon = inactive
    DEAD_THRESHOLD_MINUTES = 30      # 30 minutes without beacon = dead
    DELETE_AFTER_DAYS = 7            # Delete dead agents after 7 days
    
    @classmethod
    async def update_agent_statuses(cls, db: AsyncSession) -> dict:
        """
        Update agent statuses based on last_seen timestamp.
        
        Logic:
        - If last_seen > 30 minutes ago → DEAD
        - If last_seen > 5 minutes ago → INACTIVE
        - If last_seen < 5 minutes ago → ACTIVE (no change needed)
        
        Returns:
            dict: Count of updated agents by category
        """
        now = datetime.utcnow()
        inactive_threshold = now - timedelta(minutes=cls.INACTIVE_THRESHOLD_MINUTES)
        dead_threshold = now - timedelta(minutes=cls.DEAD_THRESHOLD_MINUTES)
        
        # Mark as inactive (5+ minutes without beacon, but less than 30)
        result_inactive = await db.execute(
            select(Agent)
            .where(Agent.last_seen < inactive_threshold)
            .where(Agent.last_seen >= dead_threshold)
            .where(Agent.status == AgentStatus.ACTIVE)
        )
        inactive_agents = result_inactive.scalars().all()
        
        for agent in inactive_agents:
            agent.status = AgentStatus.INACTIVE
            print(f"⚠️  Agent {agent.hostname} ({agent.agent_id[:8]}) marked INACTIVE")
        
        # Mark as dead (30+ minutes without beacon)
        result_dead = await db.execute(
            select(Agent)
            .where(Agent.last_seen < dead_threshold)
            .where(Agent.status.in_([AgentStatus.ACTIVE, AgentStatus.INACTIVE]))
        )
        dead_agents = result_dead.scalars().all()
        
        for agent in dead_agents:
            agent.status = AgentStatus.DEAD
            print(f"💀 Agent {agent.hostname} ({agent.agent_id[:8]}) marked DEAD")
        
        await db.commit()
        
        return {
            "inactive": len(inactive_agents),
            "dead": len(dead_agents)
        }
    
    @classmethod
    async def delete_old_dead_agents(cls, db: AsyncSession) -> int:
        """
        Delete agents that have been dead for more than DELETE_AFTER_DAYS.
        
        This permanently removes agents from the database that have been
        in DEAD status for more than the configured threshold.
        
        Returns:
            int: Count of deleted agents
        """
        threshold = datetime.utcnow() - timedelta(days=cls.DELETE_AFTER_DAYS)
        
        # Find agents to delete
        result = await db.execute(
            select(Agent)
            .where(Agent.status == AgentStatus.DEAD)
            .where(Agent.last_seen < threshold)
        )
        agents_to_delete = result.scalars().all()
        
        # Delete them
        for agent in agents_to_delete:
            print(f"🗑️  Deleting agent {agent.hostname} ({agent.agent_id[:8]}) - dead for {cls.DELETE_AFTER_DAYS}+ days")
            await db.delete(agent)
        
        await db.commit()
        
        return len(agents_to_delete)
    
    @classmethod
    async def cleanup_orphaned_tasks(cls, db: AsyncSession) -> int:
        """
        Delete tasks that reference deleted agents (orphaned tasks).
        
        When agents are deleted, their tasks remain in the database
        but reference a non-existent agent_id. This cleans them up.
        
        Returns:
            int: Count of deleted tasks
        """
        from app.models.database.task import Task
        
        # Find tasks with agent_ids that don't exist in agents table
        result = await db.execute(
            select(Task)
            .where(~Task.agent_id.in_(
                select(Agent.id)
            ))
        )
        orphaned_tasks = result.scalars().all()
        
        for task in orphaned_tasks:
            print(f"🗑️  Deleting orphaned task {str(task.id)[:8]} (agent deleted)")
            await db.delete(task)
        
        await db.commit()
        return len(orphaned_tasks)
    
    @classmethod
    async def run_cleanup(cls) -> dict:
        """
        Run full cleanup cycle.
        
        This is called every 60 seconds by the background task.
        
        Returns:
            dict: Statistics about what was cleaned up
        """
        async with AsyncSessionLocal() as db:
            # Update statuses
            status_updates = await cls.update_agent_statuses(db)
            
            # Delete old dead agents
            deleted_agents = await cls.delete_old_dead_agents(db)
            
            # Clean up orphaned tasks
            deleted_tasks = await cls.cleanup_orphaned_tasks(db)
            
            stats = {
                **status_updates,
                "deleted_agents": deleted_agents,
                "deleted_tasks": deleted_tasks,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Only print summary if something changed
            if any([status_updates["inactive"], status_updates["dead"], deleted_agents, deleted_tasks]):
                print(f"\n🧹 Cleanup summary:")
                print(f"   - {status_updates['inactive']} agents → INACTIVE")
                print(f"   - {status_updates['dead']} agents → DEAD")
                print(f"   - {deleted_agents} dead agents DELETED")
                print(f"   - {deleted_tasks} orphaned tasks DELETED")
                print()
            
            return stats


async def cleanup_loop():
    """
    Background task that runs cleanup every 60 seconds.
    
    This is started in main.py during application startup
    and runs continuously until the application shuts down.
    """
    while True:
        try:
            await AgentCleanupService.run_cleanup()
        except Exception as e:
            print(f"❌ Error in agent cleanup: {e}")
            import traceback
            traceback.print_exc()
        
        # Wait 60 seconds before next cleanup
        await asyncio.sleep(60)