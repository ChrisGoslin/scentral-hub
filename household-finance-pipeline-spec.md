# Household Finance App — Drive Integration Pipeline Spec
_Written overnight 15 May 2026. Ready for Claude Code implementation._

---

## What this doc is

A complete technical spec for the Google Drive → Supabase pipeline in the
household-finance app. A Claude Code session can pick this up and implement
it without any design decisions left open.

---

## What data exists in the Drive folder

| Folder | File types | What's in them |
|---|---|---|
| Bank Statements Chris | PDF (Revolut) | Transactions: date, description, money out, money in, balance. Jan 2024 → May 2026. |
| Irish Bank Statements Eduardo | PDF (Revolut) | Same format, Eduardo's account. |
| Payslips Chris | PDF | Monthly payroll: gross, net, deductions, pension contributions. |
| Pension Statements Chris | PDF | Pension balances, fund allocations, AMC details. |
| Utilities Bills | PDF, JPEG, CSV | Electricity bills, Sky, subscriptions, service charges. |
| Subscriptions doc | Google Doc | Recurring billing tracker — name, price, frequency. |

**Key insight:** Revolut bank statement PDFs are consistently structured.
Every page has the same columns: `Date | Description | Money out | Money in | Balance`.
This makes them the highest-value, most parseable source. Start here.

---

## The Supabase schema (already exists)

```
transactions (
  id uuid,
  date date,
  amount numeric,        -- positive = income, negative = expense
  vendor text,
  category text,
  owner text,            -- "chris" or "eduardo"
  notes text,
  created_by uuid
)

financial_goals (id, name, target_amount, current_amount, target_date, category)
pension_records (id, ...)
subscriptions (id, ...)
ai_analyses (id, ...)
drive_webhook_events (id, received_at, resource_state, resource_id, channel_id)
```

The `drive_webhook_events` table and `/api/drive/documents` + `/api/drive/read`
routes already exist — the skeleton is built. What's missing is the parsing
and insertion logic.

---

## Proposed pipeline architecture

```
User uploads PDF to Drive folder
        ↓
Drive webhook fires → POST /api/webhook/drive
        ↓
App fetches file via /api/drive/read
        ↓
Parser detects file type (bank statement / payslip / bill)
        ↓
Extracts structured rows
        ↓
Normalises to transactions schema
        ↓
Upserts into Supabase (deduplicated by date + vendor + amount)
        ↓
ai_analyses table updated with summary
```

This is a pull-on-webhook pattern. The user just drops a file into their
Drive folder and the app ingests it automatically. No manual data entry.

---

## Phase 1 — Bank Statement Parser (implement first)

### Why first
Revolut PDFs have a consistent, machine-readable format. They represent
the bulk of the transaction data. Getting this right unlocks the dashboard,
spending insights, and MOT advisor features immediately.

### How Revolut PDFs parse

Each page after the summary has rows like:
```
4 Jan 2024   ParkVia                           €74.00        €0.97
             To: Dublin Airport Car Par
6 Jan 2024   Transfer from LUIS EDUARDO...               €25.00   €25.97
```

Columns: Date | Description (multi-line) | Money out | Money in | Balance

**Parser logic:**
1. Use `pdfplumber` (Python) or `pdf-parse` (Node) to extract text per page
2. Skip the summary page (detect "Balance summary" header)
3. For each line: regex match `^\d{1,2} [A-Z][a-z]+ \d{4}` to identify transaction rows
4. Extract: date → `date`, first description line → `vendor`, money out → negative `amount`, money in → positive `amount`
5. Assign `owner` based on which folder the file came from (Chris vs Eduardo)

### Auto-categorisation rules (apply after parsing)

| Vendor keyword | Category |
|---|---|
| Netflix, Disney, Apple TV, Sky, ChatGPT, Audible, Now TV | Subscriptions |
| Tesco, Lidl, Aldi, Dunnes, SuperValu | Groceries |
| Sprout, Siam Thai, restaurant keywords | Dining |
| Westwood, gym | Health & Fitness |
| ParkVia, Easytrip, Dublin Airport | Transport |
| ALONE, ISPCC, Oxfam | Charitable |
| Irish Life, pension | Pension/Insurance |
| Top-up, Transfer from | Income/Transfer |
| Eir, Three, Sky | Utilities |

