# Working rules for this repo

## Standing directive — use available material proactively

When the task is building, designing, or managing anything (code, content,
docs, project tracking, outreach), use whatever connected tool actually
fits — connectors (Gmail, Slack, Notion, ClickUp, Figma, Google Drive/
Calendar, Canva, Gamma, etc.) and skills (docs, xlsx, pptx, pdf, docx,
dataviz, deep-research, and the rest) — without waiting to be told by name.
Match the tool to the task; don't fire tools that aren't relevant.

## ECC harness — auto-engage for development work

This repo has the `ecc@ecc` plugin installed at project scope (68 agents,
292 skills, hooks; see `.claude/settings.json`, source: `affaan-m/ECC`).

- For actual engineering work in this repo (building, fixing, reviewing,
  testing code) — engage the relevant ECC agent(s)/skill(s) automatically.
  No need for the user to say "use ECC" first.
- Pick what's relevant to the task at hand, not the whole harness. A typo
  fix doesn't need `planner` + `security-reviewer` + `tdd-guide` all firing.
- Typical pipeline for a real feature/fix: `planner` → tests/`tdd-guide` →
  implement → language-specific reviewer or `code-reviewer` → `security-
  reviewer` where relevant → `code-simplifier` on cleanup passes.
- ECC's hooks (standard profile) already run automatically on session
  lifecycle events regardless — no action needed there.
- This scope is development work only. Don't reach for ECC agents on
  non-engineering tasks (content, outreach, scheduling, etc.) — use the
  standing directive above for those instead.
- ECC is installed here and in `EMCC-Affan` only. It is not active in
  other repos unless installed there too.
