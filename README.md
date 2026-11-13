# Xpress storefront upgrade

Branded buildless storefront: `dist/`. GitHub source repository: e-xpressconvenience/e-xpressconvenience.github.io.

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

## Expanded sourcing direction
Sneakers and Gadgets now accept sourcing requests; they are not future-only departments. `source.html` captures product/list, specifications, condition, total budget, preferred seller, delivery area and requested timing. Search misses retain the query and department when opening the sourcing form. Customers can include the existing catalogue basket in the WhatsApp draft. No request is sent automatically.

This is an assisted sourcing service, not a live index of Maseru retailers. Build a verified offer catalogue next: product/variant, merchant and branch, purchase price, selling price or fee, stock evidence, last-checked timestamp, expiry, packed weight, handling, preparation time and collection location. Supplier price lists, permitted imports and merchant-confirmed updates should feed it. Do not present promotional flyers as live stock or claim retailer partnerships without agreements.

Operational timing should include source confirmation, collection travel, queue/preparation, multi-stop consolidation, packing and last-mile travel. Publish a range after verification; update it if a source falls through. Use category-based contribution targets: low markup on suitable staples, disclosed sourcing charges where needed, and appropriate margins for high-value products. Reinvest measured profits in fast-moving stock and storage once repeat demand supports it.

## Scan & search (November 2026)

`scan.html` supports camera barcode scanning, photo capture, image upload, and manual barcode entry. ZXing Browser 0.1.5 is bundled as a fallback for browsers without BarcodeDetector. Tesseract.js 6.0.1 reads printed English labels in a local Web Worker; its worker, WASM core and English language data load from jsDelivr on demand. Photos are not sent to Xpress. First-use downloads require connectivity and may be slow on mobile data. Camera use requires HTTPS and user permission. Cancel, page exit and backgrounding stop the stream. Uploads accept JPEG/PNG/WebP up to 12 MB; OCR has a 75-second timeout. This is label OCR and barcode matching, not visual object recognition.

Matches require customer confirmation before adding to the existing quote basket. No real product barcodes have been supplied: `catalogue-data.js` intentionally contains an empty mapping. Never guess barcodes. Add verified exact pack/variant GTINs as `barcodes: {productId: ['digits']}`. Valid unlisted codes produce an honest no-match message. Label matches work immediately with the six existing products.

`search-engine.js` supports aliases (including khemere, phoofo, letswai and tsoekere), prefix matching, conservative single-edit spelling tolerance, GTIN checksum validation and exact variant offer selection. Normal text search uses all query words; photo OCR ranks possible label matches for customer review.

Pricing groundwork: `quote()` uses integer lisente, supplier cost, handling allowance, fixed markup, markup basis points and payment-fee basis points. It rejects stale/future-dated, unavailable, unverified, malformed and non-LSL offers. `scripts/price-offers.cjs` reads private offer input and outputs a review report. Delivery is not included or estimated by this calculator. No approved supplier offers or margins are configured, and the calculator is not yet connected to checkout. Keep supplier costs outside the public repository. Before accepting payment, a server must independently recheck/reserve stock, calculate a signed quote and final basket delivery fee; client arithmetic is never authoritative.

Input for the operator utility has `offers`, `requests` and `policies`. Offers require `productId`, `variantKey`, `sellerId`, `sellerVerified`, `stockStatus`, `currency`, `sourceUrl`, `supplierCostMinor`, `checkedAt`, `expiresAt`. Requests specify `productId`, `variantKey`, `policyKey`. Policies have `handlingMinor`, `fixedMarkupMinor`, `markupBps`, `paymentFeeBps`. Run `node scripts/price-offers.cjs /absolute/private-offers.json`.

Validation: `node tests/search.test.cjs` covers pricing arithmetic, fee handling, expiry, verification, exact variants, barcode checksums, aliases and typos. Browser QA confirmed label OCR with a synthetic Ginger Smash label, confirmed add-to-basket, barcode image decoding and invalid/unmapped barcode handling. Live physical-camera use and the customer's Android browser still require device testing. No retailer feed, payment processing or automatic Maseru-wide stock search is connected by this release.
