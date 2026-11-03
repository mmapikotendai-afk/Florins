# FLORINS — Stage 6

The homepage hero now uses the supplied black evening-gown photography from `Downloads/FLORINS`: `DESKTOP/Slide 4.png` and matching `MOBILE/Slide MB4.png`. The photographic hero replaces the video, overlays the requested brand/headline/description and existing route CTAs, preserves the full silhouette, and supports reduced motion. Navigation and all other homepage sections retain their established design. See `ASSETS.md` and `.impeccable/surfaces/hero-photography.md` for selection and provenance. Run `node scripts/verify-homepage.mjs` with `FLORINS_PLAYWRIGHT_ROOT` set for the current six-width acceptance checks; `FLORINS_HERO_URL` selects the server origin. Earlier film descriptions below are historical.

Stage 6 replaces the mock appointment transport and catalogue repository with PostgreSQL through Prisma. Appointment requests hold a staff interval with `REQUESTED` status until studio confirmation. The existing six-step interface supports submission, in-tab rescheduling and cancellation. There is no payment, admin dashboard or external notification delivery. The Bespoke page retains its manual WhatsApp draft; a validated enquiry API is available separately.

## Current setup

Use Node 22.12+ and PostgreSQL. Copy `.env.example` to a private environment file and supply the database URLs, a stable random `BOOKING_TOKEN_SECRET` of at least 32 characters and the canonical `NEXT_PUBLIC_SITE_URL`. `DIRECT_URL` is for migrations; runtime uses `DATABASE_URL`. Provider TLS verification remains enabled. Never expose either database URL or the booking secret to the browser.

Keep `BOOKING_ENABLED=false` until real services, staff, weekly windows and blocked dates are approved and entered. `FLORINS_ENV=production` excludes all `sample=true` records from public catalogue/services/staff. Development seeding requires both `FLORINS_ENV=development` and `ALLOW_DEVELOPMENT_SEED=true`; it creates sample catalogue and scheduling records only. It creates no administrator or customer records. Root metadata remains noindex/nofollow.

Apply the two checked-in migrations with `npm run db:deploy` against the intended database. They create the Stage 6 tables, checks, PostgreSQL overlap exclusion constraint and RLS. The database must permit `btree_gist`. Prisma must use a trusted server role capable of accessing these RLS-protected tables; no public Supabase Data API policies are granted. Do not use `db push` as a replacement for these migrations: Prisma schema syntax cannot express the exclusion constraint.

For isolated local work, put the same settings in ignored `.local/development.env`, using loopback database URLs and a separate `TEST_DATABASE_URL` whose database name ends in `_test`. The existing local cluster is `.local/stage6-postgres` on port 55432. Start PostgreSQL before running:

```powershell
npm run db:migrate:local
npm run db:seed:local
npm run dev:local
```

`npm run dev` and the `:local` commands use the isolated local settings and refuse non-loopback database URLs. Both `localhost:3000` and `127.0.0.1:3000` are accepted for this preview. `npm run start:local` runs a previously built production bundle with those local settings. `npm run dev:configured` and `npm run start` use the workspace environment; choose them only for the intended database. Use the development server during local editing so rebuilding the production bundle cannot replace a running preview's assets. The build does not need a reachable database; public routes render dynamically so schedule and publication changes appear on subsequent requests.

## Booking and administration

`NEXT_PUBLIC_SITE_URL` is embedded when Next.js builds. The optional server-only `SITE_ORIGIN` overrides mutation origin checks at runtime; local commands set it to their loopback origin. Use the verified canonical origin for both settings in production.

The server owns service duration, staff assignment, Harare date conversion, a rolling 56-day horizon and availability. `REQUESTED` and `CONFIRMED` appointments occupy `[start,end)` intervals. Bookings, schedule edits, blocked dates and management changes share a serializable transaction/advisory lock; PostgreSQL also rejects overlapping active appointments. The request key is a random UUID bearer credential, bound to the validated payload by an HMAC. Retrying it returns the same appointment/token without duplicating customers or outbox rows; a changed payload is rejected. Preserve the secret across deployments or existing management tokens and retry keys become invalid.

