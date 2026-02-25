"""
Quick test to verify configuration loads correctly
"""

from app.core.config import settings
import base64



print("=" * 50)
print("CONFIGURATION TEST")
print("=" * 50)
print(f"Project Name: {settings.PROJECT_NAME}")
print(f"Debug Mode: {settings.DEBUG}")
print(f"Database URL: {settings.DATABASE_URL}")
print(f"API Prefix: {settings.API_V1_STR}")
print("=" * 50)
print(f"ENCRYPTION_KEY: {settings.ENCRYPTION_KEY}")
print(f"ENCRYPTION_KEY length: {len(settings.ENCRYPTION_KEY)}")

# Try to decode it
try:
    decoded = base64.b64decode(settings.ENCRYPTION_KEY)
    print(f"Decoded key length: {len(decoded)} bytes")
except Exception as e:
    print(f"Error decoding: {e}")
print("✅ Configuration loaded successfully!")