# AGENTS.md

## Project purpose
PadelRush is a React + Vite + Supabase application for managing padel leagues. It provides CRUD operations for leagues, teams (parejas), matches, participants, and player stats with a professional dark/light UI using shadcn/ui.

## Stack
- React 18 + Vite 6 + Tailwind 3 + shadcn/ui
- Supabase (PostgreSQL + Auth)
- framer-motion, recharts, sonner, lucide-react
- @tanstack/react-query, @supabase/supabase-js

## Common commands
- `npm run dev` — Start dev server
- `npm run build` — Production build

## Project structure
```
src/
├── lib/          # supabaseClient, query-client, ThemeContext, utils
├── hooks/        # useAuth, useLeagues, useParticipants, useTeams, useMatches, usePlayerStats
├── components/
│   ├── ui/       # button, input, select, dialog, badge, label
│   ├── layout/   # Sidebar, MobileNav, PageHeader
│   ├── leagues/  # LeagueSetupWizard, PlayerPickerPanel, ScheduleBuilder
│   └── teams/    # TeamStatsModal
├── pages/        # Dashboard, Leagues, LeagueDetail, Teams, Matches, Participants, Profile
├── App.jsx       # Router + auth gate + layout
├── main.jsx      # Entry point
└── index.css     # Design system tokens (Claude de OD)
supabase/
└── migration.sql # Full schema (6 tables + RLS + triggers)
```

## Database
6 tables: profiles, leagues, participants, teams, matches, player_stats
- Supabase project: xmpsqjhywmwdekuhudtt
- RLS: public read, admin/organizer write

## Auth
- Email/password via Supabase Auth
- Profiles created automatically via trigger on auth.users.insert
- Roles: admin, organizer, player
