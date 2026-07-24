# nota. Project Memory

Lessons, patterns, and critical context discovered during pre-launch audit and CI-response cycles.

## Database & Schema

- [Phantom Object Pattern](phantom_object_pattern.md) — Migrations reference DB objects that don't exist in production
- [RLS Policy Scoping](rls_policy_scoping.md) — Policies with `WITH CHECK (true)` and no `TO` clause apply to PUBLIC
- [Fair-Share Budget Allocation](fair_share_budget_allocation.md) — Reusable algorithm for fairly dividing constrained resources across uneven demand

## Operational Discipline

- [Empirical Handshake](empirical_handshake.md) — Verify live state before trusting prior claims; schema drift is common and silent
- [Migration Patterns Playbook](../docs/nota/12-migration-patterns-playbook.md) — Comprehensive guide to idempotency, phantom objects, RLS, constraint ordering, index immutability

## Related Docs

- [nota. Architecture Contract](../docs/nota/04-architecture-plan.md)
- [Pre-launch Testing & Security](../docs/nota/06-testing-security-abuse.md)
- [Engineering Handover](../docs/nota/07-engineering-handover.md)
