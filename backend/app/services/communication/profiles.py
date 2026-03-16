"""
Malleable C2 Communication Profiles

Modern C2 frameworks disguise their traffic as legitimate web requests.
This module provides HTTP profile templates that agents use when beaconing.

Inspired by:
- Cobalt Strike's Malleable C2 profiles
- Sliver HTTP profiles
- Real-world APT TTPs documented in MITRE ATT&CK
"""

from typing import Dict, List
from dataclasses import dataclass
import random


@dataclass
class HttpProfile:
    """
    HTTP communication profile.
    
    Defines how agents should structure their HTTP requests
    to blend in with legitimate traffic.
    """
    name: str
    description: str
    user_agents: List[str]
    headers: Dict[str, str]
    uri_paths: List[str]
    beacon_path: str  # Where agents send beacons
    task_path: str    # Where agents fetch tasks
    result_path: str  # Where agents submit results


# ============================================
# PROFILE 1: MICROSOFT TEAMS (APT observed)
# ============================================
MICROSOFT_TEAMS_PROFILE = HttpProfile(
    name="microsoft_teams",
    description="Mimics Microsoft Teams client traffic (observed in APT29 campaigns)",
    user_agents=[
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Teams/1.5.00.10453 Chrome/98.0.4758.102 Electron/17.1.2 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Teams/1.4.00.26453 Chrome/91.0.4472.164 Electron/13.6.6 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Teams/1.5.00.10453 Chrome/98.0.4758.102 Electron/17.1.2 Safari/537.36",
    ],
    headers={
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://teams.microsoft.com",
        "Referer": "https://teams.microsoft.com/",
        "X-Ms-Client-Version": "1.5.00.10453",
    },
    uri_paths=[
        "/api/v1/presence/update",
        "/api/v1/notifications/poll",
        "/api/v1/sync/status",
    ],
    beacon_path="/api/v1/agents/beacon",  # Still uses actual beacon endpoint
    task_path="/api/v1/agents/{agent_id}/tasks",
    result_path="/api/v1/tasks/{task_id}/result"
)


# ============================================
# PROFILE 2: CHROME BROWSER (Common)
# ============================================
CHROME_BROWSER_PROFILE = HttpProfile(
    name="chrome_browser",
    description="Mimics Google Chrome browser traffic",
    user_agents=[
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ],
    headers={
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    },
    uri_paths=[
        "/search",
        "/api/analytics",
        "/cdn-cgi/trace",
        "/api/metrics",
    ],
    beacon_path="/api/v1/agents/beacon",
    task_path="/api/v1/agents/{agent_id}/tasks",
    result_path="/api/v1/tasks/{task_id}/result"
)


# ============================================
# PROFILE 3: SLACK (Enterprise Apps)
# ============================================
SLACK_PROFILE = HttpProfile(
    name="slack",
    description="Mimics Slack desktop client (common in corporate environments)",
    user_agents=[
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Slack/4.29.149 Chrome/100.0.4896.127 Electron/18.0.1 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Slack/4.29.149 Chrome/100.0.4896.127 Electron/18.0.1 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Slack/4.29.149 Chrome/100.0.4896.127 Electron/18.0.1 Safari/537.36",
    ],
    headers={
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Slack-Client": "desktop",
        "X-Slack-Version": "4.29.149",
    },
    uri_paths=[
        "/api/client.boot",
        "/api/client.counts",
        "/api/users.activity",
    ],
    beacon_path="/api/v1/agents/beacon",
    task_path="/api/v1/agents/{agent_id}/tasks",
    result_path="/api/v1/tasks/{task_id}/result"
)


# ============================================
# PROFILE 4: WINDOWS UPDATE (System Traffic)
# ============================================
WINDOWS_UPDATE_PROFILE = HttpProfile(
    name="windows_update",
    description="Mimics Windows Update traffic (highly trusted, rarely blocked)",
    user_agents=[
        "Microsoft-Delivery-Optimization/10.0",
        "Microsoft-WNS/10.0",
        "Windows-Update-Agent/10.0.10011.16384 Client-Protocol/2.0",
    ],
    headers={
        "MS-CV": "lWz8HqPJpEKf3dT8.0",
        "Content-Type": "application/soap+xml; charset=utf-8",
    },
    uri_paths=[
        "/v6/windowsupdate/a/stats",
        "/v6/windowsupdate/a/reporting",
        "/v6/windowsupdate/a/ServiceInformation",
    ],
    beacon_path="/api/v1/agents/beacon",
    task_path="/api/v1/agents/{agent_id}/tasks",
    result_path="/api/v1/tasks/{task_id}/result"
)


# ============================================
# PROFILE REGISTRY
# ============================================
AVAILABLE_PROFILES: Dict[str, HttpProfile] = {
    "microsoft_teams": MICROSOFT_TEAMS_PROFILE,
    "chrome_browser": CHROME_BROWSER_PROFILE,
    "slack": SLACK_PROFILE,
    "windows_update": WINDOWS_UPDATE_PROFILE,
}


def get_profile(profile_name: str = "chrome_browser") -> HttpProfile:
    """
    Get a communication profile by name.
    
    Args:
        profile_name: Name of profile (default: chrome_browser)
        
    Returns:
        HttpProfile object
    """
    return AVAILABLE_PROFILES.get(profile_name, CHROME_BROWSER_PROFILE)


def get_random_user_agent(profile_name: str = "chrome_browser") -> str:
    """
    Get a random User-Agent from the profile.
    
    This rotates User-Agents to avoid fingerprinting.
    """
    profile = get_profile(profile_name)
    return random.choice(profile.user_agents)


def get_beacon_headers(profile_name: str = "chrome_browser") -> Dict[str, str]:
    """
    Get HTTP headers for beacon requests.
    
    Returns profile headers + randomized User-Agent.
    """
    profile = get_profile(profile_name)
    headers = profile.headers.copy()
    headers["User-Agent"] = get_random_user_agent(profile_name)
    return headers


def get_random_uri(profile_name: str = "chrome_browser") -> str:
    """
    Get a random URI path from the profile.
    
    Varies the request path to avoid static patterns.
    """
    profile = get_profile(profile_name)
    return random.choice(profile.uri_paths)


def get_profile_info_dict(profile_name: str) -> Dict:
    """
    Get profile information as a dictionary for embedding in agent.
    
    Returns serializable dict with all profile data.
    """
    profile = get_profile(profile_name)
    return {
        "name": profile.name,
        "description": profile.description,
        "user_agents": profile.user_agents,
        "headers": profile.headers,
        "uri_paths": profile.uri_paths,
        "beacon_path": profile.beacon_path,
        "task_path": profile.task_path,
        "result_path": profile.result_path
    }