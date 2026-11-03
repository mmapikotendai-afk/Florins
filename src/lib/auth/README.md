# Administrator authentication

requireAdmin in ../server/security.ts verifies bearer tokens with Supabase Auth /auth/v1/user, then checks an enabled AdminUser by the verified auth UUID. Every admin handler invokes it before access. OWNER and ADMIN currently have identical permissions. Missing credentials/configuration fail closed.

Provision the Supabase account and allowlist row through trusted operations. There is no default administrator, sign-in screen, cookie session, provisioning endpoint or dashboard. Real Supabase sign-in requires deployment configuration and was not exercised locally.
