const { v4: uuidv4 } = require('uuid')

class MissionGenerator {
  // Mission templates by category
  static templates = {
    web_security: {
      title: "Web Application Penetration",
      backgrounds: [
        "A corporate website has been compromised. Your task is to identify and exploit the vulnerabilities.",
        "An e-commerce platform is suspected of having security flaws. Investigate and gain access.",
        "A government portal needs security assessment. Find the weaknesses before malicious actors do."
      ],
      steps: [
        { type: 'port_scan', tools: ['nmap', 'masscan'] },
        { type: 'vulnerability_scan', tools: ['nikto', 'dirb'] },
        { type: 'exploit', tools: ['sqlmap', 'burp_suite'] },
        { type: 'privilege_escalation', tools: ['metasploit', 'custom_scripts'] },
        { type: 'data_extraction', tools: ['wget', 'curl'] }
      ],
      targets: [
        { type: 'web_server', services: ['http', 'https', 'ssh'] },
        { type: 'database', services: ['mysql', 'postgresql'] }
      ]
    },
    network_penetration: {
      title: "Network Infrastructure Assessment",
      backgrounds: [
        "A corporate network has been breached. Map the infrastructure and find the attack vectors.",
        "An internal network assessment is required. Identify all systems and their vulnerabilities.",
        "A DMZ configuration needs testing. Attempt to pivot into the internal network."
      ],
      steps: [
        { type: 'port_scan', tools: ['nmap', 'zmap'] },
        { type: 'vulnerability_scan', tools: ['nessus', 'openvas'] },
        { type: 'exploit', tools: ['metasploit', 'exploit_db'] },
        { type: 'privilege_escalation', tools: ['powershell', 'linux_exploits'] },
        { type: 'stealth_mode', tools: ['proxychains', 'tor'] }
      ],
      targets: [
        { type: 'network_device', services: ['snmp', 'telnet', 'ssh'] },
        { type: 'workstation', services: ['rdp', 'vnc', 'smb'] }
      ]
    },
    social_engineering: {
      title: "Human Factor Assessment",
      backgrounds: [
        "Employee awareness testing is required. Assess susceptibility to social engineering attacks.",
        "A phishing campaign simulation needs to be conducted against the organization.",
        "Physical security assessment through social engineering techniques is needed."
      ],
      steps: [
        { type: 'vulnerability_scan', tools: ['osint_tools', 'social_media_scraping'] },
        { type: 'exploit', tools: ['phishing_framework', 'vishing_tools'] },
        { type: 'data_extraction', tools: ['email_harvesting', 'credential_collection'] },
        { type: 'stealth_mode', tools: ['anonymous_communication', 'identity_masking'] }
      ],
      targets: [
        { type: 'workstation', services: ['email', 'social_media'] },
        { type: 'mobile_device', services: ['sms', 'messaging_apps'] }
      ]
    },
    malware_analysis: {
      title: "Malware Investigation",
      backgrounds: [
        "A suspicious file has been detected in the network. Analyze its behavior and impact.",
        "A potential APT attack is underway. Reverse engineer the malware to understand the threat.",
        "Incident response requires detailed malware analysis to determine the scope of infection."
      ],
      steps: [
        { type: 'vulnerability_scan', tools: ['file_analysis', 'hex_editor'] },
        { type: 'exploit', tools: ['disassembler', 'debugger'] },
        { type: 'data_extraction', tools: ['memory_dump', 'network_capture'] },
        { type: 'forensics', tools: ['volatility', 'autopsy'] }
      ],
      targets: [
        { type: 'workstation', services: ['file_system', 'registry'] },
        { type: 'network_device', services: ['traffic_analysis'] }
      ]
    },
    forensics: {
      title: "Digital Forensics Investigation",
      backgrounds: [
        "A security incident has occurred. Conduct a thorough forensic investigation.",
        "Data breach investigation requires analysis of compromised systems.",
        "Legal proceedings need digital evidence collection and analysis."
      ],
      steps: [
        { type: 'data_extraction', tools: ['dd', 'dcfldd'] },
        { type: 'vulnerability_scan', tools: ['file_carving', 'timeline_analysis'] },
        { type: 'forensics', tools: ['sleuthkit', 'volatility'] },
        { type: 'stealth_mode', tools: ['evidence_preservation', 'chain_of_custody'] }
      ],
      targets: [
        { type: 'workstation', services: ['file_system', 'memory'] },
        { type: 'mobile_device', services: ['app_data', 'communications'] }
      ]
    }
  }

