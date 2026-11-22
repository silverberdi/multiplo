## 1. Align the operational contract

- [x] 1.1 Update the metrics operations and ingestion spec deltas to accept the existing Worker rate limiter when exact WAF isolation is unavailable, record the accepted undercount risk, and retain no-broad-rule/no-billing constraints.
- [x] 1.2 Update operational documentation with the approval, rollout order, approximate 120/minute limit, and accepted-data interpretation.

## 2. Enable production collection in safe order

- [x] 2.1 Add an explicit protected workflow input for Worker ingestion, default it to off, and pass the selected state through the production config generator.
- [x] 2.2 Deploy the Worker from `main` with ingestion enabled while the browser outbox remains disabled; verify the exact route and enabled state with a non-writing invalid-payload probe, and confirm the 120/minute binding in deployment evidence.
- [x] 2.3 Enable client transmission only after Worker verification; publish Pages and verify a completed real gameplay round is persisted in D1 without blocking play. Evidence: one real round was accepted at `2026-11-22T20:15:03.029Z` with four answered/correct questions. The user played a second round on another device, but it is not visible in D1; device attribution is intentionally unavailable and possible undercount is accepted.
- [x] 2.4 Record deployment SHAs, workflow runs, accepted D1 evidence, and final kill-switch states in `metrics/OPERATIONS.md`; verify rollback instructions disable client first and archive the Change natively.
