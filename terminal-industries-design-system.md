# Terminal Industries — Design System & Brand Bible
### Reverse-Engineered Reference Document
*Produced by design analysis. Use as a blueprint for building a visually similar project.*

---

## 0. Site Overview & Product Context

**Company:** Terminal Industries  
**Product:** Terminal Yard Operating System™ (YOS™)  
**Category:** Enterprise B2B SaaS — AI-native logistics / supply chain  
**Built with:** Webflow (confirmed via Rejouice agency footer credit)  
**Design Studio:** Rejouice (rejouice.com) — known for high-craft motion-forward B2B sites  
**Tagline pattern:** Short declarative punches. "Max throughput. Easy-to-use. Rapid ROI."

**Design Positioning:**  
Industrial-tech authority meets startup velocity. Not a legacy enterprise software feel — not a playful consumer feel either. Sits in the *serious-but-modern* register: dark, dense information architecture delivered with editorial confidence. Think SpaceX meets Palantir in terms of visual gravity, but with real human photography and warmer motion.

---

## 1. Brand Identity

### 1.1 Brand Personality

| Axis | Terminal's Position |
|---|---|
| Tone | Authoritative → Confident → Direct |
| Energy | Controlled momentum — not flashy |
| Trust signals | B2B social proof–heavy (logos, stats, named executives) |
| Language register | Operator-facing; jargon-fluent but readable |
| Visual mood | Dark, industrial, precise |

### 1.2 Core Message Architecture

The site operates on a 3-layer message stack:

1. **Category definition** — "We invented the Yard Operating System" (own the category)
2. **Problem agitation** — "35% of the supply chain stalls in the yard"
3. **Proof** — Specific numbers (50%, 85%, 90%, 4x ROI), named logos, named executives

**Headline writing rules extracted from the site:**
- Split across 2–3 stacked lines, each line functioning independently
- Avoid adjectives — use verbs and nouns
- Numbers over adjectives: "85% faster" not "dramatically faster"
- Trademark-branded terms (YOS™, SmartYard™) used consistently to build category ownership

---

## 2. Color System

### 2.1 Core Palette

The palette is reconstructed from visual analysis of the site. Terminal uses a near-black base with a functional green accent and controlled neutrals.

```
--color-bg-primary:       #0A0B0A   /* Near-black, slightly warm — main page background */
--color-bg-secondary:     #111311   /* Elevated surface — card backgrounds, nav */
--color-bg-tertiary:      #1A1D1A   /* Divider-level surfaces, tab panels */
--color-bg-overlay:       #0D0F0D   /* Dark section overlays */

--color-accent-primary:   #4ADE80   /* Terminal Green — primary CTA, key data numbers */
--color-accent-secondary: #22C55E   /* Slightly deeper green — hover states */
--color-accent-subtle:    #16A34A   /* Muted green — borders, outlines on dark */

--color-text-primary:     #F0F4F0   /* Near-white — main headlines, body */
--color-text-secondary:   #9CA39C   /* Muted text — labels, metadata, captions */
--color-text-tertiary:    #5A615A   /* Dimmed — disabled, footnotes */
--color-text-inverted:    #0A0B0A   /* Text on green buttons */

--color-border-default:   #1F251F   /* Subtle dividers */
--color-border-accent:    #2A3A2A   /* Slightly visible borders on cards */
```

### 2.2 Color Roles

| Token | Usage |
|---|---|
| `--color-bg-primary` | Page background, full-width sections |
| `--color-bg-secondary` | Navigation bar, cards, panels |
| `--color-accent-primary` | Primary CTA buttons, key metric numbers, active states |
| `--color-text-primary` | All display headings (H1–H3), body |
| `--color-text-secondary` | Section labels, eyebrows, captions |
| `--color-border-default` | Hairline dividers, table lines |

### 2.3 Color Rules

- **Green is reserved.** Do not use the accent green decoratively. It appears on: (1) primary CTAs, (2) key stat numbers, (3) active nav states, (4) logo treatments for specific partner logos (e.g. Ryder is shown in their brand green).
- **No gradients as decoration.** Any gradient is functional — masking an image edge, creating depth on a video overlay.
- **Background contrast:** All body text passes WCAG AA against the near-black base.
- **Photography desaturated.** Images in non-hero positions are desaturated or have a dark overlay at ~40–60% opacity to keep the palette controlled.