Customer management requires the private token and latest version. Only future requested/confirmed appointments can be changed. Rescheduling revalidates availability atomically and returns to `REQUESTED`; cancellation releases time. The browser keeps customer details and private access only in component memory, never in URLs or persistent storage. After reload or leaving the page, customers must contact the studio with their reference. Notification rows are a durable outbox only: no worker or provider sends email, SMS or WhatsApp.

Admin APIs require a Supabase Auth bearer token verified by `/auth/v1/user`, plus an enabled `AdminUser.authUserId` allowlist entry. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (the existing `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is accepted as a fallback). Provision administrators through a trusted database operator; no signup, default password, allow-all guard or admin UI exists. Both OWNER and ADMIN currently have the same API permissions. Provider connection and real administrator sign-in remain deployment configuration, not locally verified integration.

All mutations validate inputs; browser origins must match the canonical origin. JSON Route Handlers bound bodies to 16 KiB; Server Actions to 32 KiB. Responses use generic public errors without SQL or customer details. A database-backed limiter hashes identities. Configure `RATE_LIMIT_TRUSTED_HEADER` only when a reverse proxy overwrites it; otherwise visitors share a bucket. Operations must periodically delete expired `RateLimitBucket` rows and establish customer retention/outbox policies before public launch. See [API contracts](src/app/api/README.md).

## Stage 6 verification

Verified locally on 30 October 2026: production build, TypeScript, ESLint, Prettier, twelve PostgreSQL integration checks and both browser flows passed. The one Impeccable detector run returned no findings for the changed booking surfaces. Mobile confirmation and desktop cancellation screenshots were visually inspected; capture scroll offsets were corrected before the final evidence was saved. These checks used isolated local databases and Edge/Chromium, not the configured Supabase database.

```powershell
npm run test:stage6
npm run build
npm run lint
npm run format:check
```

`test:stage6` refuses any non-loopback database or database name without `_test`, applies migrations there, creates unique synthetic fixtures and removes only its own customer/schedule records. It verifies concurrent duplicate requests, conflicting bookings, payload binding, duration/adjacent intervals, schedule protection, management token/version checks, reschedule/cancel, status transitions, sample filtering, booking closure, enquiry retries, origin/auth/rate limits, RLS and the exclusion constraint. Evidence is ignored under `.local/stage6-results/`.

With `start:local` running and `FLORINS_PLAYWRIGHT_ROOT` pointing to the directory containing `node_modules/playwright`, run `node scripts/verify-stage6-browser.mjs`. It uses local Edge/Chromium at emulated 375px and 1440px widths, synthetic customer details, and local development database writes. It checks create/reschedule/cancel, retaining the original request, a lost-response retry, memory-only access, no-JavaScript fallback and rejected admin/origin requests. It leaves cancelled synthetic requests for inspection. Physical phones, Safari, real Supabase sign-in and notification delivery are not covered.

## Historical Stage 1–5 record

The material below records the earlier implementation and its checks. Stage 6 above supersedes statements about mock-only booking, fixture-backed catalogue, absent database/API integration and future-stage scope.

### Stage 5

Next.js App Router website for FLORINS, an appointment-only fashion studio in Milton Park, Harare. Stage 2 delivers the editorial homepage, responsive fashion film, collections showcase, bespoke and atelier introductions, selected creations, consultation invitation, navigation and footer. Stage 3 adds the approved sample catalogue within the established system. Stage 4 adds Bespoke and Atelier editorial pages and a local enquiry-draft builder. Stage 5 adds a six-step mock appointment interface. Actual reservations, uploads, online payments and admin access remain outside this stage.

## Current navigation refinement

The subsequently authorized refinement adds distinct `/about` and `/contact` pages. Main and footer navigation share `src/lib/config/navigation.ts`: Home `/`, Collections `/collections`, Bespoke `/bespoke`, The Atelier `/atelier`, About `/about` and Contact `/contact`. Global booking actions still reach the Stage 5 `/appointments` demonstration.

At 1280px and above, the supplied logo is centered between three main links on each side, with the booking action on the right. The masthead is fixed at 112px; compact layouts use 80px with brand, booking action and menu toggle. Public content reserves the matching height; scroll offsets use header height plus 24px. Active states derive from pathname, including nested collections and the appointment CTA; homepage visibility observers are no longer used.

Header navigation closes the compact menu, releases body scrolling and starts at the top, including repeated selection of the current page. Escape restores toggle focus, and keyboard traversal stays within the open menu/toggle. `RouteStart` starts changed routes at the top when no hash exists. Deliberate contextual links such as `/bespoke#enquiry` and catalogue filter anchors remain intact. Footer Back to top targets the current page's `#main-content`.

About uses approved garment photography and existing brand facts without implying stock. Contact exposes only verified WhatsApp/calling, Instagram and appointment-only Milton Park locality, with access to the manual bespoke draft and an explicit appointment-demo note. No studio interiors, street address, hours, email or new business history is invented. Existing fonts, palette, type roles and Stage 5 backend/demo boundaries remain in force.

Production build (including TypeScript), ESLint and Prettier pass. Browser checks passed at 320, 375, 768, 1024, 1280, 1440 and 1918px for fixed positioning, real page destinations, active links, top-on-navigation, compact menu closure, nested collection/appointment states and contextual deep links, with no overflow or browser errors. Evidence is `.impeccable/review/navigation/results.json`; independent Impeccable review inspected all eleven captures and returned **ship**, with no material findings. Final documentation comparison confirms the current navigation contract. Browser evidence uses local Edge/Chromium with emulated viewports; physical phones and Safari were not tested. The single `.impeccable/navigation-detector.json` report contains eight pre-existing type advisories; no new type roles were introduced. Legacy type-scale drift is reported without repair in this refinement.

Repeat against the production server with `node scripts/verify-navigation.mjs`, using `FLORINS_PLAYWRIGHT_ROOT` as the parent containing `node_modules/playwright`. Results and captures belong under `.impeccable/review/navigation/`.

## Stage 5 appointments

`/appointments` is a six-step demonstration: Service, Date, Time, Your details, Review and Submit. It continues the established code-led feature extension in Operate mode, with Cormorant/Manrope, monochrome square controls, a selection summary and a keyboard-accessible React DayPicker calendar. A mock-only notice stays visible through confirmation. Global Book Appointment and visit CTAs now reach `/appointments`; the separate manual bespoke draft remains at `/bespoke#enquiry`, and the confirmed WhatsApp/calling contact remains available for real visits.

The six services are editable source records in `src/lib/booking/config.ts`, with stable IDs, names, descriptions, durations and enabled flags:

| Proposed service            | Sample duration |
| --------------------------- | --------------- |
| Fashion Consultation        | 30 minutes      |
| Body Measurements           | 30 minutes      |
| Outfit Fitting              | 45 minutes      |
| Bespoke Design Consultation | 60 minutes      |
| Fabric Selection            | 30 minutes      |
| Group Consultation          | 90 minutes      |

These durations are samples, not confirmed FLORINS policy. Mock availability rolls over 56 days using an example 09:00-16:00 window and 30-minute start intervals, with blocked intervals, unavailable offsets and example closed days. Starts must fit the complete sample service duration inside the window. None of this establishes real studio opening hours or availability. All date keys, calendar labels and slot timestamps use Africa/Harare (UTC+02:00). The client clock updates expired choices; fixtures use the current day rather than hardcoded public dates.

The calendar distinguishes available bordered days, selected black/white days, unavailable struck-through days and past italic days, with a legend and accessible labels. Unavailable time options remain visible and disabled. Changing service clears date/time; changing date clears time. Back and review/edit controls retain customer details. Loading, retry, empty availability and stale-selection errors provide recovery paths.

React Hook Form and Zod validate the latest step values on Continue, with submit-mode validation preventing blur-time errors from shifting the button during activation. Name, email and phone are required; event date and notes are optional, and an event cannot precede the appointment. Current mock availability is checked before review and again at final submission. The final step requires explicit acknowledgement that this is a demo. A client lock and instance-local promise map reuse duplicate/concurrent submission keys; they do not reserve inventory or provide production concurrency protection.

Confirmation shows a `DEMO-` reference, customer, service, sample duration, date, time, real studio location and `demo-only` status displayed as `Demo only - not reserved`. No real time is reserved or inventory mutated. No booking POST, personal data in URLs, localStorage/sessionStorage, notifications or production database connection occurs. Confirmation lives only in current component memory and disappears on reload, leaving the page or starting another demo. Real visits still require direct WhatsApp contact. Without JavaScript the notice offers direct contact instead of claiming a completed booking.

`BookingGateway` and DTOs isolate the mock boundary from React and Prisma; see `src/lib/booking/README.md`. The current mode/status types deliberately admit demo output only. A production flag is not implemented. Stage 6 must add authoritative server transport and verified service/schedule configuration, introduce real booking states, revalidate all requests, enforce conflicts atomically in PostgreSQL and bind idempotency to request identity and payload. Buffers, capacity, group rules, publication, cancellations and notifications require confirmed policy. Stage 5 adds no admin UI, Prisma schema change or migration.

## Stage 5 verification - 29 October 2026

The production build including TypeScript, ESLint and Prettier pass. Pure fixture/schema/gateway checks and complete browser flows pass at 320, 375, 430, 768, 1024, 1440 and 1920px. Checks cover field validation, calendar/slot states, changing services, retained customer input, expired-time recovery, concurrent duplicate submission, demo confirmation, no-JavaScript fallback and privacy. No horizontal overflow, browser errors, booking POSTs or persistent browser storage were found. Screenshots and results are under `.impeccable/review/stage5/`. Independent Impeccable review inspected all 31 captures and returned **ship**, with no material findings; the malformed initial expiry capture was replaced before that full review. The final documentation comparison found the implemented system consistent with DESIGN.md and its sidecar. The single `.impeccable/stage5-detector.json` run returned three type-size advisories; the intended 1.75rem summary, 1.25rem reference and 2rem mobile step roles are documented in DESIGN.md and its sidecar. No second detector scan was run.

With a production server running:

```powershell
$env:FLORINS_PLAYWRIGHT_ROOT = "C:/path/to/playwright-cache-parent"
node scripts/verify-stage5.mjs
```

The root must contain `node_modules/playwright`. The script uses local Microsoft Edge and defaults to `http://127.0.0.1:3000`; set `FLORINS_STAGE5_URL` for another origin. Pure fixture/schema/gateway tests and browser evidence are written under `.impeccable/review/stage5/`. Tests freeze the clock at 29 October 2026 for deterministic availability; production uses the current client clock. Use synthetic personal details for test evidence.

## Stage 4 Bespoke and Atelier

This code-led extension retains the established monochrome palette, Cormorant Garamond/Manrope typography, full garment silhouettes, square controls and reduced-motion-aware reveals. `/bespoke` introduces personal design, garment inspiration, a proposed process, measurements/fittings and the enquiry builder. `/atelier` presents the studio introduction, philosophy, craftsmanship, fitting discussion, three studio-image slots and an appointment-only visit invitation.

| Route                       | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `/bespoke`                  | Bespoke editorial page                       |
| `/bespoke#proposed-process` | Proposed seven-step journey                  |
| `/bespoke#measurements`     | Measurements and fittings discussion         |
| `/bespoke#enquiry`          | Local custom-design enquiry builder          |
| `/atelier`                  | Atelier editorial page and visit information |

The sequence Consultation, Design Discussion, Fabric Selection, Measurements, Creation, Fitting and Final Collection is explicitly proposed until Florins confirms its actual workflow. Lead times, fabric arrangements, fitting counts, prices and availability remain unverified. Dates entered in the builder are requests, not booked appointments.

The user confirmed Zimbabwe contact `0771640916`, internationally `+263771640916`, for WhatsApp and calls. `src/lib/config/site.ts` displays `+263 771 640 916`, with WhatsApp at `https://wa.me/263771640916` and calls at `tel:+263771640916`. Footer, enquiry and studio-visit contacts use that configuration. Instagram @florins.zw remains the social profile. Footer contacts stack vertically with a 4px gap so each action stays distinct. Bespoke and Atelier navigation now reaches their named routes; at the Stage 4 handoff, appointment and consultation actions reached `/bespoke#enquiry` from the header, footer, homepage and catalogue. Stage 5 redirects global appointment CTAs to `/appointments` while retaining the manual bespoke builder. No link confirms a booking.

The React Hook Form/Zod builder requires full name, email, phone, occasion and a design description of 20-3,000 characters. Preferred appointment date, event date, reference images and additional notes are optional; notes allow up to 1,500 characters. Dates must be real calendar dates on or after today in Africa/Harare. If both dates exist, the preferred appointment cannot follow the event date. Errors have linked inline messages and an alert summary. Preparing a valid draft focuses its heading; changing details or selected images invalidates that draft.

Reference images are bounded local previews: at most three nonempty JPEG, PNG or WebP files, up to 5 MiB each, 20 megapixels and 8192px on either edge. MIME type, file signature and browser decoding are checked before previews are added. Failed selections add none of their files. References can be removed, and object URLs are released on removal or unmount. There is no upload endpoint and no reference bytes leave the device through this form.

Enquiry details stay in browser memory, with no application submission, URL parameters, browser storage or network delivery. The confirmed business number in the WhatsApp URL is contact configuration, not visitor input; the link contains no prefilled personal text. Visitors review the draft, copy it, open WhatsApp, paste it and manually send. The draft-ready WhatsApp action announces and opens a new tab with `noopener noreferrer`, keeping the local draft available. Clipboard failure selects the read-only draft for manual copying. Reference filenames appear in the draft, but image files are not attached and must be shared separately. Without JavaScript, preparation stays disabled and direct WhatsApp contact is explained. No backend, database integration, email delivery or actual booking was added. Root metadata retains `noindex, nofollow`.

No studio photographs are available. `src/lib/config/studio-gallery.ts` holds three clearly labelled slots for the interior, worktable and fitting space; replace their null photos only with approved photographs of the actual studio, including alt text and intrinsic dimensions. The supplied garment images are captioned as Florins creations photographed at events or celebrations, not interiors. Milton Park, Harare, Zimbabwe and appointment-only visits are confirmed; no street address, opening hours or email address is supplied.

## Historical Stage 4 verification - 29 October 2026

The final production build (including TypeScript), ESLint and Prettier pass. Production browser checks passed both new pages at 320, 375, 430, 768, 1024, 1440 and 1920px (fourteen route views) plus three rendered form states. Validation, date relationships, restricted local reference previews/removal, draft preparation and invalidation, no-submit/privacy checks, no-JavaScript safety, navigation and the confirmed WhatsApp/calling destinations all passed. The same checks and captures were repeated after the footer contact-spacing correction. Evidence is under `.impeccable/review/stage4/`; the single Stage 4 detector report, `.impeccable/stage4-detector.json`, is empty (`[]`).

The independent full review's contact, persistence and extension-contract findings were resolved. Its verdict pass also caught adjacent footer contact actions; these now occupy separate rows. Final `finish-verdict.md` records disposition `ship` for the scored fixes with no observed spacing-fix regressions. Stage 4 is complete. The process remains proposed, studio photographs remain explicitly awaiting approved assets, and the enquiry remains a local draft followed by a visitor-controlled WhatsApp conversation—not an automatic submission or confirmed booking.

Against a running production server, repeat the Stage 4 checks with local Microsoft Edge:

```powershell
$env:FLORINS_PLAYWRIGHT_ROOT = "C:/path/to/playwright-cache-parent"
node scripts/verify-stage4.mjs
```

The root must contain `node_modules/playwright`. The script defaults to `http://127.0.0.1:3000`; set `FLORINS_STAGE4_URL` for another origin. Results and screenshots go to `.impeccable/review/stage4/`. Build and start commands are listed below. Use only synthetic personal details in test evidence.

## Stage 3 catalogue

The directly implemented catalogue extends the approved monochrome Cormorant Garamond/Manrope system. `/collections` presents proposed collections and all sample designs; a GET category filter preserves a readable query parameter across reload and works without JavaScript. Collection pages show their designs, and contextual detail URLs show contained photography, sample specifications and enquiry actions.

| Route                                            | Purpose                                |
| ------------------------------------------------ | -------------------------------------- |
| `/collections`                                   | Catalogue landing page and design edit |
| `/collections?category=african-prints#designs`   | Filtered design edit                   |
| `/collections/[collection]`                      | Individual proposed collection         |
| `/collections/[collection]/[design]`             | Sample design within a collection      |
| `/collections/gowns/sculpted-evening-silhouette` | Example detail route                   |

There are four proposed collections and six sample designs, with one design shared across two categories: twelve published catalogue URLs including the landing page. Categories are editable source configuration in `src/lib/catalogue/fixtures.ts`; their names and slugs are not a closed enum. Keep IDs stable, update membership through `collectionIds`, and rebuild/redeploy after changes. There is no administration UI. See `src/lib/catalogue/README.md` for the data contract and editing guidance.

The nine approved photographs are real supplied media. Catalogue names, category assignments, descriptions, making status, sizes and fabric entries are illustrative development fixtures, labelled throughout; they do not establish confirmed products, stock or availability. Every fixture price is `null`, displayed as `Price on enquiry`. Do not remove sample disclosures until the underlying records are verified. Root metadata retains `noindex, nofollow`; no Product/Offer structured data is emitted.

The responsive detail gallery uses genuine alternate photographs when available, contained images and native dialog focus handling. It supports thumbnails, previous/next, arrow keys, 100-300% zoom, reset, scroll, Escape and focus restoration. Zoom begins centered and preserves the current view center after manual panning. Opening, reset and photograph changes restore the centered 100% view. Explicit loading/error status accompanies enlarged images. Single-photo designs do not invent other views. Unknown categories provide a recoverable empty state; invalid or mismatched collection/design routes return the catalogue not-found view.

Shared header/footer Collections links now reach `/collections`; Collections remains active on descendants. Homepage collection entries use the same repository configuration. At the Stage 3 handoff, Enquire opened the verified Instagram profile and Book appointment reached `/#appointment`; WhatsApp was still awaiting confirmation. Stage 4 kept the catalogue Instagram enquiry link and moved appointment links to `/bespoke#enquiry`; Stage 5 now sends those appointment links to `/appointments`, with the confirmed WhatsApp/call contact described above. No link creates a booking or sends a message.

`CatalogueRepository` is an asynchronous typed boundary with serializable DTOs, backed by fixtures today. A future PostgreSQL/Prisma adapter can replace it without coupling pages to database records. Stage 3 makes no database connection or migration and adds no authentication, stock system, payment flow or booking backend.

## Historical Stage 2 behaviour

At Stage 2, navigation links reached homepage sections and collection links reached selected creations; consultation links lead to the verified Instagram profile for enquiries. No appointment is booked automatically. WhatsApp is marked as awaiting confirmation because no verified number was supplied.

The supplied logo, photographs and both videos are included locally. ASSETS.md records their origins. The hero uses one responsive video source, preserves the complete frame with `object-fit: contain`, and switches to a matching poster without video requests when reduced motion or data saving is enabled. Autoplay failures retain a poster. The original desktop film's blurred side panels are part of the supplied asset.

The responsive verification script is `scripts/verify-homepage.mjs`. It uses Playwright with local Microsoft Edge; set `FLORINS_PLAYWRIGHT_ROOT` to the directory containing the installed `node_modules/playwright` package. Run the production server, then the script to capture the seven requested widths and check overflow, photographs, anchors, menu behaviour, responsive video selection and reduced-motion loading. Evidence is stored under `.impeccable/review/`.

## Historical Stage 2 verification — 28 October 2026

The production build (including TypeScript), ESLint and Prettier pass. Production browser checks passed at 320, 375, 430, 768, 1024, 1440 and 1920px, with no overflow, failed images, invalid section links or browser errors. Mobile menu navigation, Escape and restored toggle focus passed. Each normal viewport requested one matching video; reduced-motion checks at mobile and desktop widths requested neither film. Full-page production screenshots were visually inspected.

`responsive-results.json` separates normal page-use requests from screenshot-time requests and records viewport events. Edge/Playwright briefly changed the viewport to 1px during one full-page capture, causing the responsive media listener to request the mobile source; this is captured separately rather than represented as a second initial-page download. The independent Impeccable review and its fix verdict are stored alongside the screenshots. Asset provenance scan reports twelve rasters with no missing origins. No database, booking service or backend was developed.

## Historical Stage 3 verification - 28 October 2026

The production build, TypeScript, ESLint and Prettier pass. The full twelve-route mobile/desktop matrix, fifteen boundary layouts and no-JavaScript filtering checks passed before the isolated gallery view-center correction. Updated zoom-center and pan-preservation checks then passed alongside repeated filter/reload/clear, gallery navigation, keyboard/focus, mobile menu, enquiry destinations and invalid/mismatched route checks. Evidence is stored under `.impeccable/review/stage3/`.

The independent full Impeccable review found one material zoom-centering issue. After correction and decoded-image recaptures at 1440px and 320px, its verdict marked that finding resolved with disposition `ship`; this verdict covers the scored zoom fix. The single detector run in `.impeccable/stage3-detector.json` returned type-scale advisories, and the implemented catalogue typography is documented in DESIGN.md and its sidecar. Stage 3 is complete; catalogue content remains sample data and the PostgreSQL adapter, admin editor and payment flow remain future work.

To run the catalogue checks against a running production server:

```powershell
$env:FLORINS_PLAYWRIGHT_ROOT = "C:/path/to/playwright-cache-parent"
node scripts/verify-catalogue.mjs
```

`FLORINS_PLAYWRIGHT_ROOT` must be the parent directory containing `node_modules/playwright`, not the package directory itself. The script uses local Microsoft Edge, defaults to `http://127.0.0.1:3000` and accepts `FLORINS_CATALOGUE_URL` for another server origin. It checks published routes at 375/1440px, boundary widths, fixture integrity, filtering/reload, no-JavaScript filtering, 404s, gallery zoom, keyboard/focus and navigation, writing screenshots and `results.json` to `.impeccable/review/stage3/`. Optionally set `FLORINS_CAPTURE_PAGES=0` to skip only the route screenshots; route assertions and targeted boundary/gallery captures still run. For an isolated interaction regression after a completed full run, `FLORINS_INTERACTIONS_ONLY=1` reuses the earlier route results from `results.json`, repeats interaction checks and recaptures zoom evidence. It requires existing route evidence and does not replace the default full-matrix run. The homepage script remains available for historical homepage regression coverage.

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended) and npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Visit http://localhost:3000. Fonts are bundled locally from Fontsource; no runtime Google Fonts request or API key is required. Keep the included font licences in redistributed packages.

