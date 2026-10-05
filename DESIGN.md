# Design Brief

## Direction

Hijau Pesantren — a grounded, scholarly green-and-gold system for a mobile-first Indonesian study-circle attendance module.

## Tone

Refined and communal — the calm authority of a well-kept ledger, not a corporate dashboard; green carries trust, gold marks what matters.

## Differentiation

A thin gold "seal" line and gold date chips act as the signature accent against deep forest green, so attendance feels like a record worth keeping.

## Color Palette

| Token      | OKLCH        | Role                                  |
| ---------- | ------------ | ------------------------------------- |
| background | 0.975 0.008 120 | Soft cream-green page field       |
| foreground | 0.22 0.025 155  | Charcoal-green text               |
| card       | 1.0 0.004 120   | Elevated white session cards      |
| primary    | 0.42 0.105 152  | Deep forest green — actions, headers |
| accent     | 0.72 0.135 78   | Warm gold — dates, seals, highlights |
| muted      | 0.945 0.012 130 | Quiet fills, inactive tabs        |

## Typography

- Display: Space Grotesk — page titles, session names, big counts
- Body: Plus Jakarta Sans — labels, body copy, buttons (excellent at small mobile sizes)
- Mono: Geist Mono — attendance tallies via `tabular-nums`
- Scale: hero `text-3xl font-bold tracking-tight`, h2 `text-xl font-semibold`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm`

## Elevation & Depth

Flat cream page with white cards lifted by a single soft green-tinted `shadow-elevated`; depth comes from layered surfaces, never from glow.

## Structural Zones

| Zone    | Background          | Border              | Notes                                  |
| ------- | ------------------- | ------------------- | -------------------------------------- |
| Header  | `bg-gradient-primary` | none (rounded-b-2xl) | Deep green with a gold hairline seal under the title |
| Content | `bg-background`     | —                   | Alternating `bg-muted/40` section bands |
| Footer  | `bg-card`           | `border-t`          | Bottom tab bar; active tab = green pill |

## Spacing & Rhythm

Mobile-first: 16px page gutters, 12px card padding, 8px micro-gaps; sections separated by 24px, with generous 44px+ touch targets.

## Component Patterns

- Buttons: `rounded-lg`, deep green fill, gold ring on focus, subtle lift on press
- Cards: `rounded-2xl` white, `shadow-elevated`, 12px padding, gold date chip top-right
- Badges: full pills — green Hadir, gold Izin, red Alpa; uppercase 11px labels

## Motion

- Entrance: `animate-fade-up` staggered 40ms across session cards
- Hover: `transition-smooth` color/shadow shift, no bounce
- Decorative: `animate-gold-sweep` on the header seal only

## Constraints

- Bahasa Indonesia throughout; mobile-first layout
- Green + gold only — no blue, no purple, no full-page gradients
- Do not touch Keuangan or Program Kerja modules
- Peserta store name and kelompok only — no other personal data

## Signature Detail

A 2px gold seal line under the green header title, echoing a stamped ledger mark — the one flourish the rest of the UI stays quiet around.