Unknown vendors → category = "Uncategorised" (user can fix in UI)

### Deduplication

Before inserting, check:
```sql
SELECT id FROM transactions 
WHERE date = $date AND amount = $amount AND vendor ILIKE $vendor
LIMIT 1;
```
If exists, skip. This means re-uploading a statement is safe.

---

## Phase 2 — Payslip Parser

Mastercard payslips contain:
- Gross pay, net pay, PAYE, PRSI, USC deductions
- Pension contributions (employee 7% + employer 10%)
- Bonus amounts

Insert as `category = 'Salary'` income transactions.
Also feed `pension_records` table with monthly contribution amounts.

This gives the dashboard a complete income picture alongside spending.

---

## Phase 3 — Subscription tracker

The Google Doc "Subscription Price & Frequency Recurring Billing" lists
all recurring subscriptions. Parse this and sync to the `subscriptions`
table in Supabase. The app already has a subscriptions page — this feeds it
with real data instead of manual entry.

---

## Phase 4 — AI Insights (already partially built)

The `ai_analyses` table and `/api/chat` route exist. Once transactions are
populated, the MOT advisor and dashboard insights can run real queries:

- "What did I spend on subscriptions last month?" → query transactions
- "Am I on track for my mortgage overpayment goal?" → query financial_goals
- "How much have I spent on dining this year?" → aggregate transactions

The system prompt for the MOT advisor (seen in commit history) already
has Irish financial advisor context. Wire it to real data instead of
hypotheticals.

---

## File structure for Claude Code session

Files to create/modify:
```
app/
  api/
    webhook/
      drive/route.ts       ← already exists, needs parsing logic added
    drive/
      read/route.ts        ← already exists, needs to return raw buffer
      parse/route.ts       ← NEW: parse PDF → structured rows
  lib/
    parsers/
      revolut-statement.ts ← NEW: Revolut PDF parser
      payslip.ts           ← NEW: payslip parser
      auto-categorise.ts   ← NEW: keyword → category mapper
    supabase/
      transactions.ts      ← NEW: upsert with deduplication
```

---

## What the Claude Code session prompt should be

> "I want to build a file parser that reads a Revolut bank statement PDF
> from Google Drive and inserts the transactions into the Supabase
> `transactions` table. The spec is in `household-finance-pipeline-spec.md`
> in my ai-studio folder. Start with `app/lib/parsers/revolut-statement.ts`
> and `app/api/drive/parse/route.ts` only. Do not touch any existing routes."

That's it. One file, one route, no scope creep.

---

## Risks and things to flag

1. **Revolut PDF format may vary** — statements from different date ranges
   occasionally reformat. Test with at least 3 different PDFs before
   declaring the parser done.

2. **Drive webhook auth** — the `/api/webhook/drive` route needs to verify
   the webhook is genuinely from Google (using a channel token). Check
   this is implemented before going live.

3. **Sensitive data** — these are real bank statements with real balances.
   Make sure RLS policies on the `transactions` table are correct so only
   the authenticated user can read their own data. Check `created_by`
   is enforced.

4. **Eduardo's statements** — Eduardo is a second person in the household.
   The app currently has single-user auth. Decide: does Eduardo get his own
   login, or does Chris see both? This is an auth/data model decision to
   make before parsing Eduardo's files.

---

## Summary of what to do tomorrow

| Step | Where | Time estimate |
|---|---|---|
| Fix Supabase Site URL → magic link works | Supabase dashboard | 5 min |
| Read this spec | ai-studio folder | 5 min |
| Open Claude Code, paste the one-sentence prompt above | Terminal | — |
| Build revolut-statement.ts parser | Claude Code | 30–45 min |
| Test with one real PDF | Claude Code | 15 min |
| Wire to webhook route | Claude Code | 20 min |
| Verify data appears in Supabase dashboard | Browser | 5 min |

Total: ~90 minutes to have real bank data flowing into the app.
