# Xpress storefront upgrade

Branded buildless storefront: HTML pages and `assets/` in the repository root. GitHub source repository: e-xpressconvenience/e-xpressconvenience.github.io.

## Included
- Approved Convenience, Delivery and front-basket Delivery Lite logos, prepared as WebP.
- Six-product starting catalogue; Sneakers and Gadgets remain coming soon.
- Basket guidance updates when quantities change. Itau 12.5 kg excludes bicycle delivery; other baskets require pack/route review.
- GPS is requested only on click. Address-only, manual coordinates and optional Leaflet map with draggable pin are supported.
- Explicit destination confirmation and recipient information; persistent address saving is opt-in.
- WhatsApp quote draft; no invented prices, payment processing, booked dispatch or route ETAs.
- Consumer delivery page separated from preserved operations integration.

## Validation
Run `node tests/delivery.test.cjs`. Validate all standalone and inline JS syntax, internal links and unique IDs. Browser checks cover basket changes, empty validation, coordinates, saved details, map load and responsive pages.

## Launch configuration still needed
Confirm exact product packs, packed weights/dimensions, handling, inventory and prices; collection point, service zones, safe equipment limits, operating hours, rider availability and delivery rates. Add a real road-routing service and server-side authoritative quotes before enabling confirmed automatic selection or checkout payments.

Supabase account and operations integrations are inherited and have not been verified live. Audit RLS, role authorisation, order transitions, idempotency and payment confirmation before use. Client-side role fields cannot authorise privileged roles.

## Hosting
Do not deploy the commercial storefront to GitHub Pages. Keep GitHub for source and use commercial-use-compatible hosting. The Sites deployment is an owner-private review version, not the public customer launch. No existing audience or domain is changed.

## Next upgrade priorities
1. Exact prices and stock for a real basket total.
2. Route-aware fees after collection point and service zones are confirmed.
3. Authentic pack photos for salt, sugar and tea once brands are selected.
4. Order history and one-tap reordering after backend verification.
5. Partner portal and timed delivery slots after operations are stable.