## Verification and production

```powershell
npm run db:validate
npm run typecheck
npm run lint
npm run format:check
npm run build
npm start
```

`npm install` and `npm run build` generate Prisma Client. The preview does not query PostgreSQL, so it can build and render before a database is provisioned. Generated code is ignored by Git. The lockfile pins dependency resolution; use `npm ci` for repeatable CI installs.

## Historical Stage 1 verification — 28 October 2026

At the Stage 1 handoff, dependencies were installed and `package-lock.json` was present. Verification passed with Node.js 24.19.0: Prisma schema validation, Prisma Client generation, TypeScript, ESLint, Prettier and the Next.js production build. The then-current production preview and its stylesheet returned HTTP 200 locally, with the main landmark, brand content, Instagram link and noindex metadata present. These results describe the historical foundation; Stage 2 production and browser QA are recorded separately under `.impeccable/review/`; Stage 3 review is tracked under its `stage3/` subdirectory.

The Stage 1 continuation corrected invalid Fontsource CSS imports, removed the PostCSS export lint warning and applied the configured formatter. No database connection, migration or hosting was configured. Stage 2 subsequently added the approved homepage and supplied media; outstanding booking and business-contact decisions remain prerequisites for later workflows.

## Structure

```text
prisma/                     PostgreSQL schema; migrations added when a DB is connected
public/images/              Approved public garment imagery
src/
  app/
    (public)/               Homepage, collections, Bespoke, Atelier, Appointments, About and Contact routes
    (admin)/admin/          Reserved admin boundary, no exposed page
    api/                    Reserved Route Handler boundary
    globals.css             Base accessibility and layout styles
    layout.tsx              Root metadata, fonts and skip link
  actions/                  Reserved Server Actions
  assets/                   Imported asset guidance
  components/
    booking/                Six-step mock appointment experience
    bespoke/                Local validated enquiry builder and previews
    catalogue/              Cards, notices, breadcrumbs and native-dialog gallery
    editorial/              Reusable studio visit invitation
    layout/                 Shared header and footer
    motion/                 Visible-before-hydration, reduced-motion-aware reveal
    ui/                     shadcn-compatible Button and Input source
    editorial-image.tsx     next/image primitive
    fashion-image.tsx        Contained garment image and selected-creation entrance
    hero-film.tsx            Responsive film source and poster selection
  hooks/                    Reserved browser hooks
  lib/
    booking/                Configurable mock services, dates, schema, gateway and DTOs
    catalogue/              Typed DTOs, fixtures, async repository and editing guidance
    auth/                   Reserved server authorization boundary
    config/                 Brand/contact constants and studio gallery slots
    db/                     Lazy server-only Prisma singleton
    validations/            Enquiry schema and bounded reference-image inspection
    utils.ts                Class-name composition
  styles/tokens.css         Shared CSS and Tailwind v4 tokens
  styles/information-pages.css About/Contact content and contact rows
  styles/booking.css        Appointment layout, calendar and task controls
  styles/catalogue.css      Responsive catalogue layouts and gallery states
  styles/editorial-pages.css Bespoke, Atelier, enquiry and studio-visit layouts
  types/                    Shared action result type
PRODUCT.md                  Brand facts and stage constraints
DESIGN.md                   Typography rationale and design system
components.json             shadcn/ui CLI configuration
prisma.config.ts            Prisma CLI datasource configuration
```

