# Three.js Crossy Road Game 🎮

A fun Crossy Road-style game built with Three.js! Navigate your character across roads while avoiding cars.

## Features

- 🎨 Colorful 3D graphics powered by Three.js
- 🚗 Dynamic car spawning with varying speeds
- 🎯 Score tracking based on distance traveled
- 📱 Mobile-friendly touch controls
- ⌨️ Keyboard controls (Arrow keys or WASD)
- 🔄 Smooth animations and camera following
- 💥 Collision detection
- 🎮 Restart functionality

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## How to Play

- **Move Forward**: ↑ or W
- **Move Backward**: ↓ or S
- **Move Left**: ← or A
- **Move Right**: → or D

**On Mobile**: Swipe in the direction you want to move

**Objective**: Cross as many roads as possible without getting hit by cars!

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- Three.js - 3D graphics library
- Vite - Build tool and dev server
- JavaScript ES6+ - Game logic

## Game Structure

```
src/
├── index.js           # Entry point
├── game.js            # Main game logic
├── models/
│   ├── player.js      # Player character
│   ├── road.js        # Road/grass lanes
│   └── car.js         # Moving obstacles
├── controls/
│   └── input.js       # Keyboard & touch controls
└── utils/
    └── collision.js   # Collision detection
```

## License

MIT