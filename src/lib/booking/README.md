# Stage 6 booking boundary

database-gateway.ts is the active browser transport. Availability and selection checks use Route Handlers; submit/management use Server Actions. Both delegate to ../server/appointments.ts for strict validation, authoritative services/schedules, Harare date conversion, transaction locking and PostgreSQL overlap protection.

Requests save as REQUESTED and hold a staff interval pending studio confirmation. A UUID idempotency key binds to the validated payload. The browser preserves it through uncertain submission failures. Final retries reach the mutation directly, so a saved request cannot block its own retry through a preliminary availability check. The server revalidates atomically. Customer management requires the private token and latest version; rescheduling requests confirmation again and cancellation releases time.

Customer/token state is component memory only; no browser storage or personal URL parameters. After leaving or reloading, contact the studio with the reference. Notifications enter an outbox without external delivery. Availability refreshes every minute/on focus; submission rechecks regardless. Sample schedules are development data, not policy.

mock-gateway.ts and demo types remain historical Stage 5 fixtures; config.ts also supplies development seed services. The current interface does not use the mock gateway. Stage 5 tests describe the old demo; current acceptance uses test:stage6 and verify-stage6-browser.mjs. Online booking defaults closed until verified configuration/deployment.
