# Spiderman Utility App — Tactical Suit OS (MJ Edition)

> A full-featured Spider-Man tactical app built with React Native + Expo.  
> Inspired by Tony Stark’s suit interfaces, Marvel’s Spider-Man games, and cyberpunk aesthetics.

## Features

- **Custom glassmorphism bottom tab bar** with neon active indicator, spring animation, and haptic feedback
- Insane visual effects (all native-driven):
  - Rotating tech rings + crosshairs
  - Sweeping radar/sonar with pulse waves
  - Digital rain data streams on both sides
  - Glitch effect on header text
  - Live biometric mock data (BPM, distance, battery)
  - Scrolling terminal log
  - Dynamic color transitions between modes
- Six main sections (ready for future implementation):
  - Web Fluid Calibration
  - Crime Heatmap
  - MJ Safe (Tactical HUD) ❤️
  - Suit Manager
  - Mission Log
  - Fitness & Training


## Quick Start

```bash
git clone https://github.com/your-username/spiderman-utility-app.git
cd spiderman-utility-app
npm install    # or yarn / pnpm
npx expo start
```

Works on **iOS**, **Android**, and **Web**.

## Tech Stack

| Technology                     | Version    | Purpose                              |
|--------------------------------|------------|--------------------------------------|
| Expo SDK                       | ~54.0.0    | Project bootstrap & easiness         |
| React Native                   | 0.81.5     | Core framework                       |
| React Navigation v6            | ^6.x       | Navigation + custom tab bar          |
| Reanimated 4                   | ~4.1.1     | All fluid 60 fps animations          |
| Gesture Handler                | ~2.28.0    | Smooth touches                       |
| expo-linear-gradient, expo-blur| latest    | Glassmorphism effects                |
| lucide-react-native            | ^0.554.0   | Icons (future-proof)                 |

## Project Structure

```
src/
 └── screens/
      ├── CalibrationScreen.js
      ├── CrimeMapScreen.js
      ├── MJSafeScreen.js      
      ├── SuitManagerScreen.js
      ├── MissionLogScreen.js
      └── FitnessScreen.js
assets/
 └── mj.png, web_bg.png, etc.
App.js                        
```


## Roadmap / Future Ideas

- [ ] Voice assistant (Expo Speech + Speech-to-Text)
- [ ] Real NYC crime heatmap via public API
- [ ] Suit upgrade tree & stats
- [ ] AR mode with Expo AR
- [ ] Home-screen widgets (iOS/Android)
- [ ] Additional themes: Iron Spider, Symbiote, Miles Morales, 2099

## Credits

Built with love for Spider-Man, Mary Jane Watson, and late-night coding sessions.  
**@dyliga** – 2025

> *“With great power comes great user interfaces.”*

---

**Enjoyed the vibe?**  
Give this repo a star. It means the world!  
Want to contribute? Fork → add your own suit → send a PR. The Spider-Verse is open source!