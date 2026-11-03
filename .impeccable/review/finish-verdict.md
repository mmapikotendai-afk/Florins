## verdict

1. Resolved — responsive-results.json records one matching video filename during ordinary navigation at every viewport. Capture-time requests are separated; the extra 1440px mobile request coincides with the capture tool changing the viewport to 1px, then restoring it.
2. Resolved — enlarged labels are visible in regenerated desktop, mobile and 320px crops. DESIGN.md records 12px metadata/action labels, 13px captions/links, 14px supporting copy and the 11px compact mobile appointment action. Text remains contained at 320px.
3. Resolved — all seven exact required screenshot paths were re-read. Full-page production captures retain the document top and complete content, with no development indicator or issue badge. No regressions from this fix batch observed.

## remaining

Clear. Ship covers the three scored fixes, not a new review of the whole surface.

disposition: ship
