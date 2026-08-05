# DESIGN.md — PadelRush Design System

Design language for PadelRush. Built with Impeccable. Goal: taste, not templates.

## Principles
1. **Dark / neo-brutalist base** — superficies con borde 1px sutil, no sombras difusas gigantes.
2. **Una fuente display con carácter** (Bricolage Grotesque) para headings; Sora para cuerpo.
3. **Color de marca = cancha** (`--court` verde) + acentos tenues. Nunca gris sobre color.
4. **Acentos laterales sutiles** (1px, opacidad 0.4) — nunca 3-4px de color sólido.
5. **Texto sólido** — nunca gradient-text en headings.

## Typography
| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / H1-H6 | Bricolage Grotesque | 600-700 | tracking -0.02em |
| Body / UI | Sora | 300-500 | 16px base, line-height 1.56 |
| Mono / Pill | Sora (fallback monospace) | 500 | uppercase, letter-spacing 0.02em |

## Color tokens
| Token | Value | Use |
|-------|-------|-----|
| `--court` | hsl verde cancha | marca, acentos, iconos |
| `--ball` | amarillo pelota | acentos secundarios, glows |
| `--ship` | rojo | errores, alertas (borde-l-2 en banners) |
| `--develop-blue` | azul | acento dev |
| `--preview-pink` | rosa | acento preview |

## Components
- **vercel-card**: bg blanco, borde 1px rgba(0,0,0,0.08), radius 8px. Hover: borde + sombra ligera.
- **pill**: inline-flex, height 24px, bg `#ebf5ff`, color `#0068d6`, radius 9999px, uppercase.
- **btn**: height 40px, radius 6px. `.btn-primary` bg `#171717` / `.btn-ghost` transparent.
- **card-highlight** (LeagueCard): borde-left 1px `hsl(--court / 0.4)`, no 3px sólido.

## Anti-patterns (enforced by Impeccable detector)
- [x] overused-font (Geist) — FIXED → Bricolage Grotesque + Sora
- [x] gradient-text — FIXED → text-foreground sólido
- [x] side-tab — FIXED → bordes 1-2px sutiles

## Live mode
- `npx impeccable live` para iterar variantes en browser.
