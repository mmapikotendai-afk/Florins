---
name: FLORINS
description: Exclusive Fashion Designer — monochrome editorial website and sample catalogue
colors:
  ink: "#000000"
  paper: "#FFFFFF"
  surface: "#F7F7F7"
  line: "#E5E5E5"
  charcoal: "#262626"
typography:
  display:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "clamp(3.5rem, 8vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  small:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "0.875rem"
  collection-title:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "clamp(3rem, 5.3vw, 5rem)"
    lineHeight: 1.03
  detail-title:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "clamp(2.5rem, 4vw, 4.5rem)"
    lineHeight: 1.03
  editorial-title:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "clamp(3.5rem, 5.4vw, 6rem)"
  booking-intro:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "3.5rem"
  booking-intro-mobile:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "3rem"
  booking-step:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "2.5rem"
    lineHeight: 1.08
  booking-step-mobile:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "2rem"
    lineHeight: 1.08
  booking-summary:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "1.75rem"
  booking-reference:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
  supporting:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "0.8125rem"
  label:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "0.75rem"
  appointment-compact:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "0.6875rem"
  wordmark:
    fontFamily: "Cormorant Garamond Variable, Georgia, serif"
    fontSize: "1.8rem"
    letterSpacing: "0.08em"
rounded:
  control: "0rem"
spacing:
  unit: "0.25rem"
  group: "1.5rem"
  separation: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
---

## Overview

**Creative North Star: "The garment gets the colour."**

An editorial identity in black and white, framing supplied original-colour fashion photography and film. The approved Stage 2 homepage extends the Stage 1 typography and spacing foundation with asymmetric garment imagery, a quiet masthead and alternating light and dark editorial sections. The user's approved composition and supplied media pin this visual world. Stage 3 extends that established system through the directly implemented sample catalogue; its browsing controls stay quiet, and its photographs preserve full silhouettes. Stage 4 continues the user's code-led extension preference with Bespoke and Atelier editorial pages and a local enquiry-draft builder; it introduces no replacement identity or approved-comp claim. Stage 5 adds an Operate-mode appointment demonstration in the same code-led world, using calm task typography and purposeful selection controls.

**Key Characteristics:**

- Expressive serif headings and quiet, legible navigation.
- Asymmetric composition with generous negative space.
- Flat surfaces, square controls and fine rules.

## Colors

Ink is the primary foreground and action surface. Paper is the main ground, appropriate for a legible fashion catalogue viewed in everyday light. Surface separates supporting content; line provides subtle nonessential dividers. Charcoal supplies secondary text and high-contrast input boundaries. Light grey never conveys essential text or a form boundary alone. Validation uses words and border weight, keeping the specified monochrome palette.

**The Original Colour Rule.** Do not tint, desaturate, or otherwise recolour garment photography.

## Typography

Cormorant Garamond + Manrope is selected from the user's suggested pairs. Cormorant's open, expressive forms support fluid editorial sizes; Manrope has clear body forms and restrained navigation. Bodoni Moda + Inter offers a sharper magazine voice, but Bodoni's extreme stroke contrast is more delicate at smaller mobile sizes. Cormorant is retained here because the user's brief explicitly proposes it and its weight-400 forms remain expressive without relying on fragile hairlines. Both families are locally bundled variable WOFF2 fonts.

Use weight 400 for prose and headings, 500 for controls. Apply display tracking only to headings and modest positive tracking only to the wordmark. Do not uppercase body copy. Body measure caps at 70 characters. Display, heading and subheading use the fluid scales in `src/styles/tokens.css`.

Stage 2 supporting copy uses Manrope at 14px, captions and text links at 13px, and navigation, metadata and uppercase action labels at 12px. The compact mobile appointment action is 11px with a 44px minimum target. These are supporting roles; primary prose remains 16px. The masthead wordmark is 1.8rem, reducing to 1.375rem below 768px; the hero identity is 1.5rem with 0.16em tracking and the footer wordmark is 2rem.