Server Components are the default. The header, responsive film, fashion-image motion, reveal, gallery, enquiry and booking components are Client Components. The Stage 4 enquiry uses React Hook Form with `zodResolver` and native date inputs; Stage 5 adds React DayPicker and its own RHF/Zod customer flow. Both remain local and perform no server action. Future server workflows must validate again at their action boundary. Server Actions and Route Handlers belong inside Next.js, with Node.js runtime for PostgreSQL. Stage 3 adds a fixture-backed server repository and no database workflow; do not add a separate backend.

## Database

Supply a PostgreSQL `DATABASE_URL` in `.env` (never commit secrets). The example targets a local development database; the CLI fallback is only a local development convenience. `getDb()` requires a configured URL at runtime. Use your provider's verified TLS settings in production; certificate verification is not disabled.

The initial schema only defines `MediaAsset` metadata. There are no seeded records, user accounts or migrations applied. Once the database exists:

```powershell
npm run db:migrate -- --name foundation
```

Review and commit the resulting migration. Production runs `npm run db:deploy` against its own configured database. Never use `migrate dev` in production.

## Remaining configuration

- Provision PostgreSQL and create the initial migration only in a later authorized database stage.
- Select hosting and set environment variables there. Set the verified canonical origin before enabling indexing; the foundation deliberately uses `noindex` metadata.
- Select the authentication provider and admin roles before creating protected pages. Route groups do not enforce authorization.
- Keep supplied logo, photographs, videos and their recorded origins in ASSETS.md. Obtain approved media and descriptive alt text for any later additions. Use `next/image`; configure exact remote image hosts only if needed. Do not recolour garment photographs.
- Confirm the proposed workflow, appointment duration, availability, lead times, fitting arrangements, notifications and privacy requirements before a later booking backend. WhatsApp and calls are confirmed; other business contacts remain unverified.
- Obtain approved studio-interior, worktable and fitting-space photographs before replacing the three labelled gallery slots.

During Stage 1, Impeccable was loaded from `C:/Users/T490/.codex/skills/impeccable/SKILL.md`, with new-work, init, craft-floor, Read-mode and documentation references. Its context launcher stalled and was stopped; no successful automated context analysis or detector run is claimed by that historical record. Stage 2 established the approved homepage composition and supplied media. Stage 3 extends that monochrome Cormorant Garamond/Manrope system with the approved sample catalogue through the user's chosen direct/code build path. Stage 4 continues that direct/code path with Bespoke, Atelier and a local enquiry builder; Stage 5 adds the mock appointment flow within the same established world. DESIGN.md and `.impeccable/design.json` document the implemented system; final production QA is recorded separately.

The approved scope includes Stage 5 and the subsequently authorized navigation/About/Contact refinement. Further pages, production booking, database integration and other workflows require the user's approval.