---

## 3. Typography

### 3.1 Type Families

Terminal uses a two-family system with clear hierarchy separation:

**Display / Headlines:**
> **Font:** Likely `Neue Haas Grotesk` or close alternative `Inter` / `DM Sans` at display weights
> **Weight range:** 500 (Medium) → 700 (Bold) → 800 (ExtraBold)
> **Character:** Grotesque sans-serif — engineered, precise, no personality noise

**Body / UI:**
> **Font:** Same family at lower weights, OR a secondary geometric sans
> **Weight range:** 400 (Regular) → 500 (Medium)
> **Character:** Clean, legible at small sizes, system-neutral

*Alternative stack if exact fonts are unavailable:*
```css
--font-display: 'Inter', 'DM Sans', system-ui, sans-serif;
--font-body:    'Inter', system-ui, sans-serif;
```

### 3.2 Type Scale

```css
/* Display — Hero headlines */
--text-display-xl:  clamp(3rem, 6vw, 6rem);        /* ~96px at desktop */
--text-display-lg:  clamp(2.25rem, 4vw, 4rem);     /* ~64px */
--text-display-md:  clamp(1.75rem, 3vw, 2.5rem);   /* ~40px */

/* Headings */
--text-h2:          clamp(1.5rem, 2.5vw, 2rem);    /* ~32px — section titles */
--text-h3:          clamp(1.125rem, 1.8vw, 1.5rem);/* ~24px — card headings */
--text-h4:          1.125rem;                        /* ~18px — sub-labels */

/* Body */
--text-body-lg:     1.125rem;    /* ~18px — lead body */
--text-body-md:     1rem;        /* ~16px — standard body */
--text-body-sm:     0.875rem;    /* ~14px — secondary / captions */
--text-label:       0.75rem;     /* ~12px — metadata, tags */

/* Line heights */
--leading-display:  1.05;   /* Tight — for display headlines */
--leading-heading:  1.2;    /* Section headings */
--leading-body:     1.65;   /* Body text */
--leading-label:    1.4;    /* Small UI labels */

/* Letter spacing */
--tracking-tight:   -0.02em;    /* Large headlines */
--tracking-normal:   0em;
--tracking-wide:     0.08em;    /* Small caps labels */
--tracking-widest:   0.15em;    /* Eyebrow labels */
```

### 3.3 Typographic Patterns

**Section Eyebrows:**
Small-caps or tracked-out labels appear *above* section headlines to orient the reader. Pattern: `[CATEGORY NAME]` in muted text, uppercase, letter-spacing 0.1–0.15em. Examples from the site: `Why Terminal`, `Platform`, `Built by the Industry`.

**Stat Display:**
Large numbers (50%, 85%, 90%) are set at display-xl weight, often in the green accent, with a smaller body-md label beneath or beside. The number is the hero — the label is subordinate.

**Numbered Items:**
Step/process items use `01 02 03` prefixes in a muted accent, lighter weight, smaller size than the heading. This is a legitimate sequence (gate → yard → dock is truly ordered), so numbering is earned.

**CTA Button Copy:**
ALL CAPS, tracked out. Example: `REQUEST DEMO`, `EXPLORE PRODUCT`, `CONTACT US`. This is intentional — it gives the nav CTAs a distinct register from headline copy.

---

## 4. Layout & Spacing System

### 4.1 Grid

```css
/* Container */
--container-max:     1440px;
--container-content: 1280px;    /* Primary content max-width */
--container-narrow:  800px;     /* Text-heavy sections */
--container-padding: clamp(1.5rem, 5vw, 5rem);   /* Horizontal padding */

/* Grid columns */
--grid-cols-12: repeat(12, 1fr);
--grid-gap:     clamp(1rem, 2vw, 1.5rem);
```

**Column usage patterns:**
- Hero: Full 12 columns, content left-aligned or center-aligned
- Feature cards: 4-col each (3-up) → stacks to 1-col mobile
- Two-column split (text + media): 5/7 or 6/6 splits
- Stat rows: 4 stats in a row, each 3 columns

### 4.2 Spacing Scale

```css
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
--space-24:  6rem;      /* 96px */
--space-32:  8rem;      /* 128px */

/* Section vertical padding */
--section-py-sm:   clamp(3rem, 6vw, 5rem);
--section-py-md:   clamp(5rem, 8vw, 8rem);
--section-py-lg:   clamp(7rem, 12vw, 12rem);   /* Hero sections */
```