The hero overrides the shared display scale with `clamp(3.25rem, 5.3vw, 6rem)`, `clamp(3rem, 5.6vw, 4rem)` below 1280px, and `clamp(3.25rem, 12vw, 5rem)` below 768px. Intro headings use `clamp(2.5rem, 4vw, 4rem)`; bespoke and consultation headings use `clamp(4rem, 7vw, 6rem)`, becoming `clamp(3.5rem, 16vw, 5rem)` on phones. Homepage collection titles retain the shared subheading scale. Stage 3 individual collection titles use `clamp(3rem, 5.3vw, 5rem)` and design detail titles use `clamp(2.5rem, 4vw, 4.5rem)`, both with line-height 1.03. Catalogue supporting prose uses the established 14px role, captions/filter/specifications use 13px, and breadcrumbs, metadata and action labels use 12px. The catalogue landing title uses the shared display scale, becoming `clamp(3.5rem, 12vw, 5rem)` below 768px; zoom-dialog headings use the shared subheading scale, becoming 1.5rem below 768px.

Stage 4 editorial hero titles use `clamp(3.5rem, 5.4vw, 6rem)`, changing to `clamp(3rem, 5.8vw, 4.5rem)` below 1024px and `clamp(3.5rem, 12vw, 5rem)` below 768px. Upright and italic Cormorant share the established weight-400 voice. Form labels and process prose use 14px, file inputs and draft text use 13px, and captions, optional labels, hints, errors and privacy notes use 12px. Main fields retain 16px text.

Stage 5 uses fixed task roles within the existing families: the appointment introduction is 3.5rem, reducing to 3rem below 768px; step headings are 2.5rem at line-height 1.08, reducing to 2rem below 768px; summary headings are 1.75rem; the demo reference is 1.25rem Manrope at weight 500 with tabular numerals. Body, labels and field text keep the existing 16/14/13/12px hierarchy. These are intentional Operate roles, not a new identity.

## Layout

Tokens live in `src/styles/tokens.css`, including a 4px base scale, fluid gutters, section space, container widths, borders and motion. Tailwind's theme maps directly to them. Spacing progresses through 4, 8, 12, 16, 24, 32, 48, 64, 96 and 128px. The outer container caps at 90rem. Breakpoints are 40, 48, 64, 80 and 96rem; the base layout must work at 320px without a breakpoint.

Stack content naturally on phones; introduce asymmetry through column spans on larger screens. No fixed viewport-height content, forced image distortion, or horizontal-overflow hiding that masks layout bugs. The desktop hero pairs 44% copy with 56% film, changing to 45%/55% below 1280px and copy above film below 768px. Its minimum height may grow with content. Garment photographs use 3:4 rectangular frames and `object-fit: contain`, preserving complete silhouettes. Responsive images specify `sizes`.

The homepage originally used a 1199px compact threshold; the current navigation refinement uses 1279px for compact navigation, the medium hero and two-column footer, alongside 767px (stacked sections and portrait film), 359px (hide the masthead logo image to preserve action space), and 1600px (align hero copy with the capped container). Collections stagger alternate images by 96px on larger screens, then stack evenly on phones. Selected creations use varied three-column proportions, becoming a two-column arrangement with a larger first photograph on phones.

Stage 3 collections use a two-column staggered image layout with a 9% column gap and 96px alternate offset. Below 768px the gap is 24px and offset 48px; below 600px it becomes a single column without offsets. The landing design edit has three columns, two below 1024px and one below 600px. Individual collections use two design columns capped at 1100px, becoming one below 600px. Collection introductions pair 1.4fr copy with a 0.6fr contained cover, then stack below 768px. Detail pages pair a 1.2fr gallery with 1fr information and an 8% gap; information is sticky at top 128px on desktop, static below 1024px, and stacked below 768px. Filters wrap naturally and retain 48px controls. Breadcrumbs and long design names wrap.

