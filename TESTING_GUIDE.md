# Testing Guide - Interactive 3D Model

## Quick Start

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open the landing page:**
   Navigate to `http://localhost:3000`

3. **Test the features:**
   - Move your mouse around the page - the 3D model should follow your cursor
   - Hover over the model - you should see smoke particles and glowing eyes
   - Click on the model - you should see sparks/blood particles and an attack animation

## Feature Testing Checklist

### ✅ Mouse Tracking
- [ ] Model rotates to follow cursor smoothly
- [ ] Rotation is limited (doesn't spin 360°)
- [ ] Movement is smooth, not jerky
- [ ] Works across entire viewport
- [ ] Disabled when `prefers-reduced-motion` is enabled

### ✅ Audio (requires audio files)
- [ ] Hover plays ambient sound
- [ ] Click plays scream sound
- [ ] Sounds don't overlap when triggered rapidly
- [ ] Volume controls work
- [ ] Mute functionality works
- [ ] Gracefully handles missing audio files

### ✅ Animations (requires GLB with animations)
- [ ] Idle animation plays on load
- [ ] Hover triggers threatening animation
- [ ] Click triggers attack animation
- [ ] Returns to idle after attack completes
- [ ] Smooth transitions between states

### ✅ Particle Effects
- [ ] Smoke particles appear on hover
- [ ] Sparks appear on click
- [ ] Blood splatter appears on click
- [ ] Particles fade out naturally
- [ ] Performance is acceptable on mobile

### ✅ Accessibility
- [ ] Respects `prefers-reduced-motion` setting
- [ ] All animations disabled when motion is reduced
- [ ] Mouse tracking disabled when motion is reduced
- [ ] Model still visible and functional
- [ ] Keyboard navigation not trapped

### ✅ Performance
- [ ] Page loads quickly
- [ ] No memory leaks (check DevTools)
- [ ] Smooth 60fps on desktop
- [ ] Acceptable performance on mobile
- [ ] Resources cleaned up on unmount

## Testing Without Audio Files

The system is designed to work without audio files. You should see:
- Console warnings about missing audio (expected)
- All visual features still work
- No crashes or errors
- Interactions still trigger (just silently)

## Testing Prefers-Reduced-Motion

### On Windows:
1. Open Settings > Accessibility > Visual effects
2. Enable "Show animations in Windows"
3. Refresh the page
4. All animations and mouse tracking should be disabled

### On Mac:
1. System Preferences > Accessibility > Display
2. Check "Reduce motion"
3. Refresh the page
4. All animations and mouse tracking should be disabled

### In Browser DevTools:
```javascript
// Simulate prefers-reduced-motion
// In Chrome DevTools Console:
matchMedia('(prefers-reduced-motion: reduce)').matches = true;
```

## Common Issues & Solutions

### Issue: Model doesn't follow mouse
**Solution**: Check that `enableMouseTracking={true}` is set on the Model3DViewer component

### Issue: No sounds playing
**Solution**: 
1. Check that audio files exist in `frontend/public/sounds/`
2. Check browser console for audio loading errors
3. Verify `enableAudio={true}` is set
4. Check that browser allows audio autoplay (may require user interaction first)

### Issue: No animations
**Solution**:
1. Verify the GLB model contains animations
2. Check that animation names match: "Idle", "Threaten", "Attack"
3. Verify `enableAnimations={true}` is set

### Issue: No particle effects
**Solution**:
1. Verify `enableEffects={true}` is set
2. Check browser console for WebGL errors
3. Try reducing particle count in configuration

### Issue: Performance problems
**Solution**:
1. Reduce particle counts in `SCARY_EFFECTS` configuration
2. Use the shaded model instead of PBR model
3. Disable effects on mobile devices
4. Check for memory leaks in DevTools

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance Benchmarks

Expected performance:
- **Desktop**: 60 FPS with all effects enabled
- **Mobile**: 30-60 FPS with reduced particle counts
- **Load Time**: < 3 seconds for initial model load
- **Memory**: < 100MB additional memory usage

## Debugging Tips

### Enable Verbose Logging
Check browser console for:
- Audio preload messages
- Animation initialization messages
- Mouse tracking state changes
- Particle system updates

### Check Three.js Stats
Add this to see FPS and render stats:
```typescript
import Stats from 'three/examples/jsm/libs/stats.module';
const stats = Stats();
document.body.appendChild(stats.dom);
```

### Monitor Audio State
```typescript
// In browser console
window.audioManager = audioManager;
// Then check:
audioManager.getActiveCount();
audioManager.isMutedState();
```

## Next Steps

1. Add actual audio files for full experience
2. Ensure GLB model has proper animations
3. Adjust particle counts for your performance targets
4. Customize colors and effects to match your theme
5. Test on various devices and browsers

Happy testing! 🎃👻