### 4.3 Layout Principles

1. **Left-align by default.** The site is not center-aligned everywhere — body text, section labels, and most headlines are left-aligned. Center alignment is reserved for short punchy statements and CTAs.
2. **Asymmetry creates tension.** Large-type headlines break out of the column grid intentionally — type spills, overlaps, or bleeds to create compositional energy.
3. **Whitespace is aggressive.** Sections breathe. The near-black background only works if there's enough air — don't pack it tight.
4. **Full-width video/image breaks.** Between text sections, full-bleed media (video backgrounds, photography) act as visual resets, preventing the page from reading as a wall of text.

---

## 5. Component Library

### 5.1 Navigation

**Structure:**
- Fixed top bar, full-width
- Background: `--color-bg-secondary` with subtle bottom border
- Logo: left-aligned, minimal wordmark
- Nav links: center or left cluster, dropdown-heavy (mega menus on System / Markets)
- CTAs: right-aligned, 3 buttons: `EXPLORE PRODUCT` (outlined/ghost), `REQUEST DEMO` (ghost), `CONTACT US` (filled green)

**Nav CTA hierarchy:**
```
[EXPLORE PRODUCT]  [REQUEST DEMO]  [CONTACT US ▶]
   ghost/border      ghost/border     green fill
```

**Mega menu:**
- Drops as a full-width panel
- Content organized in columns with section labels
- Links have short descriptive labels
- No hover animations beyond opacity fade

### 5.2 Hero Section

**Pattern:** Full-viewport-height dark section with large multi-line headline

```
[eyebrow label — muted, tracked]
[3-line headline — display-xl, white, tight leading]
[subtitle — body-lg, --text-secondary]
[CTA cluster — primary green + secondary ghost]
```

**Key behaviors:**
- Headline often uses a word or phrase that animates in (fade or slide from below, once)
- Background may have subtle video loop or static photography at low opacity
- Logo bar follows immediately below hero: "Powering the yards behind the brands you know" + scrolling logos

### 5.3 Logo/Client Bar

**Design:** Horizontal scroll strip or static grid of partner logos
- Logos rendered in monochrome white or low-opacity white
- Exceptions: some partner brand logos shown in original brand colors (Ryder green)
- Label above: eyebrow copy "Powering the yards behind the brands you know"
- No borders, cards, or backgrounds — logos float on the dark base

### 5.4 Feature Cards (the "Fix one yard problem" section)

**Pattern:** Numbered sequence cards, each with:
```
[01 — eyebrow number in muted green/grey]
[Headline — H3 weight]
[Body paragraph — body-md]
[Photography — real site photography, darkened]
[CTA link — underline or arrow link]
```

**Card structure:**
- Dark card background `--color-bg-secondary`
- Thin border `--color-border-accent`
- No border-radius beyond ~4–6px (minimal rounding — industrial feel)
- Photo fills bottom of card, not a thumbnail — it's a design element

### 5.5 Stat/Metric Display

**Pattern for key metrics:**
```
[Large number — display-lg, --color-accent-primary]
[Metric label — body-sm, --text-secondary]
```

Numbers shown: 50%, 85%, 90%, 4x, 5 days, 99%, 4x ROI

**Stat rows:** 4-across grid, dividers between stats (thin vertical lines or spacing)

### 5.6 Tabbed Platform Section

**The "AT THE GATE / IN THE YARD / AT THE DOCK / ACROSS OPERATIONS" section:**

- Horizontal pill/tab navigation at top
- Active tab: filled or underlined in green accent
- Content panel below: image left + text right (or vice versa)
- Transition: crossfade or slide between panels
- Tab labels: all-caps, tracked

### 5.7 Calculator / Interactive Widget

**The "What's your yard costing you?" section:**
- Dark panel, full-width
- Form inputs: labeled sliders or number inputs
- Live output displayed prominently: `$ 641,626` in large green type
- Breakdown table beneath the total
- Email capture form at end
- Pattern: **interactive tool as lead gen** — replaces a simple CTA

### 5.8 Testimonial Block

**Single large quote:**
```
[Large background photography — full bleed, dark overlay]
[Quote in display-md, white, italic or serif pull-quote style]
[Attribution: Name, Title, Company — small, muted]
```

