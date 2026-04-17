# Design System Specification: The Digital Agrarian

## 1. Overview & Creative North Star
The core philosophy of this design system is **"The Digital Agrarian."** We are moving away from the "industrial dashboard" aesthetic. Instead, we are building a digital ecosystem that feels as organic and intentional as a well-tended field. 

This system rejects the rigidity of traditional SaaS templates. We leverage **Intentional Asymmetry** and **Soft Layering** to create a high-end, editorial experience. By utilizing overlapping elements and a hierarchy driven by tonal depth rather than lines, we provide Indian farmers with a tool that feels premium yet deeply intuitive—balancing cutting-edge AI sophistication with the warmth of the earth.

---

## 2. Colors & Surface Philosophy
Our palette is a dialogue between technology (`primary`) and the land (`secondary`). 

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or subtle tonal transitions. 
- Use `surface-container-low` for sections sitting on a `surface` background.
- This creates a seamless, "molded" look that feels modern and approachable.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, handmade paper.
- **Level 0 (Base):** `surface` (#f8faf8)
- **Level 1 (Sectioning):** `surface-container-low` (#f2f4f2)
- **Level 2 (Cards/Modules):** `surface-container-lowest` (#ffffff)
- **Level 3 (Interactive/Floating):** `surface-bright` (#f8faf8)

### The "Glass & Gradient" Rule
To elevate the "AI" aspect of the system, use **Glassmorphism** for floating action buttons or weather overlays.
- **Glass Token:** `surface` at 70% opacity + 20px backdrop blur.
- **Signature Textures:** Apply a subtle linear gradient from `primary` (#186a22) to `primary_container` (#358438) for main CTAs to give them a "living" tactile quality.

---

## 3. Typography: The Editorial Voice
We use a dual-typeface system to bridge the gap between high-tech precision and human friendliness.

*   **Display & Headlines:** `Plus Jakarta Sans`. This face provides an airy, modern feel with a high x-height that remains legible at large scales.
*   **Body & UI Labels:** `Inter`. Chosen for its exceptional legibility in multilingual contexts (English, Hindi, and Marathi), ensuring that technical advice is never misread.

| Level | Token | Font | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Display | `display-lg` | Plus Jakarta Sans | 3.5rem | 700 |
| Headline | `headline-md` | Plus Jakarta Sans | 1.75rem | 600 |
| Title | `title-lg` | Inter | 1.375rem | 600 |
| Body | `body-lg` | Inter | 1rem | 400 |
| Label | `label-md` | Inter | 0.75rem | 500 |

**Multilingual Note:** When rendering Hindi or Marathi, increase the `line-height` by 15% to accommodate the Matra (top bars) without crowding the layout.

---

## 4. Elevation & Depth
We convey hierarchy through **Tonal Layering** rather than traditional structural lines.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift.
*   **Ambient Shadows:** For floating elements (like an AI suggestion modal), use extra-diffused shadows: `box-shadow: 0 12px 40px rgba(25, 28, 27, 0.06)`. Note the use of `on-surface` (#191c1b) for the shadow tint to keep it natural.
*   **The "Ghost Border" Fallback:** If a container sits on a background of the same color, use a "Ghost Border": `outline-variant` (#bfcab9) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons (High-Impact)
*   **Primary:** Solid `primary` background with `on-primary` text. Use `xl` (3rem) roundedness for a friendly, pill-shaped feel.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. These should feel "earthy" and less urgent.
*   **Tactile Feedback:** On press, transition the background to `primary_container`.

### Cards & Information Modules
*   **Rule:** Forbid the use of divider lines.
*   **Layout:** Separate "Crop Health" from "Weather" using `md` (1.5rem) vertical spacing. 
*   **Radius:** Use `lg` (2rem) for main cards to create a soft, non-technical appearance.

### Input Fields
*   **Style:** Filled containers using `surface-container-high`. 
*   **Focus State:** A 2px "Ghost Border" using `primary` at 40% opacity. No harsh black outlines.
*   **Accessibility:** Large touch targets (minimum 48px height) for ease of use in the field.

### Signature Component: "The Advisory Lens"
A floating glassmorphic card that appears over camera feeds or soil data. Use `surface_container_lowest` at 80% opacity with a `primary` left-accent bar (4px) to indicate AI-generated insights.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts (e.g., an illustration overlapping the edge of a card).
*   **Do** prioritize large typography (minimum 16px/1rem) for all body text.
*   **Do** use generous white space to allow the "earthy" palette to breathe.
*   **Do** ensure all icons are "Soft-Rounded" to match the 16px+ corner radius of the UI.

### Don't:
*   **Don't** use pure black (#000000). Use `on_surface` (#191c1b) for all text to maintain a premium, soft-contrast look.
*   **Don't** use 1px dividers. If you need to separate content, use a background color shift or a `1.5rem` gap.
*   **Don't** use sharp corners. Everything—from buttons to images—must adhere to the `DEFAULT` (1rem) or `lg` (2rem) roundedness scale.
*   **Don't** clutter the screen. If an AI insight is complex, break it into a "Stepped" card flow rather than a long scrolling list.