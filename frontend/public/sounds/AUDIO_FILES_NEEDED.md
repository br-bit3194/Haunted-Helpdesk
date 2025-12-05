# Audio Files Needed

The application is looking for these audio files in `frontend/public/sounds/`:

## Required Files:

1. **raone.mp3** - Background ambient music
   - Should be a looping background track
   - Recommended: Dark, atmospheric music
   - Source: Copy from `sounds/raone.mp3` in project root

2. **ambient_hover.mp3** - Hover sound effect
   - Plays when hovering over interactive elements
   - Recommended: Subtle whoosh or eerie sound
   - Duration: 0.5-1 second

3. **scream_click.mp3** - Click sound effect
   - Plays when clicking buttons
   - Recommended: Short scream or dramatic sound
   - Duration: 0.5-1 second

## How to Add Files:

### Option 1: Copy raone.mp3
```bash
# From project root
copy sounds\raone.mp3 frontend\public\sounds\raone.mp3
```

### Option 2: Use Free Sound Effects
You can download free sound effects from:
- https://freesound.org/
- https://www.zapsplat.com/
- https://mixkit.co/free-sound-effects/

### Option 3: Disable Audio Temporarily
Edit `frontend/src/hooks/useScaryAudio.ts` and set `enabled: false` in the hook call.

## Current Status:
- ❌ raone.mp3 - Missing (404)
- ❌ ambient_hover.mp3 - Missing (404)
- ❌ scream_click.mp3 - Missing (404)

The app will work without these files, but you'll see 404 errors in the console.
