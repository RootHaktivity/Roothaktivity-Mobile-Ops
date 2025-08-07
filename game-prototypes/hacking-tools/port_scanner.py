#!/usr/bin/env python3
"""
Port Scanner Prototype for Roothaktivity: Mobile Ops
Simulates realistic port scanning behavior for educational purposes
"""

import random
import time
import json
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class PortState(Enum):
    OPEN = "open"
    CLOSED = "closed"
    FILTERED = "filtered"

class ScanType(Enum):
    TCP_CONNECT = "tcp_connect"
    SYN_STEALTH = "syn_stealth"
    UDP_SCAN = "udp_scan"
    ACK_SCAN = "ack_scan"

@dataclass
class Port:
    number: int
    state: PortState
    service: str
    version: str
    banner: Optional[str] = None

@dataclass
class Target:
    ip: str
    hostname: Optional[str]
    os: Optional[str]
    ports: List[Port]
    response_time: float

class PortScanner:
    """Simulated port scanner with realistic behavior"""
    
    def __init__(self):
        self.common_ports = {
            21: ("ftp", "File Transfer Protocol"),
            22: ("ssh", "Secure Shell"),
            23: ("telnet", "Telnet"),
            25: ("smtp", "Simple Mail Transfer Protocol"),
            53: ("dns", "Domain Name System"),
            80: ("http", "Hypertext Transfer Protocol"),
            110: ("pop3", "Post Office Protocol v3"),
            143: ("imap", "Internet Message Access Protocol"),
            443: ("https", "HTTP Secure"),
            993: ("imaps", "IMAP Secure"),
            995: ("pop3s", "POP3 Secure"),
            3306: ("mysql", "MySQL Database"),
            3389: ("rdp", "Remote Desktop Protocol"),
            5432: ("postgresql", "PostgreSQL Database"),
            5900: ("vnc", "Virtual Network Computing"),
            6379: ("redis", "Redis Database"),
            27017: ("mongodb", "MongoDB Database")
        }
        
        self.service_versions = {
            "ssh": ["OpenSSH 8.2", "OpenSSH 7.4", "OpenSSH 6.9"],
            "http": ["Apache/2.4.41", "nginx/1.18.0", "Microsoft-IIS/10.0"],
            "https": ["Apache/2.4.41", "nginx/1.18.0", "Microsoft-IIS/10.0"],
            "ftp": ["vsftpd 3.0.3", "ProFTPD 1.3.6", "FileZilla Server"],
            "mysql": ["MySQL 8.0.25", "MySQL 5.7.34", "MariaDB 10.5.10"],
            "postgresql": ["PostgreSQL 13.3", "PostgreSQL 12.7", "PostgreSQL 11.12"]
        }
        
        self.banners = {
            "ssh": [
                "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.2",
                "SSH-2.0-OpenSSH_7.4",
                "SSH-2.0-OpenSSH_6.9p1"
            ],
            "http": [
                "HTTP/1.1 200 OK\r\nServer: Apache/2.4.41\r\n",
                "HTTP/1.1 200 OK\r\nServer: nginx/1.18.0\r\n",
                "HTTP/1.1 200 OK\r\nServer: Microsoft-IIS/10.0\r\n"
            ],
            "ftp": [
                "220 Welcome to Ubuntu FTP service.",
                "220 ProFTPD 1.3.6 Server ready.",
                "220-FileZilla Server 0.9.60"
            ]
        }

    def scan_target(self, target_ip: str, port_range: Tuple[int, int] = (1, 1000), 
                   scan_type: ScanType = ScanType.TCP_CONNECT, stealth: bool = False) -> Target:
        """
        Simulate scanning a target with specified parameters
        """
        print(f"[*] Starting port scan on {target_ip}")
        print(f"[*] Scan type: {scan_type.value}")
        print(f"[*] Port range: {port_range[0]}-{port_range[1]}")
        print(f"[*] Stealth mode: {'enabled' if stealth else 'disabled'}")
        print()
        
        # Simulate scan delay
        scan_delay = 0.1 if stealth else 0.05
        response_time = random.uniform(0.5, 2.0)
        
        # Generate hostname
        hostname = self._generate_hostname(target_ip)
        
        # Generate open ports based on target type
        open_ports = self._generate_open_ports(port_range)
        
        ports = []
        for port_num in range(port_range[0], port_range[1] + 1):
            if stealth:
                time.sleep(scan_delay)
            
            port = self._scan_port(port_num, port_num in open_ports, scan_type)
            ports.append(port)
            
            # Show progress for open/filtered ports
            if port.state in [PortState.OPEN, PortState.FILTERED]:
                print(f"[+] {port_num}/{scan_type.value.split('_')[0]} {port.state.value:>8} {port.service}")
        
        # Detect OS
        os_info = self._detect_os(open_ports)
        
        target = Target(
            ip=target_ip,
            hostname=hostname,
            os=os_info,
            ports=[p for p in ports if p.state != PortState.CLOSED],
            response_time=response_time
        )
        
        self._print_scan_results(target)
        return target

    def _generate_hostname(self, ip: str) -> Optional[str]:
        """Generate a realistic hostname"""
        if random.random() < 0.7:  # 70% chance of having a hostname
            prefixes = ["web", "mail", "ftp", "db", "app", "api", "dev", "test"]
            domains = ["company.com", "example.org", "corporation.net", "enterprise.com"]
            return f"{random.choice(prefixes)}.{random.choice(domains)}"
        return None

    def _generate_open_ports(self, port_range: Tuple[int, int]) -> List[int]:
        """Generate realistic open ports for a target"""
        # Common port combinations for different server types
        server_profiles = {
            "web_server": [22, 80, 443],
            "mail_server": [22, 25, 110, 143, 993, 995],
            "database_server": [22, 3306, 5432],
            "ftp_server": [21, 22, 80],
            "mixed_server": [21, 22, 25, 53, 80, 110, 443],
            "minimal": [22, 80],
            "development": [22, 80, 443, 3000, 8080, 8443, 9000]
        }
        
        profile = random.choice(list(server_profiles.keys()))
        base_ports = server_profiles[profile]
        
        # Filter ports within range
        open_ports = [p for p in base_ports if port_range[0] <= p <= port_range[1]]
        
        # Add some random ports
        if random.random() < 0.3:  # 30% chance of additional ports
            additional_ports = random.sample(
                range(port_range[0], min(port_range[1] + 1, 65536)), 
                k=random.randint(1, 3)
            )
            open_ports.extend(additional_ports)
        
        return list(set(open_ports))

    def _scan_port(self, port_num: int, is_open: bool, scan_type: ScanType) -> Port:
        """Simulate scanning a single port"""
        if is_open:
            state = PortState.OPEN
            if scan_type == ScanType.ACK_SCAN:
                state = PortState.FILTERED if random.random() < 0.3 else PortState.OPEN
        else:
            if scan_type == ScanType.UDP_SCAN:
                state = PortState.FILTERED if random.random() < 0.4 else PortState.CLOSED
            else:
                state = PortState.CLOSED
        
        # Get service info
        service_name = self.common_ports.get(port_num, (f"unknown-{port_num}", "Unknown service"))[0]
        
        # Generate version info for open ports
        version = ""
        banner = None
        if state == PortState.OPEN and service_name in self.service_versions:
            version = random.choice(self.service_versions[service_name])
            if service_name in self.banners:
                banner = random.choice(self.banners[service_name])
        
        return Port(
            number=port_num,
            state=state,
            service=service_name,
            version=version,
            banner=banner
        )

    def _detect_os(self, open_ports: List[int]) -> Optional[str]:
        """Simulate OS detection based on open ports"""
        os_signatures = {
            frozenset([22, 80, 443]): "Linux (Ubuntu/Debian)",
            frozenset([22, 25, 110, 143]): "Linux Mail Server",
            frozenset([3389]): "Windows Server",
            frozenset([22, 3306]): "Linux Database Server",
            frozenset([21, 22, 80]): "Linux Web/FTP Server"
        }
        
        open_set = frozenset(open_ports)
        for signature, os_name in os_signatures.items():
            if signature.issubset(open_set):
                return os_name
        
        # Fallback detection
        if 3389 in open_ports:
            return "Windows"
        elif 22 in open_ports:
            return "Linux/Unix"
        else:
            return "Unknown"

    def _print_scan_results(self, target: Target):
        """Print formatted scan results"""
        print("\n" + "="*60)
        print(f"SCAN RESULTS FOR {target.ip}")
        print("="*60)
        
        if target.hostname:
            print(f"Hostname: {target.hostname}")
        
        if target.os:
            print(f"OS Detection: {target.os}")
        
        print(f"Response time: {target.response_time:.2f}s")
        print()
        
        if target.ports:
            print("PORT     STATE    SERVICE      VERSION")
            print("-" * 45)
            for port in sorted(target.ports, key=lambda x: x.number):
                version_info = port.version[:20] if port.version else ""
                print(f"{port.number:<8} {port.state.value:<8} {port.service:<12} {version_info}")
            
            print(f"\nTotal open ports: {len([p for p in target.ports if p.state == PortState.OPEN])}")
        else:
            print("No open ports found.")
        
        print("="*60)

    def vulnerability_scan(self, target: Target) -> Dict:
        """Simulate vulnerability scanning on discovered services"""
        print(f"\n[*] Running vulnerability scan on {target.ip}")
        vulnerabilities = []
        
        for port in target.ports:
            if port.state == PortState.OPEN:
                vulns = self._check_service_vulnerabilities(port)
                vulnerabilities.extend(vulns)
                
                # Simulate scan delay
                time.sleep(0.5)
        
        return {
            "target": target.ip,
            "scan_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "vulnerabilities": vulnerabilities,
            "risk_score": self._calculate_risk_score(vulnerabilities)
        }

    def _check_service_vulnerabilities(self, port: Port) -> List[Dict]:
        """Check for vulnerabilities in a specific service"""
        vulns = []
        
        # Simulate vulnerability database
        vuln_db = {
            "ssh": [
                {"id": "CVE-2023-1001", "severity": "medium", "description": "SSH weak cipher support"},
                {"id": "CVE-2023-1002", "severity": "low", "description": "SSH banner disclosure"}
            ],
            "http": [
                {"id": "CVE-2023-2001", "severity": "high", "description": "HTTP server information disclosure"},
                {"id": "CVE-2023-2002", "severity": "medium", "description": "Missing security headers"}
            ],
            "https": [
                {"id": "CVE-2023-2003", "severity": "medium", "description": "SSL/TLS weak cipher suites"},
                {"id": "CVE-2023-2004", "severity": "low", "description": "Certificate information disclosure"}
            ],
            "mysql": [
                {"id": "CVE-2023-3001", "severity": "critical", "description": "MySQL authentication bypass"},
                {"id": "CVE-2023-3002", "severity": "high", "description": "MySQL privilege escalation"}
            ]
        }
        
        if port.service in vuln_db:
            # Randomly select vulnerabilities
            available_vulns = vuln_db[port.service]
            num_vulns = random.randint(0, len(available_vulns))
            selected_vulns = random.sample(available_vulns, num_vulns)
            
            for vuln in selected_vulns:
                vulns.append({
                    **vuln,
                    "port": port.number,
                    "service": port.service,
                    "version": port.version
                })
                print(f"[!] {vuln['severity'].upper()}: {vuln['description']} (Port {port.number})")
        
        return vulns

    def _calculate_risk_score(self, vulnerabilities: List[Dict]) -> int:
        """Calculate overall risk score based on vulnerabilities"""
        severity_weights = {
            "critical": 10,
            "high": 7,
            "medium": 4,
            "low": 1
        }
        
        total_score = sum(severity_weights.get(vuln["severity"], 0) for vuln in vulnerabilities)
        return min(total_score, 100)

    def export_results(self, target: Target, filename: str = None):
        """Export scan results to JSON"""
        if not filename:
            filename = f"scan_{target.ip.replace('.', '_')}_{int(time.time())}.json"
        
        data = {
            "target": {
                "ip": target.ip,
                "hostname": target.hostname,
                "os": target.os,
                "response_time": target.response_time
            },
            "scan_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "ports": [
                {
                    "number": port.number,
                    "state": port.state.value,
                    "service": port.service,
                    "version": port.version,
                    "banner": port.banner
                }
                for port in target.ports
            ]
        }
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"\n[*] Results exported to {filename}")

def main():
    """Demo the port scanner"""
    scanner = PortScanner()
    
    # Example targets
    targets = [
        "192.168.1.100",
        "10.0.0.50",
        "172.16.1.200"
    ]
    
    for target_ip in targets:
        print(f"\n{'='*60}")
        print(f"SCANNING TARGET: {target_ip}")
        print(f"{'='*60}")
        
        # Perform scan
        target = scanner.scan_target(
            target_ip=target_ip,
            port_range=(1, 1000),
            scan_type=ScanType.TCP_CONNECT,
            stealth=False
        )
        
        # Vulnerability scan
        vuln_results = scanner.vulnerability_scan(target)
        
        # Export results
        scanner.export_results(target)
        
        print(f"\nRisk Score: {vuln_results['risk_score']}/100")
        
        # Simulate delay between targets
        time.sleep(1)

if __name__ == "__main__":
    main()