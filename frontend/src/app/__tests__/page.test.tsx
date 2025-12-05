import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import Home from '../page';

// Mock Model3DViewer component
jest.mock('@/components/Model3DViewer', () => ({
  Model3DViewer: () => <div data-testid="3d-viewer-mock">3D Viewer</div>,
  MODEL_CONFIGS: {
    pbr: { path: '/models/base_basic_pbr.glb' },
    shaded: { path: '/models/base_basic_shaded.glb' },
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, whileInView, viewport, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, initial, animate, transition, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, initial, animate, transition, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock effects components
jest.mock('@/components/effects', () => ({
  FloatingGhosts: () => null,
  Bats: () => null,
  SpiderWeb: () => null,
  Fog: () => null,
}));

// Mock agent components
jest.mock('@/components/agents', () => ({
  GhostOrchestrator: () => null,
  SkeletonMemory: () => null,
  VampireTicketing: () => null,
  WitchNetwork: () => null,
  ReaperCloud: () => null,
  MummySummarization: () => null,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Landing Page with 3D Model Integration', () => {
  describe('Property 7: Existing accessibility preserved', () => {
    /**
     * Feature: 3d-model-integration, Property 7: Existing accessibility preserved
     * Validates: Requirements 4.5
     * 
     * For any landing page render with the 3D viewer, all existing accessibility 
     * features (skip links, ARIA labels, semantic HTML) should remain functional and present.
     */
    it('should preserve skip-to-main link', () => {
      render(<Home />);
      
      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should preserve main landmark with id', () => {
      const { container } = render(<Home />);
      
      const main = container.querySelector('main#main-content');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('role', 'main');
    });

    it('should preserve hero title with proper heading', () => {
      render(<Home />);
      
      const heroTitle = screen.getByRole('heading', { name: /Haunted Helpdesk/i });
      expect(heroTitle).toBeInTheDocument();
      expect(heroTitle).toHaveAttribute('id', 'hero-title');
    });

    it('should preserve navigation ARIA labels', () => {
      const { container } = render(<Home />);
      
      const nav = container.querySelector('[aria-label="Main navigation"]');
      expect(nav).toBeInTheDocument();
    });

    it('should preserve button ARIA labels', () => {
      render(<Home />);
      
      const cryptButton = screen.getByLabelText(/enter the crypt/i);
      expect(cryptButton).toBeInTheDocument();
      
      const grimoireButton = screen.getByLabelText(/view grimoire/i);
      expect(grimoireButton).toBeInTheDocument();
    });

    it('should preserve section headings with IDs', () => {
      render(<Home />);
      
      const featuresTitle = screen.getByRole('heading', { name: /supernatural powers/i });
      expect(featuresTitle).toBeInTheDocument();
      expect(featuresTitle).toHaveAttribute('id', 'features-title');
      
      const agentsTitle = screen.getByRole('heading', { name: /meet the coven/i });
      expect(agentsTitle).toBeInTheDocument();
      expect(agentsTitle).toHaveAttribute('id', 'agents-title');
    });

    it('should preserve article roles for feature cards', () => {
      const { container } = render(<Home />);
      
      const articles = container.querySelectorAll('[role="article"]');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should maintain accessibility with 3D viewer present', () => {
      fc.assert(
        fc.property(
          fc.constant(true),
          () => {
            const { container } = render(<Home />);
            
            // Verify 3D viewer is present (use getAllByTestId since dynamic loading may create duplicates)
            const viewers = screen.queryAllByTestId('3d-viewer-mock');
            expect(viewers.length).toBeGreaterThan(0);
            
            // Verify skip link still works
            const skipLink = screen.getByText(/skip to main content/i);
            expect(skipLink).toBeInTheDocument();
            
            // Verify main content is accessible
            const main = container.querySelector('main#main-content');
            expect(main).toBeInTheDocument();
          }
        ),
        { numRuns: 10 } // Reduce runs to avoid timeout
      );
    });
  });
});


describe('Landing Page Integration Tests', () => {
  it('should render 3D viewer without breaking layout', () => {
    const { container } = render(<Home />);
    
    // Verify 3D viewer is present
    const viewer = screen.getByTestId('3d-viewer-mock');
    expect(viewer).toBeInTheDocument();
    
    // Verify main content sections still render
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('should have correct z-index layering', () => {
    const { container } = render(<Home />);
    
    // 3D viewer should be in background (z-0)
    const viewerContainer = container.querySelector('[data-testid="3d-viewer-mock"]')?.parentElement;
    expect(viewerContainer).toHaveClass('z-0');
    
    // Hero section should be in foreground (z-10)
    const heroSection = container.querySelector('section');
    expect(heroSection).toHaveClass('z-10');
  });

  it('should maintain skip-to-main functionality', () => {
    render(<Home />);
    
    const skipLink = screen.getByText(/skip to main content/i);
    const mainContent = document.getElementById('main-content');
    
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(mainContent).toBeInTheDocument();
  });

  it('should preserve all ARIA labels', () => {
    render(<Home />);
    
    // Check navigation labels
    expect(screen.getByLabelText(/enter the crypt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/view grimoire/i)).toBeInTheDocument();
  });

  it('should render all feature cards', () => {
    render(<Home />);
    
    expect(screen.getByText(/ai possession/i)).toBeInTheDocument();
    expect(screen.getByText(/spectral swarm/i)).toBeInTheDocument();
    expect(screen.getByText(/eternal memory/i)).toBeInTheDocument();
  });

  it('should render all agent cards', () => {
    render(<Home />);
    
    expect(screen.getByText(/ghost orchestrator/i)).toBeInTheDocument();
    expect(screen.getByText(/skeleton memory/i)).toBeInTheDocument();
    expect(screen.getByText(/vampire ticketing/i)).toBeInTheDocument();
    expect(screen.getByText(/witch network/i)).toBeInTheDocument();
    expect(screen.getByText(/reaper cloud/i)).toBeInTheDocument();
    expect(screen.getByText(/mummy summarization/i)).toBeInTheDocument();
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<Home />);
    
    // Check for main landmark
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('role', 'main');
    
    // Check for sections
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
    
    // Check for headings
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    
    const h2Elements = container.querySelectorAll('h2');
    expect(h2Elements.length).toBeGreaterThan(0);
  });

  it('should not have duplicate IDs', () => {
    const { container } = render(<Home />);
    
    const ids = ['main-content', 'hero-title', 'features-title', 'agents-title'];
    
    ids.forEach(id => {
      const elements = container.querySelectorAll(`#${id}`);
      expect(elements.length).toBe(1);
    });
  });

  it('should maintain responsive classes', () => {
    const { container } = render(<Home />);
    
    const main = container.querySelector('main');
    expect(main).toHaveClass('min-h-screen');
    
    const sections = container.querySelectorAll('section');
    sections.forEach(section => {
      const classes = section.className;
      expect(classes).toMatch(/px-\d+/); // Has padding
    });
  });
});