Stage 4 Bespoke heroes pair 1fr copy with 1.1fr contained garment photography, with an 8% gap; Atelier reverses the balance and places photography first visually on desktop. Below 1024px the gap is 5%, and below 768px both stack with 40px gaps and natural content order. Introduction, process, fittings and visit sections use two columns with 12% gaps, stacking below 768px. The proposed-process introduction sticks at 128px on desktop and becomes static below 1024px. The enquiry pairs 0.8fr introduction with 1.2fr form at a 9% gap, becomes 1fr/1.3fr with a 6% gap below 1024px, then stacks below 768px. Contact/date fields use two columns on desktop, one at tablet widths, two in the stacked mobile section, and one below 480px. Draft actions stack below 480px.

Inspiration photographs use staggered 1fr/0.7fr/1fr columns, becoming a wide leading image above two smaller images on phones. The three studio-gallery slots use 1fr/1.25fr/0.85fr columns with 15% and 35% offsets; below 768px they stack without offsets. Slot frames change from 3:4 to 4:3, remain visibly labelled placeholders and use the existing surface and line colours. Dark measurement and studio-visit sections invert text and focus outlines to paper.

Stage 5 appointments cap the outer layout at 1280px. A two-column introduction leads to a six-column progress row and 2fr task/1fr summary layout with an 8% gap. The off-white summary sticks at top 128px. Below 1024px the task ratio becomes 1.8fr/1fr with a 32px gap; below 768px it stacks with a 40px gap and a static summary, while progress wraps into three columns. Services and customer fields use two columns on desktop, one on tablet, two again in the stacked mobile layout and one below 480px. Time options use three columns on desktop, two on tablet, three in the stacked layout and two below 480px. Narrow action buttons fill the width, with the primary action above Back. Confirmation is a centered reading column capped at 800px.

## Elevation & Depth

Use flat surfaces. Dividers are a single light-grey hairline. Controls use dark borders where the boundary carries meaning. No default shadows, gradients or decorative texture.

## Shapes

Controls have square corners. No ornamental cards or pill-shaped containers. Photographs retain rectangular editorial framing unless approved art direction establishes another treatment.

## Components

Button and Input are locally owned shadcn/ui-style primitives using Radix Slot, CVA and `cn`, with CLI aliases in `components.json`. Buttons provide primary, outline and ghost variants; minimum height is 48px. Include explicit accessible labels and adjacent explanatory error text for form inputs. Invalid fields use `aria-invalid` with textual recovery instructions.

All interactive elements have a visible 2px focus outline offset by 4px. Keyboard skip navigation targets the main landmark. Hover never carries essential meaning. Links use a distinct underline on interaction; Lucide icons are decorative when text already names the action.

Motion durations are 160ms for feedback, 280ms standard and 600ms for entrances, with `cubic-bezier(0.16, 1, 0.3, 1)`. Motion components keep content visible before hydration (`initial={false}`). The hero copy enters once with an 8px vertical movement; selected creations enter once with 16px movement. Other garment images do not animate into view. Numeric Motion transitions match the shared tokens. Reduced-motion preferences disable these entrances, smooth scrolling and nonessential CSS transitions. Text-link hover expands the icon gap from 12px to 18px; collection hover lowers image opacity to 0.92.

The authorized navigation refinement uses a fixed white masthead, 112px high at desktop widths of 1280px and above and 80px below. The supplied logo is centered between Home/Collections/Bespoke on the left and The Atelier/About/Contact on the right, followed by the booking action. A three-column grid reserves a 220px center with 24px gaps. The public content wrapper reserves the matching header height; scroll padding and target margins use header height plus 24px.

Header and footer share `mainNavigation` in `src/lib/config/navigation.ts`: `/`, `/collections`, `/bespoke`, `/atelier`, `/about` and `/contact`. Current-page states use pathname matching with `aria-current="page"`, including nested collections and the `/appointments` booking action. No homepage visibility observer determines the active page. Compact navigation focuses the first link, contains keyboard traversal, supports Escape with restored toggle focus and closes on navigation or desktop resize while restoring body scrolling. Header selections start at the top even when repeating the current page. `RouteStart` starts changed routes at the top unless an explicit hash exists; deliberate contextual links remain intact. Footer Back to top targets local `#main-content`.

