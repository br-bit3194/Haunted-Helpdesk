# Implementation Plan

- [x] 1. Install dependencies and setup project structure
  - Install @react-three/fiber, @react-three/drei, @react-three/postprocessing, and three packages
  - Install howler for audio management (optional)
  - Create frontend/public/models directory
  - Create frontend/public/sounds directory for audio assets
  - Copy GLB files from 3d_model to frontend/public/models
  - Add placeholder audio files (ambient_hover.mp3, scream_click.mp3, growl.mp3, whisper.mp3)
  - Verify Next.js configuration handles static assets correctly
  - _Requirements: 2.1, 2.2, 5.2, 10.1_



- [ ] 2. Create Model3DViewer component with basic 3D rendering
  - Create frontend/src/components/Model3DViewer.tsx with "use client" directive
  - Implement extended props interface (modelPath, className, autoRotate, enableZoom, position, scale, enableAudio, enableAnimations, enableEffects, respectMotionPreference)
  - Set up Canvas component from @react-three/fiber
  - Implement basic Scene3D internal component
  - Add Suspense boundary for loading states
  - Add state management for interaction states (idle, hover, attack)
  - _Requirements: 2.3, 2.4, 1.1_



- [ ] 2.1 Write property test for model rendering
  - **Property 1: Model rendering on page load**
  - **Validates: Requirements 1.1**

- [ ] 3. Implement GLB model loading and display
  - Use useGLTF hook from @react-three/drei to load GLB files


  - Create model configuration constants for PBR and shaded models
  - Implement model positioning and scaling logic


  - Add primitive mesh to render loaded model


  - Handle model disposal in cleanup function
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 3.1 Write property test for model selection
  - **Property 8: Model selection by configuration**
  - **Validates: Requirements 5.1, 5.2**



- [x] 3.2 Write property test for model switching


  - **Property 10: Model switching via props**
  - **Validates: Requirements 5.5**

