# Deployment Runbook — /home/claude/aaa-insights

## Environments
| Env | URL/target | Purpose |
|-----|-----------|---------|

## Secrets & config
[List by NAME only — never paste real credentials. Where the client stores/injects them.]

## Deploy steps
1. Confirm CI is green (full suite + clean build).
2. Snapshot live state: <release/tag/DB migration point>.
3. Roll out: <staged/canary/full steps>.
4. Smoke test in live env: <the load-bearing checks>.

## Rollback (keep ready before cutover)
- One-command / few-step reversal: <exact steps>.

## CI/CD guardrail
[How the suite is wired to re-run on every future change.]

## Client-action items (do NOT perform on their behalf)
- [ ] <credential wiring / DNS / paid provisioning / access changes> — client triggers, with approval.

## On-call / escalation
