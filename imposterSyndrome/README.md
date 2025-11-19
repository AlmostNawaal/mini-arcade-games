# Imposter Syndrome - A Reverse Turing Test Game

**Genre:** Stealth / Survival  
**Tech:** Pure JavaScript with HTML5 Canvas

## The Concept

You are one of 50 identical circles on screen. 49 are AI bots moving randomly. **You are the imposter.**

A giant **Eye** watches from above. If you move like a human (in straight lines), it will detect and zap you.

Your mission: **Reach the Green Zone** before time runs out, while mimicking the erratic, jittery movement of the AI bots.

## Gameplay Mechanics

- **Movement:** Use `WASD` or `Arrow Keys` to move
- **Stealth:** Move in erratic, jittery patterns like the bots
- **Blending:** Stop moving completely to blend in (but time is limited!)
- **Detection:** Straight-line movement increases the Eye's suspicion meter
- **Objective:** Reach the green exit zone in bottom-right corner within 60 seconds

## The Psychology

This game creates **paranoia** through:
- You're hiding in plain sight among 49 identical entities
- The Eye constantly tracks you with subtle visual feedback
- Every smooth movement risks detection
- You must **think like a bot** to survive

## How to Play

1. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. Read the instructions on the start screen
3. Click **START GAME**
4. Move erratically toward the green zone
5. Avoid straight lines at all costs!

## Technical Features

- **50 entities** with independent AI movement
- **Real-time movement analysis** using angle variance detection
- **Procedural Eye behavior** that tracks player subtly
- **Dynamic difficulty** through detection threshold tuning
- **Pure vanilla JavaScript** - no frameworks needed

## Files

- `index.html` - Game structure and UI overlays
- `style.css` - Cyberpunk-inspired styling
- `script.js` - Game logic, AI bots, detection algorithm
- `README.md` - This file

## Development

The game uses:
- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS3 for UI and overlays
- Math-based movement detection (angle variance algorithm)

No build process or dependencies required!

## Tips for Winning

1. **Zigzag** constantly - never move in one direction for long
2. **Vary your speed** - alternate between moving and pausing
3. **Watch the Eye** - if it glows red, you're being suspicious
4. **Don't panic** - smooth, erratic movement is key
5. **Time management** - stopping blends you in, but costs precious seconds

## Demo

![alt text](<Recording 2025-11-19 172338.gif>)
---
## Credits

Created for OSWeek-IEEECS  
A minimalist psychological stealth game about mimicking AI behavior

---

**Remember:** In this world, moving like a human is the most dangerous thing you can do.