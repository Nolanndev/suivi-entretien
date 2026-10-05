---
name: Suivi d'entretien
description: A personal maintenance logbook where every vehicle is a faded enamel plate.
colors:
  ground: "#eef0ec"
  surface: "#fbfbf8"
  surface-2: "#e5e9e4"
  line: "#d3d9d2"
  ink: "#1f2b35"
  ink-2: "#4f5d68"
  ink-3: "#66727b"
  blue: "#3f6f9c"
  blue-soft: "#dde8f1"
  blue-ink: "#26496b"
  amber: "#c98a2c"
  amber-soft: "#f7ecd6"
  amber-ink: "#6e4a12"
  celadon: "#5f9880"
  celadon-soft: "#dcede4"
  celadon-ink: "#2f5e4a"
  danger: "#b5473a"
  danger-soft: "#f6dfdb"
  tile: "#2c4d6e"
  tile-ink: "#f4f3ee"
  tile-rim: "#8fb0cf"
typography:
  meter:
    fontFamily: "Barlow Condensed, Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
  headline:
    fontFamily: "Barlow Condensed, Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.02em"
  header-title:
    fontFamily: "Barlow Condensed, Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.03em"
  section-title:
    fontFamily: "Barlow Condensed, Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.04em"
  body:
    fontFamily: "Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: "Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Barlow, -apple-system, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  round: "50%"
spacing:
  xs: "0.35rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.1rem"
  danger-gap: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.tile-ink}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.1rem"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.1rem"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.1rem"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "0.7rem 1.1rem"
    height: "48px"
  button-danger-hover:
    backgroundColor: "{colors.danger-soft}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    size: "44px"
  fab:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.tile-ink}"
    rounded: "{rounded.round}"
    size: "60px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.4rem 0.8rem"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.blue-soft}"
    textColor: "{colors.blue-ink}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.65rem 0.8rem"
    height: "48px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  plate-car:
    backgroundColor: "{colors.blue-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  plate-motorbike:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  plate-motoculture:
    backgroundColor: "{colors.celadon-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  meter-tile:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.tile-ink}"
    typography: "{typography.meter}"
    width: "1.05em"
    height: "1.45em"
---

# Design System: Suivi d'entretien

## Overview

**Creative North Star: "The Enamel Plate"**

Every vehicle is a faded enamel plate screwed to a garage wall: soft blue, amber or celadon enamel, condensed capital lettering, a rolled edge with a second rim inside it. The meter is set like a street-number plate, one enamel tile per digit. Around the plates the app is quiet: pale zinc ground, near-white panels, slate ink. It reads as a logbook kept by a person with a toolbox, not as a generated dashboard.

The system is simple and calm by commitment. Colours are soft and easy on the eyes in both themes; the light theme is zinc and enamel white, the dark theme is deep enamel navy. The theme follows the system by default and a toggle in the home header forces light or dark. Density is mobile-first and thumb-sized: 48px controls, a fixed bottom action bar, a floating add button. One icon library (Lucide) carries a glyph beside almost every label, title and figure.