### 5.9 FAQ Section

**Accordion pattern:**
- Clean question list
- Expand/collapse with icon (+ or ▼)
- Organized into categories: `Core Technology`, `Value`, `Implementation`, `Site Operations`
- Category labels act as section dividers

### 5.10 Contact / CTA Final Section

**Pattern:**
```
[Large headline — display-lg]
[Subtext list — 3 bullet options: 30-min demo, needs call, ROI assessment]
[Form — full-width inputs, minimal styling]
[Trust bar — logo stripe image]
```

---

## 6. Button System

### 6.1 Button Variants

```css
/* Primary — Green fill */
.btn-primary {
  background:       var(--color-accent-primary);
  color:            var(--color-text-inverted);
  padding:          0.75rem 1.75rem;
  font-weight:      600;
  font-size:        0.875rem;
  letter-spacing:   0.08em;
  text-transform:   uppercase;
  border-radius:    4px;
  border:           none;
  transition:       background 0.2s ease;
}
.btn-primary:hover {
  background: var(--color-accent-secondary);
}

/* Secondary — Ghost/outlined */
.btn-secondary {
  background:       transparent;
  color:            var(--color-text-primary);
  border:           1px solid var(--color-border-accent);
  padding:          0.75rem 1.75rem;
  font-weight:      500;
  font-size:        0.875rem;
  letter-spacing:   0.08em;
  text-transform:   uppercase;
  border-radius:    4px;
  transition:       border-color 0.2s ease, color 0.2s ease;
}
.btn-secondary:hover {
  border-color: var(--color-text-secondary);
}

/* Text link with arrow */
.btn-text {
  color:            var(--color-text-secondary);
  text-decoration:  none;
  font-weight:      500;
  font-size:        0.875rem;
  letter-spacing:   0.05em;
  text-transform:   uppercase;
  display:          inline-flex;
  align-items:      center;
  gap:              0.5rem;
}
.btn-text::after {
  content: '→';
  transition: transform 0.2s ease;
}
.btn-text:hover::after {
  transform: translateX(4px);
}
```

### 6.2 Button Rules

- Primary green CTA is used sparingly — 1 per major section, maximum
- Nav has 3 CTAs but they are differentiated by fill level
- All button labels in UPPERCASE with tracked spacing
- No button shadows — flat on dark backgrounds
- Border-radius: very small (2–6px) — industrial, not rounded-pill style

---

## 7. Motion & Animation

### 7.1 Motion Philosophy

> **"Controlled momentum"** — Motion communicates confidence, not energy.

Terminal uses motion functionally, not decoratively. Key principles:

1. **One signature entrance per section** — Elements animate in once when the section enters viewport, then stay. No looping animations.
2. **Counter/number animations** — The big stat numbers count up when they enter the viewport (0 → 85%). This is the most impactful motion on the page.
3. **Video loops** — Short background videos (product UI demos) play muted and looped. They function as living photography, not explainers.
4. **Tab transitions** — Content panels crossfade on tab change. ~300ms ease-in-out.

### 7.2 Motion Values

```css
/* Timing */
--duration-instant:  100ms;
--duration-fast:     200ms;
--duration-base:     300ms;
--duration-slow:     500ms;
--duration-entrance: 800ms;

/* Easing */
--ease-out:          cubic-bezier(0.0, 0.0, 0.2, 1);   /* UI transitions */
--ease-in-out:       cubic-bezier(0.4, 0.0, 0.2, 1);   /* Panel switches */
--ease-entrance:     cubic-bezier(0.16, 1, 0.3, 1);    /* Elements entering viewport */

/* Scroll-triggered entrance (standard) */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Used sparingly — one element per section, not every element */
```

### 7.3 What NOT to Animate

- Do not animate every card on hover (only interactive elements respond to hover)
- Do not chain entrances across many elements in the same section (pick 1 focal element)
- Do not use bounce or elastic easing — too playful for this brand register
- Respect `prefers-reduced-motion`

---

## 8. Photography & Imagery

### 8.1 Photography Style

**Primary photography style:** Real industrial environments — actual yards, gates, docks, trucks. Not stock-feeling staged shots.

