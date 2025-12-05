# 3D Model Integration - Testing Checklist

## Cross-Browser Testing

### Desktop Browsers

- [ ] **Chrome (Latest)**
  - [ ] 3D model loads and renders correctly
  - [ ] Mouse drag rotation works
  - [ ] Zoom controls function properly
  - [ ] Auto-rotation is smooth
  - [ ] No console errors

- [ ] **Firefox (Latest)**
  - [ ] 3D model loads and renders correctly
  - [ ] Mouse drag rotation works
  - [ ] Zoom controls function properly
  - [ ] Auto-rotation is smooth
  - [ ] No console errors

- [ ] **Safari (Latest)**
  - [ ] 3D model loads and renders correctly
  - [ ] Mouse drag rotation works
  - [ ] Zoom controls function properly
  - [ ] Auto-rotation is smooth
  - [ ] WebGL compatibility verified
  - [ ] No console errors

- [ ] **Edge (Latest)**
  - [ ] 3D model loads and renders correctly
  - [ ] Mouse drag rotation works
  - [ ] Zoom controls function properly
  - [ ] Auto-rotation is smooth
  - [ ] No console errors

### Mobile Browsers

- [ ] **iOS Safari**
  - [ ] 3D model loads on iPhone
  - [ ] Touch gestures work (rotate)
  - [ ] Performance is acceptable (30+ FPS)
  - [ ] No memory issues
  - [ ] Shaded model used by default
  - [ ] Page remains responsive

- [ ] **Android Chrome**
  - [ ] 3D model loads on Android device
  - [ ] Touch gestures work (rotate)
  - [ ] Performance is acceptable (30+ FPS)
  - [ ] No memory issues
  - [ ] Shaded model used by default
  - [ ] Page remains responsive

## Device Testing

### Desktop Resolutions
- [ ] 1920x1080 (Full HD)
- [ ] 2560x1440 (2K)
- [ ] 3840x2160 (4K)
- [ ] 1366x768 (Common laptop)

### Tablet Resolutions
- [ ] 768x1024 (iPad Portrait)
- [ ] 1024x768 (iPad Landscape)
- [ ] 800x1280 (Android Tablet)

### Mobile Resolutions
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 12/13)
- [ ] 360x640 (Android Small)
- [ ] 414x896 (iPhone 11 Pro Max)

## Performance Testing

### Low-End Devices
- [ ] Test on device with integrated graphics
- [ ] Verify frame rate stays above 30 FPS
- [ ] Check for thermal throttling
- [ ] Monitor memory usage
- [ ] Verify fallback to shaded model on mobile

### High-End Devices
- [ ] Test PBR model performance
- [ ] Verify smooth 60 FPS rendering
- [ ] Check for any stuttering
- [ ] Monitor GPU usage

## WebGL Support

- [ ] **WebGL Detection**
  - [ ] Verify WebGL is detected on supported browsers
  - [ ] Test fallback UI on browsers without WebGL
  - [ ] Check error messages are user-friendly

- [ ] **WebGL Contexts**
  - [ ] Test WebGL 1.0 compatibility
  - [ ] Test WebGL 2.0 compatibility
  - [ ] Verify context loss handling

## Accessibility Testing

- [ ] **Screen Readers**
  - [ ] NVDA (Windows)
  - [ ] JAWS (Windows)
  - [ ] VoiceOver (macOS/iOS)
  - [ ] TalkBack (Android)

- [ ] **Keyboard Navigation**
  - [ ] Tab through page without getting trapped
  - [ ] Skip link works correctly
  - [ ] All interactive elements accessible

- [ ] **ARIA Attributes**
  - [ ] aria-hidden="true" on 3D viewer
  - [ ] All existing ARIA labels preserved
  - [ ] No duplicate IDs

## Visual Testing

- [ ] 3D model doesn't obscure hero title
- [ ] 3D model doesn't obscure CTA buttons
- [ ] Opacity (30%) provides good background effect
- [ ] Halloween lighting colors visible
- [ ] Model scales appropriately on all screens
- [ ] No z-index conflicts with other elements

## Error Handling

- [ ] **Invalid Model Path**
  - [ ] Fallback UI displays
  - [ ] No page crash
  - [ ] Error logged to console

- [ ] **Network Errors**
  - [ ] Graceful degradation
  - [ ] Retry mechanism (if implemented)
  - [ ] User-friendly error message

- [ ] **WebGL Errors**
  - [ ] Context loss handled
  - [ ] Fallback UI displays
  - [ ] Page remains functional

## Loading States

- [ ] Loading indicator displays while model loads
- [ ] Suspense boundary works correctly
- [ ] Page content loads independently of 3D model
- [ ] No layout shift when model loads

## Memory Leaks

- [ ] Navigate away and back multiple times
- [ ] Monitor memory usage in DevTools
- [ ] Verify cleanup functions execute
- [ ] Check for retained detached DOM nodes
- [ ] Verify Three.js resources are disposed

## Integration Testing

- [ ] 3D model doesn't break existing animations
- [ ] Framer Motion animations work alongside 3D
- [ ] Atmospheric effects (ghosts, bats) still visible
- [ ] All feature cards render correctly
- [ ] All agent cards render correctly
- [ ] Navigation buttons work
- [ ] External links open correctly

## Notes

- **Recommended Model**: Use `base_basic_shaded.glb` for production
- **Mobile Default**: Shaded model automatically used on mobile
- **Performance Target**: Maintain 30+ FPS on mobile, 60 FPS on desktop
- **Browser Support**: Modern browsers with WebGL support

## Test Results

| Browser/Device | Status | Notes | Date |
|----------------|--------|-------|------|
| Chrome Desktop | ⏳ Pending | | |
| Firefox Desktop | ⏳ Pending | | |
| Safari Desktop | ⏳ Pending | | |
| Edge Desktop | ⏳ Pending | | |
| iOS Safari | ⏳ Pending | | |
| Android Chrome | ⏳ Pending | | |

## Known Issues

_Document any issues discovered during testing here_

## Manual Testing Instructions

1. **Copy GLB Files**: Ensure GLB files are copied to `frontend/public/models/`
2. **Start Dev Server**: Run `npm run dev` in frontend directory
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Verify 3D Model**: Check that 3D model appears in background
5. **Test Interactions**: Try rotating model with mouse/touch
6. **Check Console**: Verify no errors in browser console
7. **Test Accessibility**: Use keyboard navigation and screen reader
8. **Test Performance**: Monitor FPS in browser DevTools
