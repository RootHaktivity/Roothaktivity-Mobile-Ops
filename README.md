# Roothaktivity: Mobile Ops

**A Mobile Cyber Warfare Game Inspired by NiteTeam4**

## 🎮 Overview

Roothaktivity: Mobile Ops is an immersive mobile adaptation of the popular cyber warfare game NiteTeam4. It combines realistic hacking simulations with educational elements, featuring story-driven missions, AR puzzles, and multiplayer capabilities.

## ✨ Key Features

- **🔓 Realistic Hacking Missions**: Port scanning, brute force attacks, social engineering
- **🎯 Dynamic Mission Generator**: Procedurally generated missions based on skill level
- **📱 Augmented Reality Puzzles**: QR codes and virtual object interactions
- **👥 Multiplayer Mode**: Collaborative missions and competitive challenges
- **🌳 Skill Tree System**: Progressive hacking ability upgrades

## 🏗️ Project Structure

```
roothaktivity-mobile-ops/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & validation
│   │   ├── utils/          # Helper functions
│   │   └── socket/         # Real-time features
│   ├── package.json
│   └── Dockerfile
├── android-app/            # Kotlin/Java Android application
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/       # Kotlin source code
│   │   │   ├── res/        # Resources & layouts
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── game-prototypes/        # Python/JS game logic prototypes
│   ├── hacking-tools/      # Port scanners, exploits
│   └── puzzles/            # Cryptography challenges
├── docs/                   # Documentation
├── assets/                 # Game assets & media
├── aws/                    # AWS deployment configs
├── firebase/               # Firebase configs
└── docker-compose.yml
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for multiplayer
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi schema validation
- **Security**: Helmet, rate limiting, bcrypt

### Android App
- **Language**: Kotlin with Java interop
- **UI Framework**: Jetpack Compose with Material 3
- **Architecture**: MVVM with Android Architecture Components
- **Networking**: Retrofit with OkHttp
- **DI**: Hilt (Dagger-based)
- **Database**: Room with SQLite
- **AR Features**: ARCore with Sceneform

### Game Logic Prototypes
- **Language**: Python 3.9+ and JavaScript
- **Libraries**: Custom simulation engines

### Deployment
- **Containerization**: Docker with multi-stage builds
- **Cloud Platform**: AWS (ECS Fargate, DocumentDB, ElastiCache)
- **Alternative**: Firebase (Hosting, Functions, Firestore)
- **Infrastructure**: Terraform for AWS resources

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Android Studio Arctic Fox+
- Docker & Docker Compose
- Python 3.9+ (for game prototypes)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd roothaktivity-mobile-ops
```

2. **Start backend services with Docker**
```bash
docker-compose up -d
```

3. **Setup backend environment**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Open Android app in Android Studio**
```bash
cd android-app
# Open in Android Studio and sync project
```

5. **Test game prototypes**
```bash
cd game-prototypes
python3 -m pip install -r requirements.txt
python3 hacking-tools/port_scanner.py
```

### API Endpoints

The backend API will be available at `http://localhost:3000`:

- `POST /api/auth/register` - Player registration
- `POST /api/auth/login` - Player authentication
- `GET /api/missions` - Available missions
- `GET /api/missions/generate` - Generate new mission
- `POST /api/missions/:id/start` - Start mission
- `GET /api/players/profile` - Player profile
- `GET /api/game/leaderboard` - Top players

## 📱 Android App Features

### Core Components
- **MainActivity**: Entry point with splash screen
- **AuthActivity**: Login/registration flows
- **MissionActivity**: Mission briefing and execution
- **ARActivity**: Augmented reality puzzles
- **MultiplayerActivity**: Team collaboration interface

### Key Libraries
- Jetpack Compose for modern UI
- CameraX for camera features
- ARCore for augmented reality
- Retrofit for API communication
- Room for local data storage

## 🎮 Game Mechanics

### Mission Types
- **Reconnaissance**: Network scanning and enumeration
- **Exploitation**: Vulnerability assessment and exploitation
- **Post-Exploitation**: Privilege escalation and persistence
- **Social Engineering**: Human factor attacks
- **Cryptography**: Cipher breaking and analysis

### Skill Categories
- **Network Security**: Port scanning, network analysis
- **Web Application**: SQL injection, XSS exploitation
- **Cryptography**: Cipher analysis, hash cracking
- **Social Engineering**: Phishing, pretexting
- **Malware Development**: Payload creation, evasion
- **Digital Forensics**: Evidence analysis, timeline reconstruction

## 🔧 Development Roadmap

- [x] Project structure and documentation
- [x] Backend API development
- [x] Android app foundation
- [x] Game logic prototypes
- [x] Deployment configurations
- [ ] UI/UX implementation
- [ ] AR integration
- [ ] Multiplayer features
- [ ] Comprehensive testing
- [ ] Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [NiteTeam4](https://niteteam4.org/) - Original inspiration
- [Metasploit](https://github.com/rapid7/metasploit-framework) - Penetration testing framework
- [OWASP WebGoat](https://github.com/WebGoat/WebGoat) - Security learning platform

## 📞 Support

For questions, bug reports, or feature requests, please open an issue in the GitHub repository.

---

**Built with ❤️ for the cybersecurity community**