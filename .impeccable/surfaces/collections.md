# Stage 3 collections

Primary target: src/app/(public)/collections/page.tsx
Related targets: src/app/(public)/collections/[collection]/page.tsx, src/app/(public)/collections/[collection]/[design]/page.tsx
Mode: Experience, with accessible catalogue browsing and enquiry.
Build path: code, explicitly chosen by the user.

THESIS: Extend the established original-colour garment photography and monochrome editorial system into an editable catalogue. Garments, complete silhouettes and considered typography lead; browsing controls remain quiet and useful.

FIRST VIEWPORT: White masthead with Collections active, semantic breadcrumbs, expressive collection typography, restrained explanatory copy and an unmistakable sample-catalogue disclosure. The landing page pairs staggered, full-silhouette collection photographs with names, descriptions and View Collection actions. Collection pages combine a concise introduction and cover with borderless design cards. Detail pages place a large contained photograph beside the design information and enquiry actions.

INTERACTION: Category filtering works as a GET form with readable query parameters and survives reload. Individual design URLs are human-readable. Thumbnails select real alternate photographs; native dialog zoom preserves the aspect ratio, supports keyboard controls, Escape and focus restoration. No cropped substitute angles or synthetic garment photographs.

TRUTH: Approved photographs are real. All catalogue entries, categorisation, names, sizes, fabrics and making states are development samples, prominently labelled throughout. No invented actual product records, price or stock. Price fields are optional and remain unset in the fixtures. Proposed categories come from editable configuration; there is no fabricated fifth collection or premature admin interface.

QUALITY BAR: Preserve the Stage 2 palette, Cormorant/Manrope typography, square controls and original garment colours. Full silhouettes, generous spacing, useful empty/invalid-route states, readable long category names, visible focus and working navigation at 320–1920px. New routes and interactions must be inspected in production renders.

BOUNDARY: Typed asynchronous repository and DTOs are replaceable by a future PostgreSQL adapter. No database provisioning, migrations, authentication, admin editor, stock system or online payments in Stage 3.
