# Agent Instructions

When working on web project, first read `<Project_Root>.docs/Web_Conventions.md` — it defines the Modular Monolith + FSD architecture rules enforced by ESLint, TypeScript project references, and CI verification.

Preferred commands (orchestrated via justfile at project root):
- `just build` — type-check + production build
- `just lint` — module boundary verification + ESLint + oxlint
- `just test` — unit tests
- `just dev` — Vite dev server
- `just clean` — remove build artifacts
- `just setup` — install runtimes + dependencies (one-time)
