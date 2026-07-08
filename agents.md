# AI Agent Instructions

## Project
This is a modern AI-powered technology transfer dashboard.

## Working Style
- Always explain the plan before editing files.
- Make small, reviewable changes.
- Do not rewrite the entire app unless explicitly asked.
- Prefer clean, readable code over clever code.
- Use sample data before adding a real backend.
- Ask before installing new packages.

## Tech Stack
- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components (custom, no CLI dependency)
- Lucide icons
- Recharts

## Design Tokens
- Page background: `bg-gray-50`
- Card/surface: `bg-white` with `border-gray-200`
- Primary accent: `blue-50` / `blue-600` / `blue-700`
- Text hierarchy: `text-gray-900` (headings), `text-gray-500` (secondary), `text-gray-400` (muted)
- Sidebar: fixed w-64, white, `border-r border-gray-200`
- Header: sticky, white, `border-b border-gray-200`
- Positive trend: `green-50` / `green-700`
- Negative trend: `red-50` / `red-700`
- Status badges: rounded-full, colored bg/text per status

## Conventions
- Components in `src/components/`, pages in `src/app/`
- Data layer in `src/lib/data.ts`
- Utility components in `src/components/ui/`
- Use `"use client"` for interactive components
- TypeScript interfaces co-located with data
- No authentication, no database, no paid APIs