**Treatment rules:**
- Dark overlay on most images (40–60% black overlay) to maintain palette control
- Some images desaturated to B&W or near-B&W — especially partner/customer logos
- Full-bleed use preferred over thumbnails
- Aspect ratios: 16:9 for wide feature images, square or 4:5 for cards

**What to avoid:**
- Happy smiling office workers (enterprise cliché)
- Pure abstract renders or illustration — the site uses real photography
- Color-saturated photography — it fights the dark palette

### 8.2 Video

**Usage:** Product UI screen recordings and real yard footage, muted, looped, used as section backgrounds or inline media panels.

**Compression:** `.mp4` / `.webp` video, highly compressed (see Storyblok CDN URLs with quality filters).

---

## 9. Iconography

The site uses minimal iconography. What exists:
- Social icons (LinkedIn, X, YouTube) in footer — simple outline or filled SVG
- Gartner badge — third-party trust mark
- Navigation arrows (→) used as text links, not icon buttons
- No icon sets for features — features are communicated via photography and copy, not icons

**Rule:** Icons are used for navigation and brand marks only. Product features do not have decorative icons.

---

## 10. Data Display

### 10.1 Metric Blocks

```
[Large number]    [Large number]    [Large number]    [Large number]
50%               85%               90%               4x+
Throughput        Gate Speed        Asset Search      ROI
increase          reduction         reduction         
```

- Numbers: display-lg, --color-accent-primary (green)
- Label line 1: body-sm, --text-primary
- Label line 2: body-sm, --text-secondary
- Separated by thin vertical dividers on desktop; stack 2×2 on tablet, 1-col mobile

### 10.2 Calculator Output

```
$ [large number]        /* display-lg, green */
Est. Savings: 23%       /* body-md, muted */

[Category breakdown as labeled rows with dollar amounts]
```

---

## 11. Page Section Anatomy

### 11.1 Section Structure Pattern

Every major section follows a consistent anatomy:

```
┌──────────────────────────────────────────────────────────────────────┐
│  [EYEBROW — small caps, muted, left-aligned]                         │
│                                                                      │
│  [SECTION HEADLINE — display-md or display-lg, 2–3 lines max]        │
│  [SECTION SUBHEAD — body-lg, --text-secondary, narrower column]      │
│                                                                      │
│  [PRIMARY CONTENT AREA — cards / grid / media + text]                │
│                                                                      │
│  [OPTIONAL SECTION CTA — text link or ghost button]                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 11.2 Page Scroll Order (Homepage)

1. **Nav** — Fixed
2. **Hero** — Full viewport, 3-part headline, CTA cluster
3. **Logo Bar** — Partner logos, scrolling
4. **Problem-Solution Tabs** — "Fix one yard problem today"
5. **Interactive Calculator** — ROI tool (lead capture)
6. **Why Terminal** — Stat metrics + video background
7. **Platform Modules** — Tabbed: Gate / Yard / Dock / Across Operations
8. **Investor/Built By Bar** — 8VC, Ryder, Lineage, Prologis, NFI logos
9. **Testimonial** — Full-bleed photo + quote
10. **Contact Form** — Final CTA
11. **FAQ Accordion**
12. **Final CTA Banner** — "The yard of the future starts today"
13. **Footer**

---

## 12. Footer

### 12.1 Structure

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]                                                      │
│                                                              │
│  Technology        Company         Reach Us                  │
│  • Homepage        • About         Ready for your yard?      │
│  • YOS™            • Resources     +1 (737) 279-5032        │
│  • Agentic AI Yard • Contact       [social icons]            │
│  • Calculator                                                │
│                                                              │
│  Copyright Terminal Industries © 2025 · Technical Index      │
│                                [Rejouice credit]             │
└──────────────────────────────────────────────────────────────┘
```

**Footer visual rules:**
- Dark background matching page bg
- Fine divider line at top
- 3-column or 4-column link grid, no cards
- Social icons: simple SVG, muted color, hover to white

---

## 13. Content Strategy Patterns

### 13.1 Headline Formulas

**Pattern 1 — The reinvention declaration:**
> "We have reinvented the future of logistics through the yard."

**Pattern 2 — The problem → solution pivot:**
> "Fix one yard problem today. Expand on your timetable."

**Pattern 3 — The capability + benefit:**
> "AI-native technology that turns the space between your gate and your dock... into one connected, automated system."

**Pattern 4 — Direct challenge:**
> "What's your yard costing you?"

