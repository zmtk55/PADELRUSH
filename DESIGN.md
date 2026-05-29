# PadelRush Design System

> Fusion of Shadcn/ui + Vercel aesthetics
> Dark-first, minimal, precision-engineered for sports tournament UX

## 1. Design Philosophy

PadelRush combines **shadcn/ui's utility-first minimalism** with **Vercel's precision-engineered restraint**. The result is a dark-first interface that feels like a developer tool but serves sports tournaments — clean, fast, and authoritative.

- **Dark by default** with optional light mode
- **Orange primary** (#ff6b35) as the energetic sports accent — the only "warm" color
- **Shadow-as-border** technique from Vercel: borders are 1px shadow rings, not CSS borders
- **Three-weight typography**: 400 (body), 500 (UI/interactive), 600 (headings/emphasis)
- **Geist** font family for headings and body; **JetBrains Mono** for scores and tabular data

## 2. Color Palette

### Surface & Background (Dark)
| Token | Value | Usage |
|-------|-------|-------|
| --background | hsl(220, 25%, 8%) | Page background, #0f1117 |
| --card | hsl(220, 22%, 12%) | Card surfaces |
| --card-hover | hsl(220, 22%, 15%) | Card hover state |
| --sidebar | hsl(220, 22%, 9%) | Sidebar background |
| --border | hsl(220, 16%, 20%) | Traditional border fallback |

### Surface & Background (Light)
| Token | Value | Usage |
|-------|-------|-------|
| --background | hsl(0, 0%, 98%) | Page background |
| --card | hsl(0, 0%, 100%) | Card surfaces |
| --sidebar | hsl(220, 20%, 97%) | Sidebar background |

### Primary (Sports Energy)
| Token | Value | Usage |
|-------|-------|-------|
| --primary | hsl(14, 100%, 58%) | CTAs, active states, links |
| --primary-light | hsl(14, 100%, 68%) | Hover states |
| --primary-dark | hsl(14, 90%, 45%) | Active/pressed |

### Accent (Vercel Workflow Colors)
| Token | Value | Usage |
|-------|-------|-------|
| --accent | hsl(180, 80%, 42%) | Secondary accent (teal) |
| --success | hsl(142, 70%, 50%) | Wins, confirmations |
| --warning | hsl(35, 92%, 55%) | Pending, cautions |
| --destructive | hsl(0, 84%, 60%) | Errors, eliminations |

### Shadow System (Vercel-inspired)
```css
--shadow-border: 0px 0px 0px 1px rgba(255,255,255,0.06);
--shadow-card: 0px 0px 0px 1px rgba(255,255,255,0.06), 0px 2px 2px rgba(0,0,0,0.2);
--shadow-elevated: 0px 0px 0px 1px rgba(255,255,255,0.08), 0px 2px 2px rgba(0,0,0,0.2), 0px 8px 8px -8px rgba(0,0,0,0.3);
--shadow-focus: 0px 0px 0px 2px hsla(14, 100%, 58%, 0.5);
```

## 3. Typography

### Font Families
- **Primary**: Geist, system-ui, -apple-system, sans-serif
- **Display (Headings)**: Geist, system-ui, sans-serif
- **Monospace (Scores/Data)**: JetBrains Mono, Fira Code, monospace

### Scale & Weights
| Role | Font | Size | Weight | Letter-spacing |
|------|------|------|--------|----------------|
| Page Title | Geist | 28px | 600 | -0.5px |
| Section Heading | Geist | 20px | 600 | -0.3px |
| Card Title | Geist | 16px | 600 | -0.2px |
| Body | Geist | 14px | 400 | normal |
| Body Small | Geist | 13px | 400 | normal |
| Caption | Geist | 12px | 500 | normal |
| Score | JetBrains Mono | 18px | 700 | 0.05em |
| Score Small | JetBrains Mono | 14px | 600 | 0.03em |
| Badge | Geist | 11px | 600 | 0.02em |

## 4. Spacing & Layout

- **Base unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- **Card padding**: 16px (standard), 20px (featured)
- **Section gap**: 24px (standard), 32px (featured)
- **Border radius**: 8px (cards), 6px (buttons/inputs), 4px (small elements), 9999px (badges)

## 5. Component Rules

### Cards
- Background: hsl(var(--card))
- Border: `box-shadow: var(--shadow-card)` — no CSS border
- Radius: 8px
- Padding: 16px
- Hover: `box-shadow: var(--shadow-elevated)`

### Buttons
- **Primary**: bg-primary, white text, 6px radius, 8px 16px padding
- **Secondary**: transparent, shadow-border, 6px radius
- **Ghost**: transparent, no border, hover with muted background
- **Pill Badge**: 9999px radius, 4px 10px padding, 11px weight 600

### Inputs
- Background: hsl(var(--muted))
- Border: shadow-border technique
- Focus: 2px solid hsl(var(--ring)) with focus shadow
- Radius: 6px

### Navigation (Sidebar)
- 3px active indicator (left border)
- 14px weight 500 for nav links
- Muted foreground for inactive, primary for active
- Hover: background shift

### Avatars
- 28px (small), 36px (medium), 44px (large)
- Rounded-full
- background: muted-foreground/20 for placeholder
- Score/seed number overlay for bracket views

## 6. Motion & Interaction

- **Duration**: 150ms (micro), 200ms (standard), 300ms (page)
- **Easing**: cubic-bezier(0.16, 1, 0.3, 1) — Vercel-style spring
- **Hover**: subtle lift via shadow transition
- **Focus**: ring with primary color
- **Page transitions**: fade + subtle slide (Y: 4px)

## 7. Anti-patterns

- No gradient backgrounds on cards (flat only)
- No decorative shadows beyond the shadow-border system
- No bold (700) on body text — 600 is max, for headings only
- No positive letter-spacing on Geist — negative or zero only
- No traditional CSS `border` property on cards — use shadow-border
- No warm accent colors beyond the orange primary
