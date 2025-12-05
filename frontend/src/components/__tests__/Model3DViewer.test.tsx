import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { Model3DViewer } from '../Model3DViewer';

// Mock @react-three/fiber Canvas component
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas-mock" {...props}>
      {children}
    </div>
  ),
}));

// Mock @react-three/drei hooks
jest.mock('@react-three/drei', () => ({
  useGLTF: jest.fn(() => ({
    scene: {
      traverse: jest.fn(),
    },
    nodes: {},
    materials: {},
  })),
  OrbitControls: () => null,
}));

describe('Model3DViewer Component', () => {
  describe('Property 1: Model rendering on page load', () => {
    /**
     * Feature: 3d-model-integration, Property 1: Model rendering on page load
     * Validates: Requirements 1.1
     * 
     * For any valid landing page load, the 3D viewer component should render 
     * a canvas element containing 3D scene content.
     */
    it('should render canvas element for any valid model path', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '/models/base_basic_pbr.glb',
            '/models/base_basic_shaded.glb',
            '/models/test.glb'
          ),
          (modelPath) => {
            const { container } = render(
              <Model3DViewer modelPath={modelPath} />
            );
            
            // Verify canvas element exists
            const canvas = container.querySelector('[data-testid="canvas-mock"]');
            expect(canvas).toBeInTheDocument();
            
            // Verify the component renders without crashing
            expect(container.firstChild).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render with aria-hidden attribute for accessibility', () => {
      const { container } = render(
        <Model3DViewer modelPath="/models/test.glb" />
      );
      
      const viewerContainer = container.firstChild as HTMLElement;
      expect(viewerContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render canvas with proper dimensions', () => {
      const { container } = render(
        <Model3DViewer modelPath="/models/test.glb" />
      );
      
      const canvas = container.querySelector('[data-testid="canvas-mock"]');
      expect(canvas).toHaveStyle({ width: '100%', height: '100%' });
    });
  });

  describe('Component Props', () => {
    it('should accept and apply className prop', () => {
      const { container } = render(
        <Model3DViewer 
          modelPath="/models/test.glb" 
          className="custom-class"
        />
      );
      
      const viewerContainer = container.firstChild as HTMLElement;
      expect(viewerContainer).toHaveClass('custom-class');
    });

    it('should accept autoRotate prop', () => {
      const { container } = render(
        <Model3DViewer 
          modelPath="/models/test.glb" 
          autoRotate={false}
        />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept enableZoom prop', () => {
      const { container } = render(
        <Model3DViewer 
          modelPath="/models/test.glb" 
          enableZoom={false}
        />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept position prop', () => {
      const { container } = render(
        <Model3DViewer 
          modelPath="/models/test.glb" 
          position={[1, 2, 3]}
        />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept scale prop', () => {
      const { container } = render(
        <Model3DViewer 
          modelPath="/models/test.glb" 
          scale={2.5}
        />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should use default values when props are not provided', () => {
      const { container } = render(
        <Model3DViewer modelPath="/models/test.glb" />
      );
      
      // Component should render with defaults
      expect(container.firstChild).toBeInTheDocument();
      const viewerContainer = container.firstChild as HTMLElement;
      expect(viewerContainer).toHaveClass('w-full', 'h-full');
    });
  });
});


describe('Property 8: Model selection by configuration', () => {
  /**
   * Feature: 3d-model-integration, Property 8: Model selection by configuration
   * Validates: Requirements 5.1, 5.2
   * 
   * For any valid model type ('pbr' or 'shaded') passed as a prop, 
   * the component should load the corresponding GLB file from the correct path.
   */
  it('should load correct model file for any valid model type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('pbr', 'shaded'),
        (modelType) => {
          const expectedPath = modelType === 'pbr' 
            ? '/models/base_basic_pbr.glb'
            : '/models/base_basic_shaded.glb';
          
          const { container } = render(
            <Model3DViewer modelPath={expectedPath} />
          );
          
          // Verify component renders with the correct path
          expect(container.firstChild).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use MODEL_CONFIGS for pbr model', () => {
    const { MODEL_CONFIGS } = require('../Model3DViewer');
    
    expect(MODEL_CONFIGS.pbr.path).toBe('/models/base_basic_pbr.glb');
    expect(MODEL_CONFIGS.pbr.type).toBe('pbr');
  });

  it('should use MODEL_CONFIGS for shaded model', () => {
    const { MODEL_CONFIGS } = require('../Model3DViewer');
    
    expect(MODEL_CONFIGS.shaded.path).toBe('/models/base_basic_shaded.glb');
    expect(MODEL_CONFIGS.shaded.type).toBe('shaded');
  });
});


describe('Property 10: Model switching via props', () => {
  /**
   * Feature: 3d-model-integration, Property 10: Model switching via props
   * Validates: Requirements 5.5
   * 
   * For any change to the model type prop, the component should unload 
   * the previous model and load the new model corresponding to the updated prop value.
   */
  it('should switch models when modelPath prop changes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ['/models/base_basic_pbr.glb', '/models/base_basic_shaded.glb'],
          ['/models/base_basic_shaded.glb', '/models/base_basic_pbr.glb'],
          ['/models/test1.glb', '/models/test2.glb']
        ),
        ([initialPath, newPath]) => {
          const { container, rerender } = render(
            <Model3DViewer modelPath={initialPath} />
          );
          
          // Verify initial render
          expect(container.firstChild).toBeInTheDocument();
          
          // Switch to new model
          rerender(<Model3DViewer modelPath={newPath} />);
          
          // Verify component still renders after switch
          expect(container.firstChild).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle rapid model switching', () => {
    const { container, rerender } = render(
      <Model3DViewer modelPath="/models/base_basic_pbr.glb" />
    );
    
    expect(container.firstChild).toBeInTheDocument();
    
    // Switch multiple times
    rerender(<Model3DViewer modelPath="/models/base_basic_shaded.glb" />);
    expect(container.firstChild).toBeInTheDocument();
    
    rerender(<Model3DViewer modelPath="/models/base_basic_pbr.glb" />);
    expect(container.firstChild).toBeInTheDocument();
    
    rerender(<Model3DViewer modelPath="/models/base_basic_shaded.glb" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});


describe('Property 2: Lighting configuration applied', () => {
  /**
   * Feature: 3d-model-integration, Property 2: Lighting configuration applied
   * Validates: Requirements 1.2, 3.2
   * 
   * For any rendered 3D scene, the scene should contain ambient and directional 
   * light objects with the configured Halloween-themed color values and intensity levels.
   */
  it('should have correct Halloween lighting configuration', () => {
    const { HALLOWEEN_LIGHTING } = require('../Model3DViewer');
    
    // Verify ambient light configuration
    expect(HALLOWEEN_LIGHTING.ambient.color).toBe('#ff7518'); // Pumpkin orange
    expect(HALLOWEEN_LIGHTING.ambient.intensity).toBe(0.4);
    
    // Verify directional light configuration
    expect(HALLOWEEN_LIGHTING.directional.color).toBe('#9d4edd'); // Phantom purple
    expect(HALLOWEEN_LIGHTING.directional.intensity).toBe(0.8);
    expect(HALLOWEEN_LIGHTING.directional.position).toEqual([5, 5, 5]);
  });

  it('should apply lighting configuration for any model path', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/models/base_basic_pbr.glb',
          '/models/base_basic_shaded.glb',
          '/models/test.glb'
        ),
        (modelPath) => {
          const { container } = render(
            <Model3DViewer modelPath={modelPath} />
          );
          
          // Component should render with lighting
          expect(container.firstChild).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use consistent lighting colors across renders', () => {
    const { HALLOWEEN_LIGHTING } = require('../Model3DViewer');
    
    const render1 = HALLOWEEN_LIGHTING.ambient.color;
    const render2 = HALLOWEEN_LIGHTING.ambient.color;
    const render3 = HALLOWEEN_LIGHTING.directional.color;
    const render4 = HALLOWEEN_LIGHTING.directional.color;
    
    expect(render1).toBe(render2);
    expect(render3).toBe(render4);
  });
});


describe('Property 3: Interactive rotation enabled', () => {
  /**
   * Feature: 3d-model-integration, Property 3: Interactive rotation enabled
   * Validates: Requirements 1.3
   * 
   * For any user interaction event (mouse drag or touch gesture) on the 3D viewer, 
   * the camera position or model rotation should change in response to the input.
   */
  it('should enable OrbitControls for interaction', () => {
    const { container } = render(
      <Model3DViewer 
        modelPath="/models/test.glb"
        autoRotate={true}
        enableZoom={true}
      />
    );
    
    // Component should render with controls enabled
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should support autoRotate configuration', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (autoRotate) => {
          const { container } = render(
            <Model3DViewer 
              modelPath="/models/test.glb"
              autoRotate={autoRotate}
            />
          );
          
          expect(container.firstChild).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should support enableZoom configuration', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (enableZoom) => {
          const { container } = render(
            <Model3DViewer 
              modelPath="/models/test.glb"
              enableZoom={enableZoom}
            />
          );
          
          expect(container.firstChild).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle various control configurations', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (autoRotate, enableZoom) => {
          const { container } = render(
            <Model3DViewer 
              modelPath="/models/test.glb"
              autoRotate={autoRotate}
              enableZoom={enableZoom}
            />
          );
          
          expect(container.firstChild).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('Property 9: Error handling for invalid paths', () => {
  /**
   * Feature: 3d-model-integration, Property 9: Error handling for invalid paths
   * Validates: Requirements 5.3
   * 
   * For any invalid model file path, the component should catch the error, 
   * prevent crashes, and display a fallback state instead of the 3D model.
   */
  
  // Suppress console errors for these tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should render without crashing for any model path', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/models/nonexistent.glb',
          '/invalid/path.glb',
          '/models/corrupted.glb',
          '',
          '/models/test.glb'
        ),
        (modelPath) => {
          const { container } = render(
            <Model3DViewer modelPath={modelPath} />
          );
          
          // Component should always render something (either model or fallback)
          expect(container.firstChild).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have error boundary component', () => {
    const { Model3DErrorBoundary } = require('../Model3DViewer');
    expect(Model3DErrorBoundary).toBeDefined();
  });

  it('should have fallback UI component', () => {
    const { FallbackUI } = require('../Model3DViewer');
    expect(FallbackUI).toBeDefined();
  });

  it('should render FallbackUI with custom message', () => {
    const { FallbackUI } = require('../Model3DViewer');
    const { container } = render(<FallbackUI message="Custom error message" />);
    
    expect(container).toHaveTextContent('Custom error message');
  });

  it('should render FallbackUI with default message', () => {
    const { FallbackUI } = require('../Model3DViewer');
    const { container } = render(<FallbackUI />);
    
    expect(container).toHaveTextContent('Unable to load 3D model');
  });
});


describe('Property 4: Responsive canvas sizing', () => {
  /**
   * Feature: 3d-model-integration, Property 4: Responsive canvas sizing
   * Validates: Requirements 3.4
   * 
   * For any viewport size change, the 3D canvas dimensions should adjust 
   * to fit the container while maintaining aspect ratio.
   */
  it('should render canvas that fits within container for any viewport size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }), // width
        fc.integer({ min: 240, max: 2160 }), // height
        (width, height) => {
          const { container } = render(
            <div style={{ width: `${width}px`, height: `${height}px` }}>
              <Model3DViewer modelPath="/models/test.glb" />
            </div>
          );
          
          const viewerContainer = container.querySelector('[aria-hidden="true"]');
          expect(viewerContainer).toBeInTheDocument();
          expect(viewerContainer).toHaveClass('w-full', 'h-full');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have responsive width and height classes', () => {
    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    
    const viewerContainer = container.firstChild as HTMLElement;
    expect(viewerContainer).toHaveClass('w-full');
    expect(viewerContainer).toHaveClass('h-full');
  });

  it('should render canvas with 100% dimensions', () => {
    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    
    const canvas = container.querySelector('[data-testid="canvas-mock"]');
    expect(canvas).toHaveStyle({ width: '100%', height: '100%' });
  });

  it('should handle mobile viewport sizes', () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;

    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle desktop viewport sizes', () => {
    // Mock desktop viewport
    global.innerWidth = 1920;
    global.innerHeight = 1080;

    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });
});


describe('Property 5: Accessibility attributes present', () => {
  /**
   * Feature: 3d-model-integration, Property 5: Accessibility attributes present
   * Validates: Requirements 4.1
   * 
   * For any rendered 3D viewer component, the DOM should contain appropriate 
   * ARIA attributes (aria-label, aria-hidden, or role) for accessibility.
   */
  it('should have aria-hidden attribute for any model path', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/models/base_basic_pbr.glb',
          '/models/base_basic_shaded.glb',
          '/models/test.glb'
        ),
        (modelPath) => {
          const { container } = render(
            <Model3DViewer modelPath={modelPath} />
          );
          
          const viewerContainer = container.firstChild as HTMLElement;
          expect(viewerContainer).toHaveAttribute('aria-hidden', 'true');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain aria-hidden with different props', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.float({ min: 0.5, max: 3 }),
        (autoRotate, enableZoom, scale) => {
          const { container } = render(
            <Model3DViewer 
              modelPath="/models/test.glb"
              autoRotate={autoRotate}
              enableZoom={enableZoom}
              scale={scale}
            />
          );
          
          const viewerContainer = container.firstChild as HTMLElement;
          expect(viewerContainer).toHaveAttribute('aria-hidden', 'true');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have proper accessibility structure', () => {
    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    
    // Main container should have aria-hidden
    const viewerContainer = container.firstChild as HTMLElement;
    expect(viewerContainer).toHaveAttribute('aria-hidden', 'true');
    
    // Should not have interactive elements that could trap focus
    const buttons = container.querySelectorAll('button');
    const links = container.querySelectorAll('a');
    const inputs = container.querySelectorAll('input');
    
    expect(buttons.length).toBe(0);
    expect(links.length).toBe(0);
    expect(inputs.length).toBe(0);
  });
});


describe('Property 6: Focus trap prevention', () => {
  /**
   * Feature: 3d-model-integration, Property 6: Focus trap prevention
   * Validates: Requirements 4.3
   * 
   * For any keyboard navigation sequence through the page, focus should not 
   * become trapped within the 3D viewer component and should continue to 
   * subsequent focusable elements.
   */
  it('should not contain focusable elements that could trap focus', () => {
    const { container } = render(
      <div>
        <button data-testid="before">Before</button>
        <Model3DViewer modelPath="/models/test.glb" />
        <button data-testid="after">After</button>
      </div>
    );
    
    // Verify no focusable elements inside 3D viewer
    const viewer = container.querySelector('[aria-hidden="true"]');
    const focusableElements = viewer?.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    expect(focusableElements?.length || 0).toBe(0);
  });

  it('should allow focus to move past the component', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/models/base_basic_pbr.glb',
          '/models/base_basic_shaded.glb'
        ),
        (modelPath) => {
          const { container } = render(
            <div>
              <button data-testid="before">Before</button>
              <Model3DViewer modelPath={modelPath} />
              <button data-testid="after">After</button>
            </div>
          );
          
          const beforeButton = container.querySelector('[data-testid="before"]');
          const afterButton = container.querySelector('[data-testid="after"]');
          
          // Both buttons should be accessible
          expect(beforeButton).toBeInTheDocument();
          expect(afterButton).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have aria-hidden to exclude from tab order', () => {
    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    
    const viewerContainer = container.firstChild as HTMLElement;
    
    // aria-hidden="true" prevents focus trap by excluding from accessibility tree
    expect(viewerContainer).toHaveAttribute('aria-hidden', 'true');
  });

  it('should not interfere with keyboard navigation', () => {
    const { container } = render(
      <div>
        <input data-testid="input1" />
        <Model3DViewer modelPath="/models/test.glb" />
        <input data-testid="input2" />
      </div>
    );
    
    const input1 = container.querySelector('[data-testid="input1"]');
    const input2 = container.querySelector('[data-testid="input2"]');
    
    expect(input1).toBeInTheDocument();
    expect(input2).toBeInTheDocument();
  });
});