Stage 2 originally used homepage anchors, Stage 3 added Collections, and Stage 4 added Bespoke/Atelier destinations. Global booking and visit actions continue to reach the Stage 5 `/appointments` demonstration; the manual bespoke draft remains at `/bespoke#enquiry`. Instagram remains the verified social profile. WhatsApp/calls use +263 771 640 916 through `site.ts`, with `https://wa.me/263771640916` and `tel:+263771640916`. Footer contacts remain vertically start-aligned with a 4px gap. No action creates an actual booking.

About and Contact are Read surfaces within the existing editorial world. About reuses contained approved garment photography with a caption avoiding stock implications. Contact uses ruled channel rows and a surface-ground appointment-only locality panel with verified WhatsApp, phone and Instagram destinations. Its two-column introduction, details and visit sections use 12% gaps and stack below 768px with 32px gaps; locality-panel padding changes from 40px to 28px. Existing type roles and tokens apply. No studio interiors, street address, hours, email or new business history are invented.

The hero film uses a 16:9 desktop frame and a 9:16 frame below 768px, always with `object-fit: contain`. The supplied desktop film's blurred side panels remain part of the asset. One responsive source is selected after hydration, with muted inline looping playback and `preload="none"`. Reduced motion and data saving select the matching poster without requesting video. Playback or source errors retain a poster. Text stays outside the model's frame; the film caption moves into a small black label on phones.

Stage 3 catalogue cards are borderless editorial entries with 3:4 contained photographs and clear sample labels, not raised commerce panels. A surface-ground sample notice distinguishes approved photographs from illustrative names, categories, sizes, fabrics and making status. All fixture prices remain null and render as `Price on enquiry`; sample making states never assert stock. Proposed categories are editable source configuration, with no administration UI. The typed asynchronous repository can later receive a PostgreSQL adapter; Stage 3 makes no database connection or migration and offers no online payment.

The category selector submits a standard GET form to `/collections#designs`, preserving a readable `category` query parameter through reload and without JavaScript. Clear-filter and recoverable unknown-filter states are explicit. Empty collections offer a return to all designs; invalid or mismatched collection/design URLs use the catalogue not-found view. Enquire opens the verified Instagram profile; Book appointment now reaches the `/appointments` demonstration and does not create a real booking.

The detail gallery presents genuine supplied alternate photographs when available. Its native modal dialog fits the full photograph at 100%, retains `object-fit: contain`, and provides 100-300% zoom in 50% steps, reset and scrollable exploration. Multiple-photo entries add thumbnails, previous/next controls and left/right arrow selection. Zoom begins centered and preserves the current view center when enlarged or reduced, including after manual panning. Opening the dialog, resetting zoom or changing photographs restores the centered 100% view. Native Escape and modal focus handling return focus to the opener; loading and image-error messages accompany `aria-busy`. The dialog uses a black 80% backdrop, square charcoal boundary and white controls. Single-photo entries do not fabricate alternate views.

Stage 4 enquiry fields use React Hook Form and Zod, with explicit labels, linked hints and inline errors, an alert summary and visible invalid borders. Required fields are full name, email, phone, occasion and design description; preferred appointment date, event date, references and notes are optional. Dates use native controls, validate real calendar days against Africa/Harare today, and require a preferred date on or before the event when both exist. The prepared draft gains heading focus; edits invalidate it. Copy provides live feedback and selects the read-only draft for manual copying if clipboard access fails. Without JavaScript, draft preparation is disabled and a direct contact alternative is explained.

Reference previews remain local: at most three JPEG/PNG/WebP files, each nonempty and no larger than 5 MiB, 20 megapixels or 8192px on either edge. Signature checks and browser decoding precede preview creation. A failed selection adds none of its files; remove controls and unmount cleanup release object URLs. Selection has explicit checking/error states. No image bytes are uploaded. Enquiry values stay in browser memory, outside URLs, browser storage and application network requests. The WhatsApp destination contains only the confirmed business number, with no prefilled personal text. The draft-ready Open WhatsApp action announces a new tab and uses `target="_blank"` with `rel="noopener noreferrer"`, preserving the local draft for reference. Visitors copy, paste and manually send their draft; original reference files must be shared separately. Draft readiness never claims delivery or a confirmed appointment.

