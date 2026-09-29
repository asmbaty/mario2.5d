# Super Mario Bros. 2.5D

A 2.5D Mario platformer that runs in the browser. It has 3D worlds built with [three.js](https://threejs.org/), classic side-scrolling gameplay, and 15 levels across 5 worlds, ending with a showdown against Bowser.

## Gameplay Trailer

[![Super Mario Bros. 2.5D gameplay trailer](https://img.youtube.com/vi/saO6aMpQ4XU/maxresdefault.jpg)](https://youtu.be/saO6aMpQ4XU)

▶ **[Watch on YouTube](https://youtu.be/saO6aMpQ4XU)**

## Play

No build step or dependencies are needed. Serve the folder and open it in a browser:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also open `index.html` directly. three.js and the font load from a CDN, so you need an internet connection.

## Controls

| Action              | Keys                      |
| ------------------- | ------------------------- |
| Move                | ← → / A D                 |
| Jump (hold = higher) | Space / Z / ↑ / W        |
| Run · Fireball      | Shift / X                 |
| Duck / Slide        | ↓ / S                     |
| Start               | Enter                     |
| Level select        | L                         |
| Pause               | P / Esc                   |
| Mute                | M                         |

On phones and tablets, on-screen touch buttons appear automatically.

## Worlds

| World | Level 1 | Level 2 | Level 3 |
| ----- | ------- | ------- | ------- |
| 1 | Grassland | Underground | Sunset Treetops |
| 2 | Frozen Peaks: icy ground | Desert Dunes: Bullet Bills and Spinies | Coral Reef: swimming |
| 3 | Haunted Woods: Boos | Moon Base: low gravity | Turbo Speedway: dash panels and slides |
| 4 | Candy Kingdom: jelly bounce blocks | Crystal Caverns: darkness | Sky Airship Armada: wind gusts |
| 5 | Jungle Ruins: crumbling stones | Mount Inferno: meteors | Bowser's Dark Fortress: the final battle |

## Features

- Real-time 3D rendering with procedurally generated models and textures. The game ships no image or model files.
- Chiptune music and sound effects synthesized live with the Web Audio API.
- Power-ups: Super Mushroom, Fire Flower, Starman and 1-Ups.
- Physics that change from world to world: ice, water, low gravity, wind and bouncy jelly.
- A level-select menu, a saved top score, and touch controls.

## Project Structure

```
index.html      – page layout, HUD and menus
style.css       – UI styling
js/audio.js     – synthesized music & sound effects
js/textures.js  – procedural textures
js/models*.js   – 3D models for characters, enemies and blocks
js/decor.js     – scenery and background decoration
js/details.js   – per-world visual details
js/worlds45.js  – worlds 4 and 5 content
js/levels.js    – level layouts and settings
js/game.js      – game loop, physics, input and camera
```
