# Accessibility Features

This document outlines the accessibility features implemented in the Haunted Helpdesk frontend application.

## Overview

The Haunted Helpdesk application has been designed with accessibility in mind, following WCAG 2.1 Level AA guidelines to ensure the application is usable by people with disabilities.

## Implemented Features

### 1. Semantic HTML

- **Proper heading hierarchy**: All pages use proper heading levels (h1, h2, h3) in logical order
- **Landmark regions**: Main content areas are marked with appropriate ARIA landmarks
  - `<main>` for primary content
  - `<header>` for page headers
  - `<nav>` for navigation areas
  - `role="article"` for feature cards and agent descriptions
  - `role="form"` for ticket submission forms
  - `role="list"` and `role="listitem"` for ticket lists

### 2. ARIA Labels and Descriptions

- **Interactive elements**: All buttons, links, and form controls have descriptive labels
- **Form fields**: All inputs have associated `<label>` elements with proper `for` attributes
- **Error messages**: Form validation errors are announced with `role="alert"` and `aria-live="assertive"`
- **Status updates**: Workflow logs use `aria-live="polite"` for non-intrusive updates
- **Decorative elements**: All decorative SVGs and emojis are marked with `aria-hidden="true"`

### 3. Keyboard Navigation

- **Focus indicators**: All interactive elements have visible focus indicators (3px green outline)
- **Tab order**: Logical tab order follows visual layout
- **Skip links**: "Skip to main content" links allow keyboard users to bypass navigation
- **Focus management**: Focus states are clearly visible with high-contrast outlines

### 4. Form Accessibility

- **Required fields**: Marked with `aria-required="true"`
- **Error states**: Invalid fields use `aria-invalid="true"` and `aria-describedby` to link to error messages
- **Field descriptions**: Helper text is properly associated using `aria-describedby`
- **Submit states**: Buttons indicate loading state with appropriate ARIA labels

### 5. Color Contrast

- **Text contrast**: All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Interactive elements**: Buttons and links have sufficient contrast in all states
- **High contrast mode**: Application respects `prefers-contrast: high` media query
- **Color-independent information**: Status is conveyed through text and icons, not color alone

### 6. Screen Reader Support

- **Alt text**: All meaningful images have descriptive alt text
- **ARIA labels**: Complex UI components have descriptive labels
- **Live regions**: Dynamic content updates are announced appropriately
- **Hidden content**: Decorative elements are hidden from screen readers

### 7. Motion and Animation

- **Reduced motion**: Respects `prefers-reduced-motion` media query
- **Animation control**: Users with motion sensitivity see minimal animations
- **Non-essential animations**: Decorative effects (ghosts, bats, fog) are marked as decorative

### 8. Visual Indicators

- **Status badges**: Ticket status is shown with both color and text
- **Severity icons**: Ticket severity uses both emoji icons and text labels
- **Active states**: Active agents are indicated by both visual glow and ARIA labels
- **Loading states**: Loading indicators include both visual and text feedback

## Testing Recommendations

### Manual Testing

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test form submission with keyboard only
   - Use skip links to navigate

2. **Screen Reader Testing**
   - Test with NVDA (Windows), JAWS (Windows), or VoiceOver (macOS)
   - Verify all content is announced correctly
   - Check form labels and error messages
   - Verify live region announcements

3. **Color Contrast**
   - Use browser DevTools to check contrast ratios
   - Test in high contrast mode
   - Verify information isn't conveyed by color alone

4. **Zoom and Magnification**
   - Test at 200% zoom level
   - Verify layout doesn't break
   - Check text remains readable

### Automated Testing Tools

- **axe DevTools**: Browser extension for accessibility auditing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **Pa11y**: Command-line accessibility testing tool

## Known Limitations

1. **Halloween Theme**: The dark theme with decorative elements may be challenging for some users with cognitive disabilities. Consider adding a "simplified mode" toggle in future iterations.

2. **Complex Visualizations**: The pentagram agent visualization may be difficult to understand for screen reader users. Consider adding a text-based alternative view.

3. **Real-time Updates**: Frequent workflow updates may be overwhelming for some users. Consider adding a "pause updates" option.

## Future Improvements

1. Add user preference controls for:
   - Reduced motion
   - Simplified theme
   - Font size adjustment
   - High contrast mode toggle

2. Implement keyboard shortcuts for common actions

3. Add more descriptive text alternatives for complex visualizations

4. Provide audio cues for important events (optional)

5. Add language selection and internationalization support

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Contact

For accessibility concerns or suggestions, please open an issue in the project repository.
