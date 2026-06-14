---
name: Blank Canvas
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#45464c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261906'
  on-tertiary-container: '#968065'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#f9debf'
  tertiary-fixed-dim: '#dcc2a4'
  on-tertiary-fixed: '#261906'
  on-tertiary-fixed-variant: '#55442d'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin: 32px
  max_width: 1280px
---

## Brand & Style
The design system is rooted in the Swiss International Typographic Style, emphasizing cleanliness, readability, and objectivity. It serves as an open-source Motion that acts as a "blank canvas"—an unobtrusive tool that recedes into the background to prioritize user content. 

The aesthetic is ultra-minimalist and functional. It avoids unnecessary decoration, relying instead on mathematical grids, generous whitespace, and precise typography to convey a sense of hyper-organization and speed. The emotional response is one of clarity and focused calm, catering to power users who value systematic efficiency over visual flair.

## Colors
The palette is strictly monotone to ensure the interface remains neutral. The light mode uses a crisp `#FFFFFF` base to maximize the feeling of air and space. Dark mode utilizes a deep charcoal `#09090B` to reduce eye strain while maintaining high contrast for legibility.

Accent colors are avoided. Interaction states (hover, active) are communicated through subtle shifts in grayscale values or inverted tones rather than chromatic changes. Borders are used sparingly but strictly to define functional zones without adding visual weight.

## Typography
This design system utilizes **Geist** for its core identity—a font designed for precision and developer-centric workflows. It provides a geometric, low-contrast look that feels engineered and modern. For metadata, small labels, and code snippets, **JetBrains Mono** is used to reinforce the "tool-first" nature of the workspace.

Hierarchy is established through scale and weight rather than color. Large display headings use tight letter spacing and heavy weights, while body text is given generous line heights to ensure long-form readability.

## Layout & Spacing
The layout follows a strict 12-column grid system for desktop, transitioning to a 4-column grid for mobile. Alignment is the primary driver of visual order; every element must snap to the grid. 

Margins and paddings are generous, often defaulting to `lg (24px)` or `xl (40px)` to prevent the UI from feeling cramped. Content is typically centered in a fixed-width container on wide screens to maintain focus, while utility sidebars utilize fluid widths with a maximum cap.

## Elevation & Depth
Elevation is achieved through **tonal layering** and **low-contrast outlines** rather than shadows. In a flat Swiss-inspired system, depth is purely functional.

- **Level 0 (Base):** The primary background color.
- **Level 1 (Surface):** A subtle shift (1-2% lighter or darker) to indicate a container or sidebar.
- **Overlays:** Modals or menus use a thin 1px border (`#E5E7EB` or `#27272A`) to separate from the background. 
- **Backdrop:** When a modal is active, the background uses a subtle blur (8px) without a heavy dark overlay to maintain the "lightness" of the workspace.

## Shapes
Shapes are disciplined. The default `roundedness: 1` (0.25rem/4px) provides just enough softness to feel modern while maintaining the structural integrity of a grid-based design. This subtle rounding is applied to buttons, input fields, and cards. Avatars and specific status indicators may use pill-shapes (circular) to contrast against the otherwise rectilinear environment.

## Components
- **Buttons:** Primarily "ghost" or "outline" styles. High-priority actions use a solid fill of the primary text color with inverted text. Padding is strictly horizontal.
- **Inputs:** Simple bottom-border or 1px stroke. Focus states are indicated by a 1px solid stroke of the primary color, with no outer glow.
- **Chips:** Rectangular with minimal rounding (4px). Backgrounds are nearly transparent, using subtle borders to define boundaries.
- **Cards:** No shadows. Cards are defined by a 1px border. In "Blank" mode, cards may have no border at all, using whitespace alone to group content.
- **Lists:** High-density with thin horizontal dividers (0.5px). Hover states utilize a subtle background tint (`neutral_color_hex`).
- **Icons:** 20px monotone stroke icons. Line weight should be consistent with the typography weight (approx 1.5px).
- **Navigation:** Vertical sidebars for workspace hierarchy, using "active" indicators consisting of a simple 2px vertical line on the leading edge.