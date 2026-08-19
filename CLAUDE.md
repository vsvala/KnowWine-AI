# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two-package monorepo, one git repo:

- **`back/`** — Node.js/Express REST API, plain CommonJS, no TypeScript. See
  [`back/CLAUDE.md`](back/CLAUDE.md) and `back/README.md` (canonical
  architecture doc) before touching backend code.
- **`front/`** — React 19 + TypeScript SPA, Vite. See
  [`front/CLAUDE.md`](front/CLAUDE.md) and `front/docs/ARCHITECTURE.md`
  (canonical architecture doc) before touching frontend code.

This file only holds guidance genuinely shared by both packages — anything
stack-specific belongs in the relevant package's own `CLAUDE.md`, not here.
`README.md` at this level has the full project overview (features, tech
stack, system diagram) for a human reading the repo; it isn't duplicated
here.

## Commit workflow

Read **[`CONTRIBUTING.md`](CONTRIBUTING.md)** before writing a commit
message — Conventional Commits (`type(scope): summary`), with the type and
scope tables this repo actually uses. Check `git log --oneline` for prior
scopes before inventing a new one.

**Every commit — whoever makes it, including Claude Code — goes through an
automated gate.** Read
**[`docs/ai-commit-quality-gate.md`](docs/ai-commit-quality-gate.md)** for
the full mechanics; the short version:

- `git add` inside a Claude Code session runs a fast pre-check (lint, type
  check, tests, secrets scan) via a `PreToolUse` hook
  (`.claude/hooks/pre-add-check.sh`) — it can block staging on a real
  failure. `.claude/` is gitignored, so this hook is local to this machine
  only, not something every clone gets.
- `git commit` (any caller) runs `.githooks/pre-commit` — secrets, lint,
  type check, tests, `npm audit` — as a hard gate, then `.githooks/commit-msg`
  — one AI review call that checks the diff for BLOCKING-severity issues,
  Conventional Commits formatting, and unrelated changes bundled together.
  Only a BLOCKING finding actually blocks the commit; the rest is advisory.
- A fresh clone must run `git config core.hooksPath .githooks` once —
  `.git/hooks/` itself isn't version-controlled.

Don't route around a failing gate (`--no-verify`, `SKIP_AUDIT_GATE=1`, etc.)
without the user explicitly asking for it — a blocked commit almost always
means the gate found something real.

## General engineering principles

- Explain the reasoning before a significant or non-obvious change, not
  just the change itself.
- Explain architectural decisions before implementing them
- Don't modify files beyond what the task actually requires.
- Prefer the simple, direct solution over a premature abstraction.
- If you notice a real convention, recurring pattern, gotcha, or piece of
  drift while working (in code, tests, or docs) that isn't already written
  down in the relevant `CLAUDE.md`, say so and suggest recording it —
  don't just silently apply the knowledge and move on, and don't edit a
  `CLAUDE.md` file to add it without the user agreeing first.

## Authentication

Auth spans both packages — the backend issues/rotates the tokens, the
frontend stores and attaches them (see `back/CLAUDE.md` and
`front/CLAUDE.md` §Authentication for the stack-specific rules). If
authentication behavior changes, inspect **both** `front/` and `back/`
before implementing the change — a fix that only touches one side usually
means the other side's contract assumption just got silently broken.

## Architecture Decision Records

Significant architecture decisions — ones that shape how future work has to
fit in, trade one quality for another, or would be non-obvious to someone
reading the code cold — are logged in **[`docs/adr.md`](docs/adr.md)**, not
scattered across README files. This applies to both `back/` and `front/`;
there's one shared log, not a per-package one.

Add an entry when:

- A dependency/library/tool is chosen over real alternatives (not just "a
  library is needed for X").
- A deliberate constraint or tradeoff is introduced that isn't obvious from
  the code alone (a hard-coded cap, a chosen data flow, a security
  tradeoff).
- An existing decision is reversed — add a **new** ADR that supersedes the
  old one and update the old entry's Status; don't delete or rewrite
  history.

Not every change needs one — routine implementation choices, bug fixes, and
refactors that don't change the shape of anything don't qualify. When
unsure whether something rises to this level, ask rather than either
skipping a real decision or padding the log with noise.

Format (see `docs/adr.md` for two worked examples): `### ADR-NNN: <short
decision title>`, then **Status** (Proposed / Implemented / Superseded by
ADR-NNN), **Context**, **Decision**, **Consequences**, **Alternatives
considered**. Number sequentially; never reuse or renumber.

## Documentation

- When documentation (README, ARCHITECTURE.md, CLAUDE.md, ADRs, etc.)
  defines or introduces a technology, library, or tool being used, link to
  that tech's current official documentation — not a blog post, a
  version-specific tutorial, or memory of how it used to work. Look the
  link up rather than guessing a URL; APIs and recommended patterns shift
  between major versions.

## Code review

For a deep review of specific files, use the `fullstack-reviewer` agent
(`.claude/agents/fullstack-reviewer.md`) or the `/code-review` skill for a
whole diff/PR — both already define a severity-ranked (BLOCKING/MAJOR/MINOR)
review process tailored to this codebase; don't improvise a separate ad hoc
one.

## before implementing

When the user asks for an implementation, do not just produce code. For non-trivial backend changes, briefly explain the architectural reasoning, trade-offs and potential failure modes before implementing.
