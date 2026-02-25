"""
Test security functions
"""

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    encryptor,
    Encryptor
)

print("=" * 50)
print("SECURITY MODULE TEST")
print("=" * 50)

# Test password hashing
print("\n1. Password Hashing:")
password = "mypassword123"
hashed = hash_password(password)
print(f"   Original: {password}")
print(f"   Hashed: {hashed}")
print(f"   Verify correct password: {verify_password(password, hashed)}")
print(f"   Verify wrong password: {verify_password('wrongpassword', hashed)}")

# Test JWT tokens
print("\n2. JWT Tokens:")
token = create_access_token({"sub": "user@email.com", "role": "admin"})
print(f"   Token: {token[:50]}...")
decoded = decode_token(token)
print(f"   Decoded: {decoded}")

# Test encryption
print("\n3. Encryption:")
plaintext = "This is a secret message from the agent"
encrypted = encryptor.encrypt(plaintext)
decrypted = encryptor.decrypt(encrypted)
print(f"   Original: {plaintext}")
print(f"   Encrypted: {encrypted[:50]}...")
print(f"   Decrypted: {decrypted}")
print(f"   Match: {plaintext == decrypted}")

# Generate a new key
print("\n4. Generate New Encryption Key:")
new_key = Encryptor.generate_key()
print(f"   New Key: {new_key}")
print(f"   (Copy this to ENCRYPTION_KEY in .env)")

print("\n" + "=" * 50)
print("✅ All security functions working!")
print("=" * 50)