# Agent Audit: Security

## 🛡️ Vulnerability & Perimeter Scan

As the Security Agent, I have audited the credentials and data sovereignty layers of Scentral.

### Security Milestones:
- **Credential Masking:** Verified. All API keys (Gemini AQ-format and Supabase service roles) are stored in `.env.local` and excluded from the repository via `.gitignore`.
- **Identity Gating:** Robust. The `utils/supabase/server.ts` middleware correctly redirects unauthorized attempts to access `/schedule` or `/you`.
- **Data Sovereignty (RLS):** All `spritz_schedules` operations are governed by `auth.uid() = user_id` policies. Users cannot "leak" rituals to other accounts.

### Security Gaps:
- **CSRF Protection:** While Next.js 16 provides built-in protection for Server Actions, I recommend a secondary validation for the client-side `/api/schedule/save` POST requests.
- **Scraper Rate-Limiting:** Our discovery scripts currently use a static User-Agent. This is a "Soft Risk" for being blacklisted by vendors. I recommend rotating agents via a proxy layer.

**Recommendation:** Conduct a dedicated "Security Handshake" audit before the public Beta launch to verify edge-case RLS bypasses.