### 13.2 CTA Copy Formulas

- `EXPLORE PRODUCT` — Discovery (low commitment)
- `REQUEST DEMO` — Evaluation (medium commitment)
- `CONTACT US` — Conversion (high commitment)
- `FIX NOW` / `LEARN MORE` / `ONE SYSTEM FOR ALL` — Section-level CTAs matching the context

### 13.3 Social Proof Formats

1. **Named quote + photo + name/title/company** — most powerful, used once
2. **Logo bar** — many logos, low specificity, high breadth signal
3. **Stat citation** — "99% accuracy in Ryder pilot" — specific and linkable
4. **Gartner badge** — third-party validation
5. **Investor logos** — "Built by logistics leaders" (8VC, Ryder, Lineage) — uniquely combines investor + customer social proof

---

## 14. Voice & Tone Reference

### 14.1 Voice Characteristics

| Do | Don't |
|---|---|
| "Max throughput. Easy-to-use. Rapid ROI." | "We help companies optimize their logistics workflows." |
| "The yard of the future starts today." | "Start your digital transformation journey." |
| "Fix one problem in the yard" | "Comprehensive solutions for your entire operation" |
| Specific numbers: 85%, 50%, 4x, 5 days | Vague: "significantly faster", "dramatically improves" |
| Named customers: Ryder, HP, Coca-Cola | Anonymous "leading Fortune 500 company" |

### 14.2 Terminology

- Platform is called **YOS™** or **Terminal Yard Operating System™** — always trademarked on first use
- AI capability is **computer vision** — specific, not generic "AI"
- Differentiator language: **"AI-native"** (not "AI-powered" — native implies architecture-level, not layer-on-top)
- Competitor framing: "digital clipboard" (YMS) vs "operating system" (Terminal)

---

## 15. Technical Implementation Notes

### 15.1 Platform

- **Built on Webflow** — confirmed via Rejouice credit link
- **CMS:** Storyblok (image URLs: `a.storyblok.com/f/337048/...`)
- **Image format:** `.webp` and `.svg` primarily; quality filter applied via CDN (`filters:quality(85)`)

### 15.2 Performance Patterns

- Images served via CDN with explicit quality compression
- Video files served from Storyblok CDN as `.mp4`
- SVG logos used wherever possible (scalable, small file size)
- Lazy loading implied (images load on scroll)

### 15.3 Responsive Breakpoints (inferred)

```css
--bp-sm:   640px;    /* Mobile landscape */
--bp-md:   768px;    /* Tablet portrait */
--bp-lg:   1024px;   /* Tablet landscape / small laptop */
--bp-xl:   1280px;   /* Desktop */
--bp-2xl:  1536px;   /* Wide desktop */
```

---

## 16. Design System Principles Summary

These 8 principles distill the design intent of Terminal Industries and should govern any project replicating this system:

### P1 — Dark as default, not default dark
The dark palette is a deliberate industrial statement, not a "dark mode." It communicates serious infrastructure software. Every color decision defends against the dark feeling "gloomy" — spacing, contrast, and green accents keep energy alive.

### P2 — One accent, used with discipline
Green does one job: marking what matters. A metric number, a primary action, an active state. When overused, it loses authority.

### P3 — Type IS the layout
Headlines are oversized, multi-line, and treated as visual blocks. The type's negative space and rhythm drive section composition more than grid lines.

### P4 — Photography anchors credibility
Real places, real machines, real people (when shown). Abstract renders feel like vaporware. Industrial photography signals "this actually works."

### P5 — Numbers over claims
Every benefit is quantified. "85% reduction" is a design element, not just copy. Numbers are displayed at display size, in accent color, because they are the most persuasive thing on the page.

### P6 — Motion is a reveal, not a decoration
The only things that move are: counters, section entrances (once), video backgrounds, and tab transitions. Nothing pulses, loops, or jitters.

### P7 — Hierarchy through restraint
Most elements are `--text-secondary` muted. Only a few things per section earn `--text-primary` white. This creates natural reading paths without needing arrows or callout boxes.

### P8 — Trust through specificity
Social proof works because it's specific: named executives, named companies, specific metrics from real pilots. Vague logos without attribution are weak. Name the person, name the company, cite the number.

---

*Document produced via design reverse-engineering of terminal-industries.com. For internal design reference use only.*
