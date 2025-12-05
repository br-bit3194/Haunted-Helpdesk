"""
Network Diagnostic Tools for Haunted Helpdesk

Provides network troubleshooting capabilities including ping, traceroute, and DNS resolution checks.
"""

import subprocess
import platform
from typing import Dict, Any
from strands.tools import tool


@tool
def ping_host(hostname: str, count: int = 4) -> Dict[str, Any]:
    """
    Test network connectivity to a host using ping.
    
    Args:
        hostname: The hostname or IP address to ping
        count: Number of ping packets to send (default: 4)
    
    Returns:
        Dictionary containing:
        - success: Boolean indicating if ping completed
        - hostname: The target hostname
        - output: Ping command output
        - return_code: Command return code (0 = success, non-zero = failure)
        - error: Error message if operation failed
    """
    try:
        # Determine ping command based on OS
        system = platform.system().lower()
        
        if system == "windows":
            cmd = ["ping", "-n", str(count), hostname]
        else:  # Linux, macOS, etc.
            cmd = ["ping", "-c", str(count), hostname]
        
        # Execute ping with timeout
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout
        )
        
        return {
            "success": result.returncode == 0,
            "hostname": hostname,
            "output": result.stdout if result.stdout else result.stderr,
            "return_code": result.returncode,
            "error": None if result.returncode == 0 else "Ping failed or host unreachable"
        }
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": f"Ping operation timed out after 30 seconds for host {hostname}"
        }
    except FileNotFoundError:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": "Ping command not found on system"
        }
    except Exception as e:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": f"Unexpected error during ping: {str(e)}"
        }


@tool
def traceroute_host(hostname: str) -> Dict[str, Any]:
    """
    Trace the network route to a host.
    
    Args:
        hostname: The hostname or IP address to trace
    
    Returns:
        Dictionary containing:
        - success: Boolean indicating if traceroute completed
        - hostname: The target hostname
        - output: Traceroute command output showing hop-by-hop path
        - return_code: Command return code
        - error: Error message if operation failed
    """
    try:
        # Determine traceroute command based on OS
        system = platform.system().lower()
        
        if system == "windows":
            cmd = ["tracert", hostname]
        else:  # Linux, macOS, etc.
            cmd = ["traceroute", hostname]
        
        # Execute traceroute with timeout
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60  # 60 second timeout for traceroute
        )
        
        return {
            "success": result.returncode == 0,
            "hostname": hostname,
            "output": result.stdout if result.stdout else result.stderr,
            "return_code": result.returncode,
            "error": None if result.returncode == 0 else "Traceroute failed or incomplete"
        }
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": f"Traceroute operation timed out after 60 seconds for host {hostname}"
        }
    except FileNotFoundError:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": "Traceroute command not found on system. Install traceroute or use tracert on Windows."
        }
    except Exception as e:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": f"Unexpected error during traceroute: {str(e)}"
        }


@tool
def check_dns_resolution(hostname: str) -> Dict[str, Any]:
    """
    Check DNS resolution for a hostname using nslookup.
    
    Args:
        hostname: The hostname to resolve
    
    Returns:
        Dictionary containing:
        - success: Boolean indicating if DNS resolution succeeded
        - hostname: The target hostname
        - output: DNS lookup results including IP addresses and DNS server info
        - return_code: Command return code
        - error: Error message if operation failed
    """
    try:
        # nslookup is available on Windows, Linux, and macOS
        cmd = ["nslookup", hostname]
        
        # Execute nslookup with timeout
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=15  # 15 second timeout
        )
        
        # nslookup returns 0 on success, but we also check if output contains useful info
        success = result.returncode == 0 and "Address" in result.stdout
        
        return {
            "success": success,
            "hostname": hostname,
            "output": result.stdout if result.stdout else result.stderr,
            "return_code": result.returncode,
            "error": None if success else "DNS resolution failed or hostname not found"
        }
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": f"DNS lookup timed out after 15 seconds for hostname {hostname}"
        }
    except FileNotFoundError:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": "nslookup command not found on system"
        }
    except Exception as e:
        return {
            "success": False,
            "hostname": hostname,
            "output": "",
            "return_code": -1,
            "error": f"Unexpected error during DNS lookup: {str(e)}"
        }