  // Vulnerability databases
  static vulnerabilities = {
    web_server: [
      { id: 'CVE-2023-1001', name: 'SQL Injection', severity: 'high' },
      { id: 'CVE-2023-1002', name: 'Cross-Site Scripting', severity: 'medium' },
      { id: 'CVE-2023-1003', name: 'Authentication Bypass', severity: 'critical' },
      { id: 'CVE-2023-1004', name: 'Directory Traversal', severity: 'medium' },
      { id: 'CVE-2023-1005', name: 'Remote Code Execution', severity: 'critical' }
    ],
    database: [
      { id: 'CVE-2023-2001', name: 'Privilege Escalation', severity: 'high' },
      { id: 'CVE-2023-2002', name: 'Information Disclosure', severity: 'medium' },
      { id: 'CVE-2023-2003', name: 'Weak Authentication', severity: 'medium' }
    ],
    network_device: [
      { id: 'CVE-2023-3001', name: 'Default Credentials', severity: 'high' },
      { id: 'CVE-2023-3002', name: 'Buffer Overflow', severity: 'critical' },
      { id: 'CVE-2023-3003', name: 'Configuration Weakness', severity: 'medium' }
    ],
    workstation: [
      { id: 'CVE-2023-4001', name: 'Local Privilege Escalation', severity: 'high' },
      { id: 'CVE-2023-4002', name: 'DLL Hijacking', severity: 'medium' },
      { id: 'CVE-2023-4003', name: 'Weak File Permissions', severity: 'low' }
    ]
  }

  // Generate IP addresses
  static generateIP() {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }

  // Generate ports
  static generatePorts(type) {
    const portMap = {
      web_server: [80, 443, 8080, 8443],
      database: [3306, 5432, 1433, 27017],
      network_device: [22, 23, 161, 443],
      workstation: [22, 3389, 5900, 445],
      mobile_device: [80, 443]
    }
    
    const commonPorts = portMap[type] || [80, 443, 22]
    const selectedPorts = commonPorts.slice(0, Math.floor(Math.random() * 3) + 1)
    
    return selectedPorts.map(port => ({
      number: port,
      service: this.getServiceName(port),
      version: this.generateVersion(),
      state: Math.random() > 0.2 ? 'open' : 'filtered'
    }))
  }

  static getServiceName(port) {
    const services = {
      22: 'ssh', 23: 'telnet', 80: 'http', 443: 'https',
      3306: 'mysql', 5432: 'postgresql', 1433: 'mssql',
      3389: 'rdp', 5900: 'vnc', 445: 'smb', 161: 'snmp'
    }
    return services[port] || 'unknown'
  }

  static generateVersion() {
    const major = Math.floor(Math.random() * 5) + 1
    const minor = Math.floor(Math.random() * 10)
    const patch = Math.floor(Math.random() * 20)
    return `${major}.${minor}.${patch}`
  }

  // Generate mission based on parameters
  static async generate(params) {
    const { difficulty, category, playerLevel, playerSkills } = params
    const template = this.templates[category]
    
    if (!template) {
      throw new Error(`Unknown category: ${category}`)
    }

    // Select random background
    const background = template.backgrounds[Math.floor(Math.random() * template.backgrounds.length)]
    
    // Generate title variation
    const titleVariations = [
      `${template.title} - Level ${difficulty}`,
      `Advanced ${template.title}`,
      `${template.title} Challenge`,
      `Critical ${template.title} Assessment`
    ]
    const title = titleVariations[Math.floor(Math.random() * titleVariations.length)]

    // Generate objectives
    const objectives = this.generateObjectives(category, difficulty)
    
    // Generate targets
    const targets = this.generateTargets(template.targets, difficulty)
    
    // Generate steps
    const steps = this.generateSteps(template.steps, difficulty, playerLevel)
    
    // Generate AR puzzles based on difficulty
    const arPuzzles = this.generateARPuzzles(difficulty)
    
    // Calculate estimated duration
    const estimatedDuration = Math.max(10, steps.length * (5 + difficulty * 2))
    
    // Generate rewards based on difficulty
    const rewards = {
      experience: difficulty * 50 + Math.floor(Math.random() * 100),
      skillPoints: difficulty * 5 + Math.floor(Math.random() * 10),
      currency: difficulty * 25 + Math.floor(Math.random() * 50),
      tools: this.generateToolRewards(difficulty),
      achievements: this.generateAchievements(category, difficulty)
    }

    return {
      title,
      description: `A ${difficulty}/10 difficulty ${category.replace('_', ' ')} mission designed for level ${playerLevel} operators.`,
      storyline: {
        background,
        objective: objectives.primary,
        briefing: this.generateBriefing(category, difficulty, objectives),
        debriefing: "Mission completed. Analyze your performance and prepare for the next challenge."
      },
      difficulty,
      category,
      estimatedDuration,
      prerequisites: {
        level: Math.max(1, difficulty - 2),
        skills: this.generateSkillRequirements(category, difficulty),
        completedMissions: []
      },
      targets,
      steps,
      arPuzzles,
      rewards,
      settings: {
        allowHints: difficulty <= 7,
        maxAttempts: difficulty <= 5 ? 3 : 2,
        timeLimit: estimatedDuration * 90, // 1.5x estimated time
        dynamicDifficulty: true,
        recordSession: true
      }
    }
  }

