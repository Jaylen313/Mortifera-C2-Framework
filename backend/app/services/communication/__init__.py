"""
Communication services package.
"""

from .profiles import (
    HttpProfile,
    get_profile,
    get_random_user_agent,
    get_beacon_headers,
    get_random_uri,
    AVAILABLE_PROFILES,
    MICROSOFT_TEAMS_PROFILE,
    CHROME_BROWSER_PROFILE,
    SLACK_PROFILE,
    WINDOWS_UPDATE_PROFILE
)

__all__ = [
    'HttpProfile',
    'get_profile',
    'get_random_user_agent',
    'get_beacon_headers',
    'get_random_uri',
    'AVAILABLE_PROFILES',
    'MICROSOFT_TEAMS_PROFILE',
    'CHROME_BROWSER_PROFILE',
    'SLACK_PROFILE',
    'WINDOWS_UPDATE_PROFILE'
]