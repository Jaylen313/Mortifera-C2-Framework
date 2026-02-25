"""
Test database operations with Agent model
"""

import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.database.agent import Agent, AgentStatus


async def test_create_agent():
    """Test creating an agent"""
    print("\n" + "=" * 50)
    print("TEST: Create Agent")
    print("=" * 50)
    
    async with AsyncSessionLocal() as db:
        # Create a test agent
        agent = Agent(
            agent_id="test-agent-001",
            hostname="TEST-LAPTOP",
            username="testuser",
            internal_ip="192.168.1.100",
            os="Windows 11",
            architecture="x64",
            privilege_level="admin",
            sleep_interval=60,
            jitter=0.2
        )
        
        # Add to database
        db.add(agent)
        await db.commit()
        await db.refresh(agent)  # Reload from database
        
        print(f"✅ Created agent: {agent}")
        print(f"   UUID: {agent.id}")
        print(f"   Agent ID: {agent.agent_id}")
        print(f"   Hostname: {agent.hostname}")
        print(f"   Status: {agent.status}")
        print(f"   Created at: {agent.created_at}")
        
        return agent.id


async def test_query_agents():
    """Test querying agents"""
    print("\n" + "=" * 50)
    print("TEST: Query Agents")
    print("=" * 50)
    
    async with AsyncSessionLocal() as db:
        # Query all agents
        result = await db.execute(select(Agent))
        agents = result.scalars().all()
        
        print(f"✅ Found {len(agents)} agent(s):")
        for agent in agents:
            print(f"   - {agent.agent_id}: {agent.hostname} ({agent.status})")


async def test_update_agent(agent_uuid):
    """Test updating an agent"""
    print("\n" + "=" * 50)
    print("TEST: Update Agent")
    print("=" * 50)
    
    async with AsyncSessionLocal() as db:
        # Get agent
        result = await db.execute(
            select(Agent).where(Agent.id == agent_uuid)
        )
        agent = result.scalar_one()
        
        print(f"   Before: {agent.hostname} - Status: {agent.status}")
        
        # Update agent
        agent.update_last_seen()
        agent.status = AgentStatus.INACTIVE
        
        await db.commit()
        await db.refresh(agent)
        
        print(f"   After: {agent.hostname} - Status: {agent.status}")
        print(f"✅ Agent updated")


async def test_delete_agent(agent_uuid):
    """Test deleting an agent"""
    print("\n" + "=" * 50)
    print("TEST: Delete Agent")
    print("=" * 50)
    
    async with AsyncSessionLocal() as db:
        # Get agent
        result = await db.execute(
            select(Agent).where(Agent.id == agent_uuid)
        )
        agent = result.scalar_one()
        
        print(f"   Deleting: {agent.agent_id}")
        
        # Delete agent
        await db.delete(agent)
        await db.commit()
        
        print(f"✅ Agent deleted")


async def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("DATABASE OPERATIONS TEST")
    print("=" * 60)
    
    # Create
    agent_uuid = await test_create_agent()
    
    # Query
    await test_query_agents()
    
    # Update
    await test_update_agent(agent_uuid)
    
    # Query again
    await test_query_agents()
    
    # Delete
    await test_delete_agent(agent_uuid)
    
    # Query final
    await test_query_agents()
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())