  static generateObjectives(category, difficulty) {
    const objectiveMap = {
      web_security: {
        primary: "Identify and exploit web application vulnerabilities to gain unauthorized access",
        secondary: ["Extract sensitive data", "Maintain persistence", "Cover tracks"]
      },
      network_penetration: {
        primary: "Compromise network infrastructure and pivot to critical systems",
        secondary: ["Map network topology", "Escalate privileges", "Access domain controllers"]
      },
      social_engineering: {
        primary: "Test human factors and exploit trust relationships",
        secondary: ["Gather personal information", "Execute phishing attacks", "Gain physical access"]
      },
      malware_analysis: {
        primary: "Analyze malicious software and determine its capabilities",
        secondary: ["Identify attack vectors", "Extract IOCs", "Develop signatures"]
      },
      forensics: {
        primary: "Investigate security incident and collect digital evidence",
        secondary: ["Timeline reconstruction", "Artifact analysis", "Report generation"]
      }
    }
    
    return objectiveMap[category] || objectiveMap.web_security
  }

  static generateTargets(templateTargets, difficulty) {
    const numTargets = Math.min(difficulty, templateTargets.length)
    const selectedTargets = templateTargets.slice(0, numTargets)
    
    return selectedTargets.map(target => ({
      name: `Target-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      type: target.type,
      ip: this.generateIP(),
      ports: this.generatePorts(target.type),
      vulnerabilities: this.generateVulnerabilities(target.type, difficulty),
      credentials: this.generateCredentials(difficulty),
      defenses: this.generateDefenses(difficulty)
    }))
  }

  static generateVulnerabilities(targetType, difficulty) {
    const availableVulns = this.vulnerabilities[targetType] || this.vulnerabilities.web_server
    const numVulns = Math.min(difficulty, availableVulns.length)
    
    return availableVulns
      .sort(() => 0.5 - Math.random())
      .slice(0, numVulns)
      .map(vuln => ({
        ...vuln,
        exploitable: Math.random() > 0.3
      }))
  }

  static generateCredentials(difficulty) {
    const usernames = ['admin', 'administrator', 'root', 'user', 'guest', 'service']
    const passwords = ['password', '123456', 'admin', 'letmein', 'welcome', 'qwerty']
    
    const numCreds = Math.max(1, Math.floor(difficulty / 3))
    const credentials = []
    
    for (let i = 0; i < numCreds; i++) {
      credentials.push({
        username: usernames[Math.floor(Math.random() * usernames.length)],
        password: passwords[Math.floor(Math.random() * passwords.length)],
        privilege: Math.random() > 0.5 ? 'admin' : 'user'
      })
    }
    
    return credentials
  }

  static generateDefenses(difficulty) {
    const defenseTypes = ['firewall', 'ids', 'antivirus', 'dlp', 'siem']
    const numDefenses = Math.min(difficulty, defenseTypes.length)
    
    return defenseTypes.slice(0, numDefenses).map(type => ({
      type,
      level: Math.floor(Math.random() * difficulty) + 1,
      active: Math.random() > 0.2
    }))
  }

  static generateSteps(templateSteps, difficulty, playerLevel) {
    const numSteps = Math.min(difficulty + 2, templateSteps.length)
    const selectedSteps = templateSteps.slice(0, numSteps)
    
    return selectedSteps.map((step, index) => ({
      stepId: uuidv4(),
      type: step.type,
      description: this.generateStepDescription(step.type, difficulty),
      tools: step.tools,
      difficulty: Math.min(10, Math.max(1, difficulty + Math.floor(Math.random() * 3) - 1)),
      timeLimit: (difficulty + index) * 30, // seconds
      hints: this.generateHints(step.type, difficulty),
      solution: this.generateSolution(step.type, difficulty),
      completed: false,
      attempts: 0
    }))
  }

  static generateStepDescription(stepType, difficulty) {
    const descriptions = {
      port_scan: [
        "Scan the target system to identify open ports and services",
        "Perform comprehensive port scanning to map the attack surface",
        "Use advanced scanning techniques to bypass detection systems"
      ],
      vulnerability_scan: [
        "Identify security vulnerabilities in the discovered services",
        "Conduct detailed vulnerability assessment of target systems",
        "Analyze target for exploitable security weaknesses"
      ],
      exploit: [
        "Exploit identified vulnerabilities to gain initial access",
        "Execute carefully crafted attacks against vulnerable services",
        "Deploy advanced exploitation techniques for system compromise"
      ],
      privilege_escalation: [
        "Escalate privileges to gain administrative access",
        "Use local exploits to increase system permissions",
        "Implement advanced techniques for privilege escalation"
      ],
      data_extraction: [
        "Extract sensitive data from compromised systems",
        "Locate and exfiltrate valuable information assets",
        "Implement covert data extraction methodologies"
      ],
      stealth_mode: [
        "Maintain stealth and avoid detection systems",
        "Implement anti-forensic techniques to cover tracks",
        "Use advanced evasion methods to maintain persistence"
      ]
    }
    
    const stepDescriptions = descriptions[stepType] || descriptions.port_scan
    const difficultyIndex = Math.min(stepDescriptions.length - 1, Math.floor((difficulty - 1) / 3))
    return stepDescriptions[difficultyIndex]
  }

  static generateHints(stepType, difficulty) {
    const hintMap = {
      port_scan: [
        "Try using nmap with stealth scanning options",
        "Consider using different scan types for better results",
        "Some ports might be filtered - try various techniques"
      ],
      vulnerability_scan: [
        "Focus on web application vulnerabilities first",
        "Check for default credentials on discovered services",
        "Look for version-specific vulnerabilities"
      ],
      exploit: [
        "Research the specific vulnerability for exploitation methods",
        "Consider using automated exploitation frameworks",
        "Manual exploitation might be required for complex vulnerabilities"
      ],
      privilege_escalation: [
        "Check for SUID binaries and writable files",
        "Look for kernel exploits based on system version",
        "Examine running processes for potential privilege escalation"
      ],
      data_extraction: [
        "Look for database files and configuration data",
        "Check user directories for sensitive information",
        "Consider using compression to reduce data size"
      ],
      stealth_mode: [
        "Clear system logs and command history",
        "Use encrypted channels for communication",
        "Modify timestamps to avoid detection"
      ]
    }
    
    const hints = hintMap[stepType] || hintMap.port_scan
    const maxHints = Math.max(1, Math.floor(4 - difficulty / 3))
    return hints.slice(0, maxHints)
  }

  static generateSolution(stepType, difficulty) {
    const solutionMap = {
      port_scan: {
        commands: ['nmap -sS -O target_ip', 'masscan -p1-65535 target_ip'],
        expectedOutput: 'open_ports_list'
      },
      vulnerability_scan: {
        commands: ['nikto -h target_ip', 'nessus_scan target_ip'],
        expectedOutput: 'vulnerability_report'
      },
      exploit: {
        commands: ['msfconsole', 'use exploit/specific_exploit', 'set RHOSTS target_ip'],
        expectedOutput: 'shell_access'
      },
      privilege_escalation: {
        commands: ['sudo -l', 'find / -perm -4000 -type f 2>/dev/null'],
        expectedOutput: 'root_access'
      },
      data_extraction: {
        commands: ['find /home -name "*.txt" -o -name "*.doc"', 'tar -czf data.tar.gz /target/data/'],
        expectedOutput: 'extracted_files'
      },
      stealth_mode: {
        commands: ['history -c', 'rm ~/.bash_history', 'touch -r /bin/ls /var/log/auth.log'],
        expectedOutput: 'cleaned_traces'
      }
    }
    
    return solutionMap[stepType] || solutionMap.port_scan
  }

  static generateARPuzzles(difficulty) {
    if (difficulty < 3) return [] // No AR puzzles for easy missions
    
    const puzzleTypes = ['qr_scan', 'object_recognition', 'pattern_matching']
    const numPuzzles = Math.min(2, Math.floor(difficulty / 3))
    
    return Array.from({ length: numPuzzles }, (_, index) => ({
      id: uuidv4(),
      type: puzzleTypes[index % puzzleTypes.length],
      description: this.generateARPuzzleDescription(puzzleTypes[index % puzzleTypes.length]),
      triggerConditions: this.generateARTriggerConditions(puzzleTypes[index % puzzleTypes.length]),
      solution: this.generateARSolution(puzzleTypes[index % puzzleTypes.length]),
      rewards: {
        experience: difficulty * 10,
        skillPoints: difficulty * 2,
        tools: ['advanced_scanner']
      },
      completed: false
    }))
  }

  static generateARPuzzleDescription(type) {
    const descriptions = {
      qr_scan: "Scan the QR code in your environment to reveal hidden network credentials",
      object_recognition: "Identify and interact with the security camera to access its feed",
      pattern_matching: "Match the network topology pattern visible in the AR overlay"
    }
    return descriptions[type]
  }

  static generateARTriggerConditions(type) {
    const conditions = {
      qr_scan: { patterns: ['security_qr_code'] },
      object_recognition: { objects: ['security_camera', 'network_switch'] },
      pattern_matching: { patterns: ['network_diagram', 'circuit_board'] }
    }
    return conditions[type]
  }

  static generateARSolution(type) {
    const solutions = {
      qr_scan: { expectedInput: 'qr_code_data', validAnswers: ['admin:password123'] },
      object_recognition: { expectedInput: 'camera_ip', validAnswers: ['192.168.1.100'] },
      pattern_matching: { expectedInput: 'topology_match', validAnswers: ['network_map_correct'] }
    }
    return solutions[type]
  }

  static generateSkillRequirements(category, difficulty) {
    const skillMap = {
      web_security: ['cryptography', 'networkAnalysis'],
      network_penetration: ['networkAnalysis', 'penetrationTesting'],
      social_engineering: ['socialEngineering', 'forensics'],
      malware_analysis: ['malwareDevelopment', 'forensics'],
      forensics: ['forensics', 'cryptography']
    }
    
    const skills = skillMap[category] || skillMap.web_security
    const minLevel = Math.max(0, difficulty * 5 - 10)
    
    return skills.map(skill => ({
      skill,
      minLevel
    }))
  }

  static generateToolRewards(difficulty) {
    const tools = {
      1: ['basic_scanner'],
      3: ['advanced_scanner', 'payload_generator'],
      5: ['custom_exploit_kit', 'steganography_tools'],
      7: ['ai_assistant', 'zero_day_exploits'],
      9: ['quantum_decryptor', 'neural_network_analyzer']
    }
    
    const applicableTools = []
    for (const [level, levelTools] of Object.entries(tools)) {
      if (difficulty >= parseInt(level)) {
        applicableTools.push(...levelTools)
      }
    }
    
    return applicableTools.slice(0, Math.max(1, Math.floor(difficulty / 2)))
  }

  static generateAchievements(category, difficulty) {
    const achievements = {
      web_security: ['Web Warrior', 'SQL Slayer', 'XSS Expert'],
      network_penetration: ['Network Ninja', 'Pivot Master', 'Infrastructure Infiltrator'],
      social_engineering: ['Human Hacker', 'Phishing Pro', 'Social Sleuth'],
      malware_analysis: ['Malware Hunter', 'Reverse Engineer', 'Code Analyst'],
      forensics: ['Digital Detective', 'Evidence Expert', 'Timeline Master']
    }
    
    const categoryAchievements = achievements[category] || achievements.web_security
    return difficulty >= 8 ? [categoryAchievements[0]] : []
  }

  static generateBriefing(category, difficulty, objectives) {
    return `Mission Parameters:
- Difficulty: ${difficulty}/10
- Category: ${category.replace('_', ' ').toUpperCase()}
- Primary Objective: ${objectives.primary}
- Rules of Engagement: Minimize collateral damage and maintain operational security
- Success Criteria: Complete all mission steps within the allocated timeframe

Intelligence suggests moderate to high security measures are in place. Exercise caution and apply appropriate stealth techniques. Good luck, operative.`
  }

  // Validate solution for a step
  static validateSolution(step, submittedSolution) {
    // Simplified validation - in a real implementation, this would be more sophisticated
    const solution = step.solution
    
    if (!solution || !submittedSolution) return false
    
    // Check if submitted solution matches expected patterns
    if (solution.expectedOutput && typeof submittedSolution === 'string') {
      return submittedSolution.toLowerCase().includes(solution.expectedOutput.toLowerCase())
    }
    
    // Check commands
    if (solution.commands && Array.isArray(submittedSolution)) {
      return solution.commands.some(cmd => 
        submittedSolution.some(submitted => 
          submitted.toLowerCase().includes(cmd.toLowerCase())
        )
      )
    }
    
    // Default validation
    return Math.random() > 0.3 // 70% success rate for demo purposes
  }
}

module.exports = MissionGenerator