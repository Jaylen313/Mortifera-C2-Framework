"""
Create initial admin user

Run this script once to create the first admin account.
"""

import asyncio
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.core.config import settings
from app.models.database.operator import Operator, OperatorRole


async def create_admin():
    """Create admin user from .env settings"""
    
    print("=" * 60)
    print("CREATE ADMIN USER")
    print("=" * 60)
    
    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        result = await db.execute(
            select(Operator).where(
                Operator.email == settings.FIRST_SUPERUSER_EMAIL
            )
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"❌ Admin user already exists: {existing_user.email}")
            print("=" * 60)
            return
        
        # Create admin user
        admin = Operator(
            email=settings.FIRST_SUPERUSER_EMAIL,
            username="admin",
            hashed_password=hash_password(settings.FIRST_SUPERUSER_PASSWORD),
            role=OperatorRole.ADMIN,
            is_active=True
        )
        
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin.email}")
        print(f"   Username: {admin.username}")
        print(f"   Role: {admin.role.value}")
        print()
        print("🔑 Login credentials:")
        print(f"   Email: {settings.FIRST_SUPERUSER_EMAIL}")
        print(f"   Password: {settings.FIRST_SUPERUSER_PASSWORD}")
        print()
        print("⚠️  Please change the password after first login!")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(create_admin())