- [ ] 4. Configure lighting setup with Halloween theme
  - Create HALLOWEEN_LIGHTING configuration constant
  - Add ambientLight with pumpkin orange color (#ff7518, intensity 0.4)
  - Add directionalLight with phantom purple color (#9d4edd, intensity 0.8)


  - Position directional light at [5, 5, 5]


  - Test lighting appearance with both model types
  - _Requirements: 1.2, 3.2_

- [ ] 4.1 Write property test for lighting configuration
  - **Property 2: Lighting configuration applied**
  - **Validates: Requirements 1.2, 3.2**



- [x] 5. Add interactive controls for user interaction


  - Import OrbitControls from @react-three/drei
  - Configure OrbitControls with enableZoom, enablePan, and autoRotate props
  - Set up touch gesture support for mobile devices
  - Configure rotation damping for smooth interaction
  - Test mouse drag and touch interactions
  - _Requirements: 1.3, 1.4_



- [x] 5.1 Write property test for interactive rotation
  - **Property 3: Interactive rotation enabled**
  - **Validates: Requirements 1.3**

- [ ] 6. Implement loading states and error handling
  - Create LoadingFallback component with spinner or skeleton
  - Implement Model3DErrorBoundary class component
  - Create FallbackUI component for error states


  - Add error handling for file not found, invalid GLB, and network errors
  - Test error scenarios with invalid model paths


  - _Requirements: 1.5, 5.3_



- [ ] 6.1 Write property test for error handling
  - **Property 9: Error handling for invalid paths**
  - **Validates: Requirements 5.3**

- [x] 7. Implement responsive behavior and mobile optimization


  - Configure Canvas to be responsive with percentage-based sizing
  - Add viewport size detection for mobile vs desktop
  - Set default model to shaded version on mobile devices
  - Implement canvas resize handling
  - Test on various viewport sizes (320px to 3840px width)
  - _Requirements: 1.4, 3.4_



- [ ] 7.1 Write property test for responsive sizing
  - **Property 4: Responsive canvas sizing**
  - **Validates: Requirements 3.4**

- [ ] 8. Add accessibility features
  - Add aria-hidden="true" to Model3DViewer container (decorative element)


  - Ensure component doesn't trap keyboard focus
  - Add aria-label to Canvas if semantically meaningful
  - Test keyboard navigation through landing page
  - Verify screen reader compatibility
  - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [ ] 8.1 Write property test for accessibility attributes
  - **Property 5: Accessibility attributes present**
  - **Validates: Requirements 4.1**

- [ ] 8.2 Write property test for focus trap prevention
  - **Property 6: Focus trap prevention**
  - **Validates: Requirements 4.3**

- [ ] 9. Integrate Model3DViewer into landing page
  - Import Model3DViewer component in frontend/src/app/page.tsx
  - Position 3D viewer in hero section (behind or beside title)
  - Configure z-index to ensure proper layering with existing effects
  - Set appropriate dimensions and positioning (absolute or relative)
  - Choose initial model (recommend shaded for performance)
  - _Requirements: 3.1, 3.3_

- [ ] 10. Add entrance animations and visual polish
  - Wrap Model3DViewer with Framer Motion for fade-in animation
  - Coordinate animation timing with existing hero section animations
  - Configure autoRotate for subtle continuous rotation
  - Adjust camera position and field of view for optimal viewing
  - Fine-tune lighting intensity and colors to match theme
  - _Requirements: 3.2, 3.5_

- [ ] 10.1 Write property test for existing accessibility preservation
  - **Property 7: Existing accessibility preserved**
  - **Validates: Requirements 4.5**

- [ ] 10.2 Write unit tests for landing page integration
  - Test that 3D viewer doesn't break existing layout
  - Verify z-index layering is correct
  - Test that skip-to-main link still works
  - Verify all existing ARIA labels remain present
  - _Requirements: 4.5_

- [ ] 11. Performance optimization and resource cleanup
  - Implement useEffect cleanup to dispose Three.js resources
  - Add lazy loading to defer 3D model load until viewport visible
  - Optimize GLB files using glTF-Transform (if needed)
  - Add FPS monitoring for performance degradation detection
  - Test memory usage and check for leaks
  - _Requirements: 2.5_

- [ ] 12. Cross-browser and device testing
  - Test on Chrome, Firefox, Safari, and Edge
  - Test on iOS Safari (WebGL compatibility)
  - Test on Android Chrome
  - Verify WebGL support detection and fallback
  - Test on low-end mobile devices for performance
  - _Requirements: 1.4_

- [ ] 13. Create audio management system
- [ ] 13.1 Implement audioManager utility
  - Create frontend/src/lib/audioManager.ts
  - Implement AudioManager class with audio pooling
  - Add preload method for loading audio files
  - Add play method with overlap prevention
  - Implement error handling for failed audio loads
  - Add volume control and mute functionality
  - _Requirements: 10.2, 10.3, 10.4_

- [ ] 13.2 Write property test for audio overlap prevention
  - **Property 15: Audio overlap prevention**
  - **Validates: Requirements 6.5**

- [ ] 13.3 Implement useScaryAudio hook
  - Create frontend/src/hooks/useScaryAudio.ts
  - Use AudioManager for audio playback
  - Implement playHoverSound and playClickSound functions
  - Add volume and mute state management
  - Preload audio files on hook initialization
  - Handle audio errors gracefully
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 13.4 Write property tests for audio hooks
  - **Property 11: Hover triggers audio**
  - **Property 12: Click triggers audio**
  - **Property 13: Volume controls affect audio**
  - **Property 14: Audio preloading**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 13.5 Write property test for audio error handling
  - **Property 26: Audio error handling**
  - **Validates: Requirements 10.3**

- [ ] 14. Implement animation system
- [ ] 14.1 Create useModelAnimations hook
  - Create frontend/src/hooks/useModelAnimations.ts
  - Initialize AnimationMixer from GLB animations
  - Implement animation state machine (idle, hover, attack)
  - Add playIdle, playHover, playAttack functions
  - Implement smooth transitions between animations
  - Handle missing animations gracefully
  - Return animation progress for synchronization
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 14.2 Write property tests for animation state transitions
  - **Property 17: Hover triggers animation**
  - **Property 18: Click triggers animation**
  - **Property 19: Animation state returns to idle**
  - **Validates: Requirements 7.2, 7.3, 7.4**

- [ ] 14.3 Integrate animations into Scene3D component
  - Import useModelAnimations hook in Scene3D
  - Set up AnimationMixer and update loop
  - Connect animation state to interaction events
  - Test animation playback with both model types
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 15. Add glowing eyes and scary lighting effects
  - Modify Scene3D to add eye glow configuration
  - Apply emissive materials to eye meshes (if available in model)
  - Add point lights at eye positions with red color
  - Increase light intensity on hover and attack states
  - Test lighting effects with both model types
  - _Requirements: 8.1_

- [ ] 16. Implement particle effects system
- [ ] 16.1 Create ScaryEffects component
  - Create frontend/src/components/ScaryEffects.tsx
  - Implement particle system for smoke effects
  - Implement particle system for sparks
  - Implement particle system for blood splatter
  - Add props for controlling which effects are active
  - Optimize particle count for mobile devices
  - _Requirements: 8.2_

- [ ] 16.2 Write property test for particle effects
  - **Property 20: Interaction triggers particles**
  - **Validates: Requirements 8.2**

- [ ] 16.3 Add post-processing effects
  - Import EffectComposer from @react-three/postprocessing
  - Add Bloom effect for glowing elements
  - Add color grading for scary atmosphere
  - Add optional vignette effect
  - Test performance impact on mobile
  - _Requirements: 8.3_

- [ ] 17. Coordinate audio, animations, and effects
- [ ] 17.1 Implement interaction event handlers
  - Add onPointerEnter handler for hover state
  - Add onPointerLeave handler to return to idle
  - Add onClick handler for attack state
  - Coordinate audio, animation, and particle triggers
  - Add cleanup for interrupted interactions
  - _Requirements: 6.1, 6.2, 7.2, 7.3, 8.2_

- [ ] 17.2 Write property test for effect synchronization
  - **Property 21: Effects synchronized with animations**
  - **Validates: Requirements 8.4**

- [ ] 17.3 Test interaction flow
  - Test idle → hover → idle transition
  - Test idle → hover → attack → idle transition
  - Test rapid interactions (spam clicking)
  - Verify audio doesn't overlap
  - Verify animations transition smoothly
  - _Requirements: 6.5, 7.4, 8.4_

- [ ] 18. Implement accessibility and motion preferences
- [ ] 18.1 Add prefers-reduced-motion detection
  - Detect prefers-reduced-motion media query
  - Store preference in component state
  - Disable auto-rotation when reduced motion is preferred
  - Disable automatic animations when reduced motion is preferred
  - Allow manual interactions with simplified animations
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 18.2 Write property tests for reduced motion
  - **Property 16: Motion preference respected**
  - **Property 22: Reduced motion disables animations**
  - **Property 23: Reduced motion allows interactions**
  - **Validates: Requirements 6.6, 9.2, 9.3**

- [ ] 18.3 Create manual effects toggle control
  - Add UI toggle button for enabling/disabling effects
  - Connect toggle to audio, animation, and particle systems
  - Style toggle to match Halloween theme
  - Add ARIA labels for accessibility
  - _Requirements: 9.4_

- [ ] 18.4 Write property test for effects toggle
  - **Property 24: Effects toggle changes state**
  - **Validates: Requirements 9.4**

- [ ] 18.5 Implement preference persistence
  - Save mute preference to localStorage
  - Save effects enabled preference to localStorage
  - Load preferences on component mount
  - Test persistence across page reloads
  - _Requirements: 9.5_

- [ ] 18.6 Write property test for preference persistence
  - **Property 25: Preferences persist across reloads**
  - **Validates: Requirements 9.5**

- [ ] 19. Implement mouse tracking system
- [ ] 19.1 Create useMouseTracking hook
  - Create frontend/src/hooks/useMouseTracking.ts
  - Track mouse position using mousemove event listener
  - Convert mouse coordinates to normalized device coordinates (-1 to 1)
  - Calculate target rotation angles based on mouse position
  - Apply sensitivity and rotation limits from configuration
  - Implement smooth interpolation (lerp) for rotation changes
  - Disable tracking when prefers-reduced-motion is enabled
  - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [ ] 19.2 Write property tests for mouse tracking
  - **Property 27: Mouse tracking rotates model**
  - **Property 28: Smooth mouse tracking interpolation**
  - **Property 29: Mouse tracking rotation limits**
  - **Property 30: Reduced motion disables mouse tracking**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.5**

- [ ] 19.3 Integrate mouse tracking into Scene3D
  - Import useMouseTracking hook in Scene3D component
  - Apply target rotation to model or specific bone (head/neck)
  - Use useFrame to smoothly update rotation each frame
  - Test tracking with both model types
  - Verify rotation limits prevent unnatural poses
  - _Requirements: 11.1, 11.4, 11.6_

- [ ] 19.4 Test mouse tracking interactions
  - Test mouse tracking works across entire viewport
  - Test tracking maintains state when mouse is stationary
  - Test tracking is disabled during attack animations
  - Test tracking respects prefers-reduced-motion
  - Test on touch devices (should gracefully degrade)
  - _Requirements: 11.1, 11.4, 11.5_

- [ ] 20. Update landing page integration with scary features
  - Update Model3DViewer import in page.tsx
  - Enable audio, animations, effects, and mouse tracking props
  - Configure respectMotionPreference prop
  - Test z-index layering with new effects
  - Verify effects don't obscure important content
  - _Requirements: 3.1, 3.3, 3.5_

- [ ] 21. Performance optimization for scary features
  - Implement lazy loading for audio files
  - Reduce particle count on mobile devices
  - Disable post-processing on low-end devices
  - Add FPS monitoring and auto-quality adjustment
  - Test memory usage with all effects enabled
  - Optimize audio file sizes (compression)
  - _Requirements: 2.5, 8.5_

- [ ] 22. Cross-browser testing for audio and effects
  - Test audio playback on Chrome, Firefox, Safari, Edge
  - Test autoplay policies and user gesture requirements
  - Test WebGL effects on iOS Safari
  - Test particle effects on Android Chrome
  - Verify fallbacks work when features are unsupported
  - _Requirements: 1.4, 10.5_

- [ ] 23. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
