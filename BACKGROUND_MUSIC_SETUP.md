# Background Music Setup

## Manual Step Required

Due to the binary nature of the MP3 file, you need to manually copy the theme song:

### Copy the file:
```bash
# From the project root directory
copy sounds\raone.mp3 frontend\public\sounds\raone.mp3
```

Or manually:
1. Navigate to `sounds/raone.mp3`
2. Copy the file
3. Paste it into `frontend/public/sounds/raone.mp3`

## What Was Implemented

The background music system has been integrated with the following changes:

### 1. Audio Configuration (`frontend/src/hooks/useScaryAudio.ts`)
- Updated the ambient audio path to use `/sounds/raone.mp3`
- Set volume to 0.2 (20%) for subtle background presence
- Configured to loop continuously

### 2. Main Page (`frontend/src/app/page.tsx`)
- Added `useScaryAudio` hook import
- Implemented auto-play functionality on page load
- Added cleanup to stop music when leaving the page
- Small 500ms delay to ensure browser compatibility

## Features

✅ **Continuous Loop**: The theme song plays continuously in the background
✅ **Auto-play**: Starts automatically when the page loads
✅ **Volume Control**: Set to 20% volume for atmospheric effect
✅ **Cleanup**: Properly stops when navigating away
✅ **Browser Compatible**: Includes delay for browsers requiring user interaction

## Testing

After copying the file, test by:
1. Starting the development server: `npm run dev`
2. Opening the homepage
3. The theme song should start playing automatically after ~500ms
4. It should loop continuously

## Volume Adjustment

To adjust the volume, edit `frontend/src/hooks/useScaryAudio.ts`:

```typescript
ambient: {
  path: '/sounds/raone.mp3',
  volume: 0.2, // Change this value (0.0 to 1.0)
  loop: true,
},
```

## Troubleshooting

If the music doesn't play:
1. Check browser console for errors
2. Ensure the file is in `frontend/public/sounds/raone.mp3`
3. Some browsers block auto-play - click anywhere on the page to trigger playback
4. Check browser audio settings and ensure the site isn't muted
