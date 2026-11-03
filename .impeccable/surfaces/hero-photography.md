# Florins photographic hero

Primary target: src/components/fashion-hero.tsx. Related: src/styles/fashion-hero.css, src/app/(public)/page.tsx. Mode: Persuade. Build path: code.

The user authorizes replacing only the homepage video hero with real supplied photography, the exact new headline/description and two existing route destinations. Preserve the centered fixed navigation, remaining homepage, fonts, monochrome controls and backend. No AI or stock imagery. User's instruction to continue settles implementation without a further design approval round.

THESIS: The black evening gown is the visual proof: full silhouette, sculpted neckline, sequins and deliberate studio pose, with the studio's typography occupying the photograph's quiet grey field.

ASSET SELECTION: All eight PNGs in C:/Users/T490/Downloads/FLORINS inspected together. Desktop slides are 2560×1440; mobile slides 1080×1920. Slide 1/MB1 offer rich African print but a busier focal point; Slide 2/MB2 have a striking ceremonial cape but the lowest figure is clipped in the supplied composition; Slide 3/MB3 have vivid blue and clear detail but the supplied desktop hem is clipped. Slide 4/MB4 retain the complete black gown and a neutral field, with the most cohesive monochrome fashion direction. Desktop/Slide 4.png and MOBILE/Slide MB4.png are copied to public/images/florins-hero-desktop.png and florins-hero-mobile.png; originals stay untouched.

FIRST VIEWPORT: Full-width grey photographic canvas, genuine model to the right, FLORINS and the serif headline to the left. Black text needs no overlay or gradient. Desktop/tablet preserve full height of the landscape image and reframe surrounding negative space. On phones the matching portrait is placed right, copy uses the left negative field, and full-width CTAs sit beneath the hem. No cropping through face, bodice or gown. Source selection uses native picture art direction with Next.js optimized srcsets and eager/high-priority loading, requesting one photo per viewport.

MOTION: One short image reveal using clip-path and opacity, coordinated type entrance. Default content stays readable, reduced-motion disables the sequence. Buttons use the existing square black/white language with restrained hover/focus.

QUALITY BAR: Captures at 375,430,768,1024,1440,1920. Full outfit visible, no body text/CTA over the model, original colour, correct ratio, working collection/appointment routes, fixed readable nav, no overflow, one optimized hero source, no video DOM/network, no-JavaScript photo/copy, keyboard focus and reduced motion. Desktop/mobile browser emulation only; physical phones/Safari not claimed. No approved comp applies to this code-led local extension.
