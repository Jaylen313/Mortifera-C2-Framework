"""
Security Module

Handles authentication, encryption, and password hashing.

Three main security features:
1. Password Hashing - Store passwords securely
2. JWT Tokens - Authenticate API requests
3. AES Encryption - Encrypt agent communications
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import base64

# JWT handling
from jose import JWTError, jwt

# Password hashing
from passlib.context import CryptContext

# Encryption
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


# ============================================
# PASSWORD HASHING
# ============================================
# We NEVER store passwords in plain text!
# Instead, we store a "hash" - a one-way transformation.

# Create password context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Example:
        password = "mypassword123"
        hashed = hash_password(password)
        # hashed = "$2b$12$KIXvZ3..."  (looks random)
    
    Bcrypt is "slow" on purpose - makes brute-force attacks harder.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Example:
        is_correct = verify_password("mypassword123", hashed)
        # Returns True if password matches, False otherwise
    
    This is used during login to check if password is correct.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ============================================
# JWT TOKENS
# ============================================
# JWT = JSON Web Token
# It's a way to securely transmit information between parties.

def create_access_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT access token.
    
    A JWT contains:
    - Payload (data we want to store)
    - Expiration time
    - Signature (proves it wasn't tampered with)
    
    Example:
        token = create_access_token({"sub": "user@email.com"})
        # token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    
    This token is sent to the frontend and included in API requests.
    """
    to_encode = data.copy()
    
    # Calculate expiration time
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    
    # Add expiration to payload
    to_encode.update({"exp": expire})
    
    # Create token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT refresh token.
    
    Refresh tokens have longer expiration (7 days vs 30 minutes).
    Used to get new access tokens without logging in again.
    
    Example:
        token = create_refresh_token({"sub": "user@email.com"})
    
    When access token expires, frontend sends refresh token to get new access token.
    """
    to_encode = data.copy()
    
    # Refresh tokens last 7 days
    expire = datetime.utcnow() + timedelta(days=7)
    
    # Add expiration and token type to payload
    to_encode.update({"exp": expire, "type": "refresh"})
    
    # Create token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify a JWT token.
    
    Example:
        payload = decode_token(token)
        if payload:
            user_email = payload["sub"]
        else:
            # Invalid token
    
    Returns None if token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# ============================================
# AES ENCRYPTION
# ============================================
# Used to encrypt agent communications so they can't be read
# even if intercepted on the network.

class Encryptor:
    """
    AES-256-GCM Encryption
    
    AES = Advanced Encryption Standard
    256 = Key size in bits (very secure)
    GCM = Galois/Counter Mode (authenticated encryption)
    
    Usage:
        encryptor = Encryptor()
        
        # Encrypt
        encrypted = encryptor.encrypt("secret message")
        
        # Decrypt
        decrypted = encryptor.decrypt(encrypted)
        # decrypted = "secret message"
    """
    
    def __init__(self, key: Optional[bytes] = None):
        """
        Initialize encryptor with a key.
        
        Key must be exactly 32 bytes (256 bits).
        If no key provided, uses the one from settings.
        """
        if key is None:
            # Load key from settings and decode from base64
            key = base64.b64decode(settings.ENCRYPTION_KEY)
        
        if len(key) != 32:
            raise ValueError("Encryption key must be exactly 32 bytes")
        
        # Create cipher
        self.cipher = AESGCM(key)
        self.key = key
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt a string.
        
        Process:
        1. Generate random nonce (number used once)
        2. Encrypt plaintext with nonce
        3. Combine nonce + ciphertext
        4. Base64 encode for transmission
        
        The nonce ensures same plaintext encrypts differently each time.
        """
        # Generate random 12-byte nonce
        nonce = os.urandom(12)
        
        # Encrypt
        ciphertext = self.cipher.encrypt(
            nonce,
            plaintext.encode('utf-8'),
            None  # No additional authenticated data
        )
        
        # Combine nonce + ciphertext
        combined = nonce + ciphertext
        
        # Base64 encode so we can transmit as string
        return base64.b64encode(combined).decode('utf-8')
    
    def decrypt(self, encrypted: str) -> str:
        """
        Decrypt a string.
        
        Process:
        1. Base64 decode
        2. Split nonce and ciphertext
        3. Decrypt using nonce
        4. Return plaintext
        """
        # Decode from base64
        combined = base64.b64decode(encrypted)
        
        # Split nonce (first 12 bytes) and ciphertext (rest)
        nonce = combined[:12]
        ciphertext = combined[12:]
        
        # Decrypt
        plaintext = self.cipher.decrypt(nonce, ciphertext, None)
        
        return plaintext.decode('utf-8')
    
    @staticmethod
    def generate_key() -> str:
        """
        Generate a new random encryption key.
        
        Use this to create a key for your .env file:
        
            key = Encryptor.generate_key()
            print(key)  # Copy this to ENCRYPTION_KEY in .env
        """
        key = AESGCM.generate_key(bit_length=256)
        return base64.b64encode(key).decode('utf-8')


# Create global encryptor instance
encryptor = Encryptor()