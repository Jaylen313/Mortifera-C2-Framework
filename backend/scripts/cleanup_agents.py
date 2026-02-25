"""
Clean up old agent records from database
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.database.agent import Agent


async def cleanup_old_agents(days_old: int = 7):
    """Delete agents not seen in X days"""
    
    print("=" * 60)
    print("C2 Framework - Agent Cleanup Utility")
    print("=" * 60)
    print(f"\n🔍 Looking for agents not seen in {days_old} days...")
    
    cutoff_time = datetime.utcnow() - timedelta(days=days_old)
    print(f"📅 Cutoff time: {cutoff_time}\n")
    
    try:
        async with AsyncSessionLocal() as session:
            # First, show ALL agents
            query_all = select(Agent).order_by(Agent.last_seen.desc())
            result_all = await session.execute(query_all)
            all_agents = result_all.scalars().all()
            
            print(f"📊 Total agents in database: {len(all_agents)}\n")
            print("=" * 60)
            print("All Agents:")
            print("=" * 60)
            
            for agent in all_agents:
                last_seen = agent.last_seen.replace(tzinfo=None)
                age = datetime.utcnow() - last_seen
                age_days = age.days
                age_hours = age.seconds // 3600
                age_mins = (age.seconds % 3600) // 60
                
                if age_days > days_old:
                    status = "🔴 OLD"
                    age_str = f"{age_days} days ago"
                elif age_days > 0:
                    status = "⚠️  RECENT"
                    age_str = f"{age_days} days, {age_hours} hours ago"
                elif age_hours > 0:
                    status = "🟡 ACTIVE"
                    age_str = f"{age_hours} hours, {age_mins} mins ago"
                else:
                    status = "🟢 LIVE"
                    age_str = f"{age_mins} mins ago"
                
                print(f"{status} {agent.agent_id:12} - {age_str}")
                print(f"     Hostname: {agent.hostname}, Last seen: {last_seen}")
            
            # Find old agents
            query = select(Agent).where(Agent.last_seen < cutoff_time)
            result = await session.execute(query)
            old_agents = result.scalars().all()
            
            if len(old_agents) == 0:
                print(f"\n✅ No agents older than {days_old} days found")
                return
            
            print("\n" + "=" * 60)
            print(f"🗑️  Found {len(old_agents)} agents to delete:")
            print("=" * 60)
            
            for agent in old_agents:
                last_seen = agent.last_seen.replace(tzinfo=None)
                age_days = (datetime.utcnow() - last_seen).days
                print(f"  - {agent.agent_id} ({agent.hostname}) - {age_days} days old")
            
            # Ask for confirmation
            print("\n⚠️  WARNING: This will permanently delete these agents!")
            response = input(f"Delete {len(old_agents)} agents? (yes/no): ")
            
            if response.lower() != 'yes':
                print("\n❌ Cancelled - No agents deleted")
                return
            
            # Delete them
            print("\n🗑️  Deleting agents...")
            for agent in old_agents:
                print(f"  Deleting: {agent.agent_id}")
                await session.delete(agent)
            
            await session.commit()
            print(f"\n✅ Successfully deleted {len(old_agents)} agents")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Allow custom days parameter
    if len(sys.argv) > 1:
        days = int(sys.argv[1])
    else:
        days = 7  # Default: delete agents older than 7 days
    
    asyncio.run(cleanup_old_agents(days_old=days))