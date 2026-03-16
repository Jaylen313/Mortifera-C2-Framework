# Malleable C2 Communication Profiles

## Overview

Modern C2 frameworks disguise their network traffic as legitimate applications to evade detection. This module implements **Malleable C2 Profiles** - a technique pioneered by Cobalt Strike and adopted by most advanced C2 frameworks.

## How It Works

### Traditional C2 (DETECTABLE):
```
User-Agent: Python-urllib/3.8
POST /beacon
```
**Problem:** Generic headers scream "malware!"

### Malleable C2 (STEALTHY):
```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Teams/1.5.00.10453 Chrome/98.0.4758.102 Electron/17.1.2 Safari/537.36
X-Ms-Client-Version: 1.5.00.10453
Origin: https://teams.microsoft.com
POST /api/v1/presence/update
```
**Result:** Looks like Microsoft Teams traffic!

## Available Profiles

### 1. Microsoft Teams (`microsoft_teams`)
**Use Case:** Corporate environments with Teams deployed  
**Detection Risk:** LOW (Teams traffic is common and trusted)  
**APT Usage:** Observed in APT29 (Cozy Bear) campaigns  

**Traffic Pattern:**
- Mimics Teams desktop client
- Uses Teams-specific headers (`X-Ms-Client-Version`)
- Beacon path: `/api/v1/presence/update`

### 2. Chrome Browser (`chrome_browser`)
**Use Case:** General web browsing simulation  
**Detection Risk:** LOW (ubiquitous browser traffic)  
**APT Usage:** Common in many campaigns  

**Traffic Pattern:**
- Standard browser headers
- Rotates Chrome versions
- Beacon path: `/api/analytics`

### 3. Slack (`slack`)
**Use Case:** Tech companies, startups  
**Detection Risk:** LOW (common enterprise chat tool)  
**APT Usage:** Observed in targeted corporate espionage  

**Traffic Pattern:**
- Slack desktop client User-Agent
- Slack-specific headers (`X-Slack-Client`)
- Beacon path: `/api/client.counts`

### 4. Windows Update (`windows_update`)
**Use Case:** Windows environments  
**Detection Risk:** VERY LOW (system traffic, rarely blocked)  
**APT Usage:** Multiple APT groups (SolarWinds attackers used similar)  

**Traffic Pattern:**
- Microsoft system service User-Agent
- SOAP/XML content-type
- Beacon path: `/v6/windowsupdate/a/reporting`

## Usage in Agent Generator

When generating agents, specify a profile:
```python
# In agent template
PROFILE_NAME = "{{PROFILE}}"  # e.g., "microsoft_teams"

# Agent uses profile headers when beaconing
headers = get_beacon_headers(PROFILE_NAME)
```

## Real-World Examples

### Cobalt Strike Malleable C2
Cobalt Strike's profiles allow complete customization:
- HTTP method (GET/POST)
- URI paths
- Headers
- Request/response body transformations
- Sleep time obfuscation

**Our implementation** is simplified but follows the same principles.

### APT29 (Cozy Bear) - WellMess Campaign
Used custom User-Agents mimicking Google Chrome and Windows Update to blend in with normal traffic.

**Reference:** MITRE ATT&CK T1071.001 (Application Layer Protocol: Web Protocols)

## Detection & Mitigation

**How Defenders Detect This:**
- TLS certificate inspection
- Behavioral analysis (non-browser making browser requests)
- Endpoint detection (process parent-child relationships)
- Network timing analysis (too regular intervals)

**Our Jitter Feature** helps with timing analysis!

## For Research Paper

This implementation demonstrates understanding of:
1. **MITRE ATT&CK T1071** - Application Layer Protocol
2. **MITRE ATT&CK T1573** - Encrypted Channel (future: add AES encryption)
3. **Real-world APT TTPs** - Teams/Slack/Windows Update mimicry
4. **Evasion techniques** - User-Agent rotation, custom headers
```

---

## **FOR YOUR RESEARCH PAPER:**

**Section to add:** *"4.3 Communication Obfuscation Techniques"*
```
Modern C2 frameworks employ Malleable C2 profiles to disguise 
command-and-control traffic as legitimate application communications. 
The Mortifera framework implements this technique with four pre-configured 
profiles mimicking Microsoft Teams, Chrome browser, Slack, and Windows Update 
traffic patterns. This approach, documented in MITRE ATT&CK technique T1071.001, 
has been observed in real-world campaigns by APT29 and other nation-state actors.


# Malleable C2 Communication Profiles

## Overview

Modern C2 frameworks disguise their network traffic as legitimate applications to evade detection. This module implements **Malleable C2 Profiles** - a technique pioneered by Cobalt Strike and adopted by most advanced C2 frameworks.

## How It Works

### Traditional C2 (DETECTABLE):
```
User-Agent: Python-urllib/3.8
POST /beacon
```
**Problem:** Generic headers scream "malware!"

### Malleable C2 (STEALTHY):
```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Teams/1.5.00.10453 Chrome/98.0.4758.102 Electron/17.1.2 Safari/537.36
X-Ms-Client-Version: 1.5.00.10453
Origin: https://teams.microsoft.com
POST /api/v1/agents/beacon
```
**Result:** Looks like Microsoft Teams traffic!

## Available Profiles

### 1. Microsoft Teams (`microsoft_teams`)
**Use Case:** Corporate environments with Teams deployed  
**Detection Risk:** LOW (Teams traffic is common and trusted)  
**APT Usage:** Observed in APT29 (Cozy Bear) campaigns  

### 2. Chrome Browser (`chrome_browser`)
**Use Case:** General web browsing simulation  
**Detection Risk:** LOW (ubiquitous browser traffic)  

### 3. Slack (`slack`)
**Use Case:** Tech companies, startups  
**Detection Risk:** LOW (common enterprise chat tool)  

### 4. Windows Update (`windows_update`)
**Use Case:** Windows environments  
**Detection Risk:** VERY LOW (system traffic, rarely blocked)  
**APT Usage:** Multiple APT groups (SolarWinds attackers used similar)  

## Real-World Examples

### APT29 (Cozy Bear) - WellMess Campaign
Used custom User-Agents mimicking Google Chrome and Windows Update to blend in with normal traffic.

**Reference:** MITRE ATT&CK T1071.001 (Application Layer Protocol: Web Protocols)

## For Research Paper

This implementation demonstrates understanding of:
1. **MITRE ATT&CK T1071** - Application Layer Protocol
2. **Real-world APT TTPs** - Teams/Slack/Windows Update mimicry
3. **Evasion techniques** - User-Agent rotation, custom headers