Bespoke's seven-step journey is explicitly proposed: Consultation, Design Discussion, Fabric Selection, Measurements, Creation, Fitting and Final Collection. Workflow, timing, fabric arrangements, fitting counts and costs await studio confirmation. Atelier garment photographs are captioned as real creations at events or celebrations, not interiors. No studio images are available; `studio-gallery.ts` contains three clearly marked replaceable slots for the interior, worktable and fitting space. Only approved photographs of the actual studio may replace them. Milton Park, Harare, Zimbabwe and appointment-only visits are confirmed; street address and hours remain unverified.

Stage 5 appointment flow has six explicit steps: Service, Date, Time, Your details, Review and Submit. A demonstration notice remains in every phase, including confirmation. Native radios select services and time slots; React DayPicker supplies timezone-aware keyboard calendar navigation. Monochrome square calendar controls distinguish available bordered days, selected ink/paper days, unavailable surface-ground struck-through days and past italic days. Accessible labels and the legend name these states. Disabled times remain visible with explanatory text. Selection borders and visible focus carry meaning without a colour accent.

Service changes clear date and time; date changes clear time; customer details survive back navigation. Continue validates the latest values for the current step, with field errors and focus on the first invalid field; step transitions focus the new heading. RHF uses submit-mode validation to keep blur-time errors from moving the action during activation. Required customer fields are name, email and phone; event date and notes are optional, and an event cannot precede the chosen appointment. Loading, retry, empty-date/time and stale-selection recovery states remain explicit. Review offers edit controls and repeats service, duration, date, time, customer and real studio location.

The six editable service fixtures use sample durations only. The rolling 56-day calendar, example 09:00-16:00 window, 30-minute start intervals, blocked days and intervals are mock availability, not studio policy. Dates and slots use Africa/Harare (UTC+02:00); the current clock refreshes expired choices. Selection is revalidated before advancing and again on final mock submission. An explicit demo acknowledgement and client submission lock prevent accidental duplicate activation. An instance-local promise map reuses concurrent submissions with the same request key; it creates no reservation or inventory mutation.

Confirmation displays a `DEMO-` reference, customer/service/date/time/location details and `demo-only` status, visibly labelled `Demo only - not reserved`. It remains in current component memory and is lost on reload, leaving the page or starting another demo. No booking POST, persistent browser storage, personal values in URLs or notifications occur. Real visits still require direct WhatsApp contact. The typed gateway intentionally permits only demo mode/status; Stage 6 must introduce authoritative server transport, verified configuration and production states, server validation, transactional PostgreSQL conflict handling and request-bound idempotency. Editing a mock flag cannot enable production reservations. Stage 5 adds no admin UI or database schema/migration.

## Do's and Don'ts

- Keep the supplied monochrome palette and original garment colours.
- Let supplied photographs, film and garment detail carry storytelling.
- Preserve responsive typography, semantic order and visible focus.
- Keep catalogue fixtures prominently labelled as samples; do not present proposed categories or illustrative specifications as confirmed products, prices or availability. Do not invent testimonials.
- Do not add gradients, arbitrary accents or decorative shadows. Catalogue grids stay borderless and serve browsing; preserve the editorial homepage composition.
- Scope includes Stage 5 and the subsequently authorized navigation/About/Contact refinement. Later pages, administration, database work, payments and production booking workflows require agreed scope. Keep the existing noindex metadata. Preserve proposed-process and missing-studio-photo disclosures; never imply a prepared draft has been sent or a demo confirmation reserves a booking.

## Stage 6 booking behavior

The established Operate layout, palette and type roles remain. The active gateway now saves appointment requests to PostgreSQL and exposes in-tab reschedule/cancel controls. A development notice distinguishes test data; production requests explicitly await studio confirmation. Customers can keep their existing request while leaving reschedule mode. Mutation retries retain the same key after an uncertain response. No new visual tokens or type roles are introduced. Earlier Stage 5 demo-only behavior descriptions are historical.
