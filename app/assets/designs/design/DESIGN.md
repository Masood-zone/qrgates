---
name: Kinetic Pulse
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#5b4040'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#906f70'
  outline-variant: '#e4bdbe'
  surface-tint: '#be0135'
  primary: '#ba0033'
  on-primary: '#ffffff'
  primary-container: '#df2848'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b5'
  secondary: '#575e74'
  on-secondary: '#ffffff'
  secondary-container: '#d8dff9'
  on-secondary-container: '#5b6278'
  tertiary: '#545c70'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d7489'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000b'
  on-primary-fixed-variant: '#920026'
  secondary-fixed: '#dbe2fc'
  secondary-fixed-dim: '#bfc6df'
  on-secondary-fixed: '#141b2e'
  on-secondary-fixed-variant: '#3f465b'
  tertiary-fixed: '#dbe2fa'
  tertiary-fixed-dim: '#bfc6dd'
  on-tertiary-fixed: '#141b2c'
  on-tertiary-fixed-variant: '#3f4759'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 80px
---

## Brand & Style

The design system is engineered for a high-energy, tech-driven event platform. The brand personality is professional yet vibrant, blending the reliability of a fintech application with the excitement of live entertainment. 

We utilize a **Corporate Modern** style infused with **Subtle Tactility**. The aesthetic relies on clean, structured layouts, high-quality imagery with dark overlays, and precise typography to establish trust. The "tech" feel is reinforced through the use of deep navy surfaces contrasted against punchy, high-action pink-reds, creating a UI that feels both sophisticated and urgent.

## Colors

The palette is anchored by **Pulse Red** (Primary), used strategically for calls-to-action and critical brand moments. **Deep Navy** (Secondary) provides the professional foundation, used primarily for headers, footers, and high-contrast text.

- **Primary (#E62E4D):** Used for main buttons, active states, and brand iconography.
- **Secondary (#12192C):** Used for the footer background, navigation text, and primary headings.
- **Tertiary (#E0E7FF):** A soft, cool blue used for input field backgrounds and subtle decorative elements to reduce visual fatigue.
- **Neutral (#F8F9FB):** The primary background color for page sections, ensuring a "clean room" feel for content.

## Typography

This design system uses a dual-font strategy. **Hanken Grotesk** is the primary display face, chosen for its sharp, contemporary geometry that aligns with the "tech" focus. **Inter** handles all body and utility text to ensure maximum legibility across dense data sets.

Headlines should utilize tighter letter spacing to maintain a cohesive, "locked-in" feel. Labels and navigational items should use a slight tracking increase and semi-bold weights to distinguish them from standard body copy.

## Layout & Spacing

The design system employs a **Fluid-Fixed Hybrid Grid**. Content is housed within a maximum 1280px container, centered on the viewport. 

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Vertical Rhythm:** Sections are separated by generous 80px padding to create a premium, editorial feel. 
- **Internal Spacing:** Use an 8px base unit. Components like cards and input groups should use 16px (stack-md) for internal element separation to maintain a breathable, organized interface.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. 

1.  **Base Layer:** Neutral (#F8F9FB) for the main canvas.
2.  **Raised Layer:** White (#FFFFFF) surfaces, such as cards or login containers, using a soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)).
3.  **Interactive Layer:** Primary buttons and active states use a more pronounced shadow to indicate "pressability."
4.  **Overlay Layer:** Modals and tooltips utilize a backdrop blur (12px) and a slightly darker shadow (rgba(0, 0, 0, 0.12)) to sit clearly above the UI.

## Shapes

The shape language is consistently **Rounded**, avoiding both the severity of sharp corners and the playfulness of full-pill shapes. 

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px) radius.
- **Containers (Cards, Modals):** 1rem (16px) radius for a softer, more modern framing of content.
- **Navigation Items:** Use a 4px (Soft) radius for a tighter, more precise appearance in density-heavy areas.

## Components

### Buttons
- **Primary:** Solid Pulse Red with white text. High-contrast, 8px border radius.
- **Secondary:** Outline variant with Primary Red border and text, or white background with Deep Navy text for navigation.
- **Ghost:** No background, Secondary Navy text, used for less critical actions like "Forgot Password."

### Input Fields
- **Style:** Filled style using Tertiary (#E0E7FF) background with a 1px transparent border that turns Pulse Red on focus. 
- **Labels:** Positioned above the field in Label-MD typography.

### Cards
- **Style:** White background with a 16px border radius and a soft ambient shadow. 
- **Content:** Images within cards should have a top-only 16px radius to sit flush with the card container.

### Chips & Badges
- **Style:** Small, semi-transparent backgrounds of the primary color (10% opacity) with solid Primary Red text for status indicators.

### Footer
- **Style:** Deep Navy (#12192C) background with White text. Organized into clear columns with the brand mark and social links on the peripheries.