---
name: Vamsam
colors:
  surface: '#fff8f3'
  surface-dim: '#e1d9cf'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2e8'
  surface-container: '#f6ece3'
  surface-container-high: '#f0e7dd'
  surface-container-highest: '#eae1d7'
  on-surface: '#1f1b15'
  on-surface-variant: '#534439'
  inverse-surface: '#343029'
  inverse-on-surface: '#f8efe5'
  outline: '#857467'
  outline-variant: '#d8c3b4'
  surface-tint: '#8d4f11'
  primary: '#8d4f11'
  on-primary: '#ffffff'
  primary-container: '#f4a460'
  on-primary-container: '#6e3900'
  inverse-primary: '#ffb77d'
  secondary: '#9a4600'
  on-secondary: '#ffffff'
  secondary-container: '#fd8a3e'
  on-secondary-container: '#672c00'
  tertiary: '#934b19'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc9f66'
  on-tertiary-container: '#753401'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#ffb68d'
  on-secondary-fixed: '#321200'
  on-secondary-fixed-variant: '#763400'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#753401'
  background: '#fff8f3'
  on-background: '#1f1b15'
  surface-variant: '#eae1d7'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-padding: 32px
  fluid-gap: 24px
---

## Brand & Style
The design system is centered on the concept of "Living History." It bridges the gap between ancestral reverence and modern digital accessibility. The brand personality is **warm, respectful, and premium**, designed to feel less like a software application and more like a digital heirloom or a beautifully bound family ledger.

The design style is **Organic Tactility**. It moves away from the rigid, industrial structures of modern SaaS and instead embraces fluid, soft-edged surfaces that mimic the feel of physical parchment and natural materials. We employ a "card-on-card" layering technique to create depth, utilizing subtle shadows and soft gradients to suggest physical presence without the use of harsh borders or boxy containers. The emotional response should be one of calm, nostalgia, and importance.

## Colors
The palette is inspired by "Sand and Saffron," evoking earth, sun, and longevity.

- **Primary (Saffron):** `#F4A460` - Used for key actions, highlights, and moments of celebration. It carries a golden, sun-drenched warmth.
- **Surface (Parchment):** `#FDFCF8` - The foundational canvas. This warm cream prevents the eye strain associated with pure white and provides a heritage feel.
- **Secondary (Terracotta):** `#D2691E` - Used for accents and interactive states that require more grounding than the primary saffron.
- **Neutral (Umber):** `#4A453E` - Used for text and icons to maintain high contrast while remaining softer than pure black.

Backgrounds should feature subtle, low-opacity (2-3%) cultural motifs like mandalas or paisley patterns to add texture and depth to the parchment surfaces.

## Typography
The typography strategy balances editorial elegance with extreme legibility.

- **Headlines (Source Serif 4):** A high-quality serif that provides the "bookish" and authoritative feel of a historical document. Use this for all titles and section headers. It should feel intentional and timeless.
- **Body & UI (Atkinson Hyperlegible Next):** Specifically chosen for its accessibility. The clear distinction between similar letterforms ensures that elder users can navigate the lineage and stories without visual fatigue.
- **Hierarchy:** Maintain generous line heights (1.5x for body text) to ensure readability. Display sizes should use slightly tighter tracking to emphasize their "heirloom" character.

## Layout & Spacing
This design system utilizes a **Fluid Card-on-Card** layout rather than a rigid column grid. Content is organized into soft, floating surfaces that "breathe" with generous white space.

- **Stacking:** Elements are layered to indicate hierarchy. A main card might sit on the Parchment background, with smaller nested cards (like individual family members) sitting atop it.
- **Padding:** We prioritize large internal margins (`lg` and `xl`) to create a sense of premium spaciousness.
- **Responsibility:** On mobile, the cards transition to a full-width stack with reduced horizontal padding, but the `xxl` vertical spacing is maintained between sections to keep the "slow, intentional" pace of the experience.

## Elevation & Depth
Elevation is communicated through **Tonal Layers** and **Ambient Shadows**. Instead of harsh drop shadows, we use "glow-like" diffusions that match the warmth of the palette.

- **Base Layer:** The Parchment surface (`#FDFCF8`) with faint cultural patterns.
- **Raised Surfaces:** Cards use a very soft, multi-layered shadow (0px 4px 20px rgba(74, 69, 62, 0.05)) to appear as if they are gently resting on the surface.
- **Depth Tints:** Shadows should not be pure gray; they should be tinted with the Neutral Umber to maintain the organic warmth of the system.
- **Transitions:** Use soft blurs on background elements when modals are active, enhancing the "Glassmorphism" feel but with a matte, paper-like finish instead of cold glass.

## Shapes
The shape language is **Organic and Soft**. We utilize a base roundedness of 16px (represented by `roundedness: 2`) for all primary containers and cards.

- **Cards:** 16px (`1rem`) corner radius.
- **Large Sections:** 24px (`1.5rem`) for larger surface areas or hero sections.
- **Small Elements:** Buttons and inputs should maintain a minimum of 8px (`0.5rem`) to ensure they don't feel "sharp" compared to the surrounding containers.
- **Continuity:** Avoid 0px corners entirely; everything in the system should feel as if it has been smoothed by time and touch.

## Components
Components should feel like objects within an archive.

- **Buttons:** Use a slight gradient (Saffron to a slightly deeper Sand). They should have a soft, tactile feel, almost "squishy," with subtle 1px internal glows rather than heavy borders.
- **Cards:** These are the heart of the system. Cards should have no borders; depth is created entirely through the soft umber-tinted shadows and a subtle 1px lighter top edge.
- **Input Fields:** Use a slightly darker shade of the surface color (`#F5F4EF`) for the field background to create a "pressed into paper" effect.
- **Chips & Tags:** Use low-opacity versions of the Primary Saffron with dark umber text.
- **Lists:** Use vertical lines or "genealogy threads" that are thin and colored in a faded Terracotta to guide the eye without creating a cage.
- **Specialty Components:** Include a "Story Scroll" component (a horizontal paginated card view) and "Legacy Nodes" (circular profile images with Saffron halos) to represent family members.