Motion is a short directional slide between screens (native View Transitions, 240ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`): forward slides in from the right, back from the left, while the header and bottom bar morph in place. Presses scale down slightly. Reduced motion collapses every animation and transition to 1ms.

**Key Characteristics:**
- Colour confined to the plates: vehicle plates, type badges, meter tiles, the primary tile button.
- One enamel per vehicle type: blue for car, amber for motorbike, celadon for motoculture.
- Double inner rim on every enamel surface.
- Barlow Condensed capitals for names, titles and figures; Barlow for running text.
- Right-aligned tabular figures, totals under a heavy ink rule.
- Destructive actions isolated at the bottom, behind a confirmation.
- Light and dark, following the system, with a header toggle.

## Colors

Faded enamel on pale zinc: three muted vehicle enamels, one deep street-plate navy, and a cool neutral ladder; the dark theme swaps the ground for deep enamel navy and lightens every enamel.

### Primary
- **Street-Plate Navy** (tile): the meter digit tiles, the primary button and the floating add button. It is the only solid dark fill on a light screen and marks "the thing you act on or read first". Its text is **Enamel Cream** (tile-ink) and its inner rim is **Faded Sky Rim** (tile-rim).

### Secondary
- **Faded Enamel Blue** (blue): the car enamel (plate border, badge fill) and also the interaction signal of the whole app: focus ring, caret, `accent-color`, selected chip and selected wheel border. **Blue Wash** (blue-soft) is the car plate field and the selected-state fill; **Deep Blue Ink** (blue-ink) is text on it.

### Tertiary
- **Faded Amber** (amber), **Amber Wash** (amber-soft), **Burnt Amber Ink** (amber-ink): the motorbike enamel trio.
- **Celadon** (celadon), **Celadon Wash** (celadon-soft), **Bottle Green Ink** (celadon-ink): the motoculture (mower, chainsaw) enamel trio.

### Neutral
- **Pale Zinc** (ground): the app background and the header's frosted fill.
- **Enamel White** (surface): panels, inputs, chips, secondary buttons.
- **Zinc Wash** (surface-2): segmented-control track and hover fill for ghost and icon buttons.
- **Rolled Seam** (line): 1px borders and row dividers.
- **Slate Ink** (ink): primary text and the 2px rule above totals.
- **Slate Grey** (ink-2): secondary text, field labels, idle icons.
- **Worn Grey** (ink-3): placeholders, metadata and drawn line art on Enamel White only.
- **Brick Red** (danger) and **Brick Wash** (danger-soft): destructive text, border and the confirmation panel. Never decorative.

### Named Rules
**The Plates Hold the Colour Rule.** Full enamel colour lives on plates only: vehicle plates, type badges, meter tiles and the tile buttons. Lists, forms and chrome stay zinc, white and slate. The one sanctioned exception is enamel blue at its soft tint as the interaction signal (focus, selection, caret).

**The One Enamel Per Vehicle Rule.** A vehicle's enamel is chosen by its type, never by hand: car is blue, motorbike is amber, motoculture is celadon. Components read the trio through the type scope (`--p`, `--p-soft`, `--p-ink`), so a new surface inherits the right enamel by sitting inside it.

## Typography

**Display Font:** Barlow Condensed (with Barlow, then the system sans), self-hosted at 500, 600 and 700.
**Body Font:** Barlow (with the system sans), self-hosted at 400, 500 and 600.

**Character:** A condensed industrial grotesque for anything stamped (names, titles, figures, totals), set in capitals like plate lettering, beside a plain, sturdy sans for everything you read in sentences.

### Hierarchy
- **Meter** (Condensed 600, 0.95rem / 1.25rem / 1.85rem by size, line-height 1, tabular): the digits inside enamel tiles; the unit trails in capitals at 0.72em.
- **Headline** (Condensed 600, 1.5rem, 1.1, uppercase): the record summary title and the empty-state title.
- **Title** (Condensed 600, 1.45rem, 1.05, 0.02em, uppercase): the vehicle name on its plate.
- **Header title** (Condensed 600, 1.3rem, 0.03em, uppercase): the sticky screen title, truncated with an ellipsis.
- **Section title** (Condensed 600, 1.15rem, 0.04em, uppercase): section heads, always led by a 20px icon. History row titles use the same face at 1.15rem.
- **Body** (Barlow 400, 16px, 1.45): running text and inputs; notes cap at 65ch.
- **Body small** (Barlow 400, 0.82 to 0.9rem): summaries in Slate Grey, metadata in Worn Grey.
- **Label** (Barlow 600, 0.78rem, 0.06em, uppercase, Slate Grey): field labels, each with a 14px icon.

### Named Rules
**The Stamped Capitals Rule.** Names, titles, section heads, totals and meter units are Barlow Condensed 600 in capitals with positive tracking (0.01 to 0.04em). Sentences are never set in capitals.

**The Ledger Rule.** Every amount, quantity and meter reading uses tabular figures and aligns right; totals sit under a 2px Slate Ink rule, label in condensed capitals, figure larger (1.3 to 1.45rem).

## Layout

A single centred column: screens pad 1rem and stack with a 1.1rem gap inside a 40rem maximum; the header and bottom bar align their content to 38rem. Vehicle plates stack with 0.85rem between them. Fields stack label-to-control at 0.35rem; paired fields sit in a two-column grid with a 0.75rem gap; chips wrap at 0.45rem.

Thumb zone first: the main action of a screen lives in a fixed bottom bar (a full-width primary button over a ground-coloured fade) or, on the home screen, a 60px round floating button bottom right. Screens reserve 6rem plus the safe-area inset at the bottom so nothing hides under it. The header is sticky, frosted (ground at 88% with a 14px blur) and respects the top safe area.

Touch targets: buttons and inputs 48px tall, icon buttons 44px, chips 40px.

## Elevation & Depth

Hybrid and shallow. Neutral panels are flat with a 1px seam. Enamel plates carry a soft ambient lift plus their inner rim; only the floating add button and the meter-tile buttons float higher. Depth never comes from colour gradients except the bottom bar's ground fade.

### Shadow Vocabulary
- **Plate** (`box-shadow: 0 1px 2px rgb(31 43 53 / 0.06), 0 8px 18px -12px rgb(31 43 53 / 0.28)`): under every enamel plate, rested on the wall.
- **Float** (`box-shadow: 0 2px 4px rgb(31 43 53 / 0.12), 0 12px 24px -8px rgb(31 43 53 / 0.35)`): the floating add button only.
- **Segment lift** (`box-shadow: 0 1px 2px rgb(31 43 53 / 0.12)`): the selected segment of a segmented control.
- **Focus halo** (`box-shadow: 0 0 0 3px` blue at 22%): focused inputs.

Dark theme swaps both shadows to black at higher opacity (0.3/0.6 and 0.35/0.7).

### Named Rules
**The Double Rim Rule.** Every enamel surface has a rim inside its edge, drawn with inset shadows: plates leave a 3px band of their own wash then a 1px rim of their enamel at 32%; tiles, badges, the primary button and the add button leave 1.5 to 3px of their own fill then a 1px pale rim. No enamel surface ships without it; neutral panels never get it.

## Shapes

Gently rounded and pressed-metal: 8px for chips, segments and small tags; 12px for buttons, inputs, icon buttons, photos and wheel buttons; 16px for plates, panels and the danger confirmation. Type badges and the add button are full circles, like rivets or round plates. Meter tiles round at 0.2em so they scale with the figure. The theme toggle is the only pill. Borders are 1px; dashed hairlines in the plate's enamel divide a plate's own sections.

## Components

### Buttons
Tactile and stamped: they press in (scale 0.97) rather than glow.
- **Shape:** 12px radius, 48px tall, 0.7rem by 1.1rem padding, Barlow 600 at 1rem, icon at 18 to 20px with a 0.5rem gap.
- **Primary:** a Street-Plate Navy tile in Enamel Cream with the double rim; hover lightens the fill 12% toward white.
- **Secondary:** Enamel White with a Rolled Seam border; hover darkens the border to Worn Grey.
- **Ghost:** transparent in Slate Grey; hover fills Zinc Wash.
- **Danger:** transparent, Brick Red text and a 45% Brick Red border; hover fills Brick Wash.
- **Icon button:** 44px square, 12px radius, transparent; hover fills Zinc Wash; press scales to 0.92.
- **Disabled:** 55% opacity, no pointer events.

### Chips
- **Style:** Enamel White, 1px seam, 8px radius, 40px tall, 0.95rem.
- **State:** selected (`aria-pressed`) turns Blue Wash with a Faded Enamel Blue border, Deep Blue Ink text and 600 weight; option chips prepend a check glyph when selected.

### Segmented control
A Zinc Wash track (12px radius, 4px padding) of equal segments; the selected segment lifts to Enamel White with Slate Ink 600 text and the segment-lift shadow. Used for the meter unit (km or hours).

### Cards / Containers
- **Plate:** the vehicle surface. Wash of its type's enamel, 1px enamel border at 50%, 16px radius, the double rim, Plate shadow, 1rem padding (1.1rem on the vehicle page).
- **Panel:** neutral lists and grouped forms. Enamel White, 1px seam, 16px radius, flat; rows divide with 1px seams.

### Inputs / Fields
- **Style:** Enamel White, 1px seam, 12px radius, 48px minimum, 0.65rem by 0.8rem padding, 1rem text; selects draw their own Worn Grey chevron. Amount and quantity inputs align right.
- **Focus:** border turns Faded Enamel Blue with a 3px blue halo at 22%; transition 160ms.
- **Error:** a Brick Red line with an icon under the form, 0.95rem.

### Navigation
A sticky frosted header: back chevron (44px icon button), condensed capital title, optional icon actions on the right. No tab bar. Screen changes use directional View Transitions; the header (`entete`), bottom bar and add button keep their own transition names so they hold still while content slides, and a vehicle plate morphs into the identity plate of the vehicle page.

### Vehicle Type Badge
A 48px enamel disc (56px in the empty state, 38px soft disc in history rows) filled with the type's enamel, its glyph in the wash colour, with the double rim. The glyph is Lucide car-front, motorbike or tractor at stroke 1.75.

### Enamel Meter (signature)
The meter reading set as street-plate figure tiles: one Street-Plate Navy tile per digit (1.05em by 1.45em, 0.2em radius, 1.5px self band then a 1px Faded Sky Rim), digits grouped by thousands with a 0.28em gap between groups and 2px (3px at large) between tiles, the unit trailing in condensed capitals tinted by the plate's ink. Three sizes: 0.95rem on home plates, 1.25rem default, 1.85rem on the vehicle page. Tiles stay navy whatever the vehicle type. It exposes the full reading as one image label.

### Wheel Position Picker (signature)
A top-down vehicle drawn in Worn Grey line art (1.75 stroke), with one 48px wheel button at each corner (front at the top) or front and rear for a motorbike. Each button shows a small tyre outline and a condensed capital label; selected wheels turn Blue Wash with a filled blue tyre. Shortcut chips above (All, Front, Rear, or Both) toggle sets.

### Danger Zone
Destructive actions sit alone at the very bottom, 2.5rem below the content behind a hairline. A full-width ghost button in Brick Red opens a Brick Wash confirmation panel (16px radius) that states what will be lost, with Cancel and Delete side by side.

## Do's and Don'ts

### Do:
- **Do** keep colour on plates: vehicle plates, type badges, meter tiles and tile buttons; everything else stays zinc, white and slate.
- **Do** take a vehicle's enamel from its type scope (car blue, motorbike amber, motoculture celadon), never pick it by hand.
- **Do** give every enamel surface its double inner rim.
- **Do** set the meter as enamel figure tiles wherever a meter reading is the subject.
- **Do** set names, titles, section heads and totals in Barlow Condensed 600 capitals; set sentences in Barlow.
- **Do** align every amount and quantity right in tabular figures, with totals under a 2px Slate Ink rule.
- **Do** put a Lucide glyph beside section titles, field labels, metadata and actions; use Lucide only.
- **Do** keep the main action in the thumb zone: the fixed bottom bar or the floating add button.
- **Do** keep controls at 48px (icon buttons 44px, chips 40px).
- **Do** transition screens with directional View Transitions at 240ms on `cubic-bezier(0.2, 0.8, 0.2, 1)`, and collapse motion under reduced motion.
- **Do** define every colour in both themes; the theme follows the system unless the header toggle forces it.

### Don't:
- **Don't** put an eyebrow or kicker label above a title.
- **Don't** spread enamel colour into lists, forms or chrome, and don't tint a meter tile by vehicle type.
- **Don't** place a destructive action next to a constructive one; isolate it at the bottom behind a confirmation.
- **Don't** mix icon libraries or draw icons as text glyphs or emoji.
- **Don't** use saturated or neon colour; enamels stay faded and soft in both themes.
- **Don't** fall back to a grey iOS list with a single blue accent; vehicles are plates.
- **Don't** set sentences or paragraphs in capitals.
