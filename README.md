# Roothaktivity: Mobile Ops

## Overview
Roothaktivity: Mobile Ops is a mobile adaptation of the popular cyber warfare game NiteTeam4. It immerses players in a world of hacking, espionage, and cyber missions, blending entertainment with educational elements.

## Features
- **Realistic Hacking Missions**: Simulated hacking tools including port scanning, brute force attacks, and social engineering
- **Dynamic Mission Generator**: Procedurally generated missions based on player skill levels
- **Augmented Reality (AR) Puzzles**: AR integration for real-world environment interaction
- **Multiplayer Mode**: Collaborative missions and competitive hacking challenges
- **Skill Tree System**: Detailed progression system for hacking abilities

## Project Structure
```
roothaktivity-mobile-ops/
├── backend/                 # Node.js API server
│   ├── src/                # Source code
│   ├── tests/              # Test files
│   └── config/             # Configuration files
├── android-app/            # Android native application
│   └── app/                # Main Android app
├── game-prototypes/        # Game logic prototypes
│   ├── hacking-tools/      # Hacking simulation tools
│   ├── puzzles/            # Puzzle mechanics
│   └── ar-features/        # AR integration prototypes
├── docs/                   # Documentation
└── assets/                 # Game assets and resources
```

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB for player data and mission storage
- **Android**: Kotlin/Java for native development
- **Game Logic**: JavaScript/Python prototypes
- **AR**: ARCore for Android
- **Deployment**: AWS/Firebase

## Getting Started

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the server: `npm start`

### Android App Setup
1. Open Android Studio
2. Import the `android-app` project
3. Sync gradle dependencies
4. Build and run on device/emulator

## Development Roadmap
- [x] Project structure setup
- [ ] Backend API development
- [ ] Android app foundation
- [ ] Game logic implementation
- [ ] AR features integration
- [ ] Multiplayer system
- [ ] UI/UX design
- [ ] Testing and deployment

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
See LICENSE file for details.