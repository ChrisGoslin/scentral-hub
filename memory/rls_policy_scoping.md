---
name: rls_policy_scoping
description: Policies with WITH CHECK (true) and no TO clause apply to PUBLIC, not just authenticated users — critical RLS security gap
metadata:
  type: feedback
---

**Rule:** RLS policies with `WITH CHECK (true)` and no `TO role` clause apply to `PUBLIC` (all roles), not just authenticated users or service-role. Service role bypasses RLS entirely and needs no explicit policy.

**Why:**
- Postgres OR-combines policies: if one policy permits a row, it's visible/writable regardless of other policies.
- A `PUBLIC` policy with no role restriction defeats row-level access checks.
- Service role bypasses RLS entirely — it doesn't need or check RLS policies.

**How to apply:**
- Always explicitly scope policies: `TO authenticated`, `TO anon`, or `TO service_role`.
- Review every policy for unintended scope:
  ```sql
  -- Wrong: applies to PUBLIC
  CREATE POLICY "insert" ON my_table FOR INSERT WITH CHECK (true);
  
  -- Right: authenticated users only
  CREATE POLICY "users_own" ON my_table
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  
  -- Right: intentionally public read
  CREATE POLICY "public_read" ON my_table
    FOR SELECT USING (true);  -- Document the intent!
  ```
- Service-role routes (admin operations) don't need RLS policies — service role bypasses RLS. But user-session routes must enforce `auth.uid() = user_id`.

**Incident:** 
PR #64 had multiple policies with `WITH CHECK (true)` and no role scoping, allowing unauthenticated or cross-user writes.

**Linked resources:** [[phantom_object_pattern]], [[nota_architecture_contract]]
