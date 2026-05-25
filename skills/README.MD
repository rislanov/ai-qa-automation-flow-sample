# Repo-Local Skills

This directory contains repo-local Codex skills for the sample automation flow:

```text
TMS -> cases/*.MD -> playwright-mcp AI run -> tests/*.spec.ts -> CI/CD
```

## Skills

- [sync-testops-cases](sync-testops-cases/SKILL.md) — sync `automation:ai-ready` cases from TMS into `cases/*.MD`.
- [run-md-cases-ai](run-md-cases-ai/SKILL.md) — execute Markdown cases through `playwright-mcp` and collect evidence.
- [code-playwright-from-md](code-playwright-from-md/SKILL.md) — code TypeScript Playwright tests strictly from Markdown cases.
- [verify-playwright-cases](verify-playwright-cases/SKILL.md) — verify changed cases, tests, artifacts, and secrets before commit or PR.

## Principle

TMS stores the meaning of the case. `cases/*.MD` stores the synchronized contract. `tests/*.spec.ts` stores the executable implementation. If they conflict, stop and return the case to review instead of inventing behavior in code.
