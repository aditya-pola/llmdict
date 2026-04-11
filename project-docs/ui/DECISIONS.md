# UI/UX Decisions

Tracking all decisions about the glossary's browsable interface.

---

## Decisions Made

### Layout: Horizontal Card Carousel ("The Cabinet")
- A single horizontal row of cards, centered on screen, not full-width
- Cards are roughly square, comfortable to read
- Scroll left/right to browse — smooth scroll transitions
- Cards pop in with subtle animation as they enter the viewport
- Breathing room on sides — the row does not fill the screen edge-to-edge

### Card Hierarchy: Home → Categories → Terms
- **First card**: Home card listing all categories (Quantization, Attention, etc.)
- **Category cards**: List their terms as clickable links
- **Term cards**: The actual glossary entries
- Row order: [Home] → [Category: Quantization] → [fp32] → [fp16] → ... → [Category: Attention] → [MHA] → ...
- Categories and terms interleaved in logical reading order

### Card Content: "Walk Away" + Expandable Depth
- **Default card face**: Name (bold), expansion, explanation — the definition you can walk away with
- Explanation includes **inline linked terms** (clickable, scrolls carousel to that card)
- **Click to expand**: Opens an overlay on top of the carousel showing deeper content:
  - Fundamentals / mechanics
  - Related terms (clickable)
  - Foundational papers + resource links

### Navigation: Scroll + Click Links
- Clicking any linked term (in card text or expanded overlay) scrolls the carousel to that term's card
- No sidebar, no top nav — the cards ARE the navigation
- Search: TBD (likely a search bar above the carousel)

### History Reel
- Small horizontal strip underneath the carousel
- Shows visited cards (thumbnails or labels)
- Clickable to jump back to any previously visited card

### Graph View
- Separate page/view showing all 141 entries as a node graph
- Black & white aesthetic matching the main UI
- Hovering a node pops up that term's card
- Simplest implementation that works (static force-directed or similar)

### Visual Design Language (minimalist-reference-inspired)
- **Background**: Black (#000)
- **Text**: White (#fff), reduced opacity for secondary text
- **Cards**: Dark surface with subtle shadow, border-radius ~16px
- **Typography**: Modern sans-serif (Inter or similar), tight negative letter-spacing, bold headings
- **Animations**: Subtle spring/ease pop-in on scroll, smooth scroll to linked cards, scale feedback on click
- **Overall**: Minimal, stark black & white, no gray middle ground, motion-forward

### Technology
- Static HTML/CSS/JS — deployable on GitHub Pages
- JSON data files as single source of truth
- No build step required (or minimal)
- Good file abstractions — separate files for data loading, card rendering, carousel logic, graph view, etc.

---

## Still To Discuss
- Search UX (Cmd+K overlay? Inline above carousel?)
- Graph view technology (d3.js? Canvas? Simple SVG?)
- Mobile responsiveness (single-column vertical on narrow screens?)
- Card sizing specifics (exact px, responsive behavior)
