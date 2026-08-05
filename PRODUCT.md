# PRODUCT.md — PadelRush

## Audience
- **Primary:** Organizadores y jugadores de ligas de pádel (amateur y semi-profesional) en habla hispana (LATAM + España).
- **Secondary:** Clubes y gestores de torneos que necesitan centralizar resultados, rankings y administración.

## Brand / Product Lane
- **Product (app UI):** dashboard de gestión de ligas, partidos, resultados, rankings y auth.
- **Tone:** deportivo, energético, claro. Confiable pero moderno.

## Voice
- Directo, en español, sin jerga innecesaria.
- Microcopies cortas: "Bienvenido de nuevo", "Crea tu cuenta".

## Anti-references (qué NO imitar)
- No usar Inter / Geist / Roboto / Space Grotesk / Plus Jakarta / Fraunces.
- No degradados de texto (gradient-text).
- No bordes gruesos de color en un solo lado de tarjetas (side-tab).
- No gris sobre fondos de color.

## Colors (tokens existentes en el proyecto)
- `--court` (verde cancha pádel) — color de marca principal.
- `--ball` (amarillo pelota).
- `--ship` (rojo, para errores/alertas).
- `--develop-blue`, `--preview-pink` (accentos).
- Modo: actualmente claro en `index.css`, pero componentes usan tokens dark (`bg-card`, `text-foreground`). Unificar hacia un sistema dark/neo-brutalista consistente.

## Type
- **Display/Headings:** Bricolage Grotesque (carácter fuerte, personalidad).
- **Body/UI:** Sora (legible, moderna, no genérica).

## Components
- `.vercel-card` (tarjeta con borde sutil 1px).
- `.pill` (badge uppercase).
- `.btn` / `.btn-primary` / `.btn-ghost`.
- `card-highlight` (tarjeta de liga con acento izquierdo sutil).
