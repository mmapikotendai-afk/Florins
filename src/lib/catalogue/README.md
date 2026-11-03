# Catalogue data boundary

repository.ts now implements CatalogueRepository with Prisma/PostgreSQL. Only published products belonging to published collections are visible. Samples require explicit development/test mode. Invalid/mismatched paths use the existing not-found UI; database failures use the route error boundary, with no fixture fallback. Public routes render dynamically.

fixtures.ts is the development seed source only. Stable IDs, configurable slugs, ordered local photos, optional sizes/fabric and integer minor-unit prices map to existing DTOs. Admin configuration validates local /images/ paths with alt text/dimensions. No upload or remote proxy exists.

Development names, fabrics, sizes and making states remain labelled sample data. Mark records non-sample only after verification. Root metadata stays noindex; no Product/Offer structured data is emitted. Existing gallery keyboard/zoom and contextual routes remain. Appointment actions reach /appointments; enquiry paths retain manual contact.
