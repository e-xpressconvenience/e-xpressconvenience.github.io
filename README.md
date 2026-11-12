# Express Convenience — enhanced website

Static, build-free website for the existing GitHub Pages address. Original brand, contact details, product assets and Supabase project configuration are retained.

## Deploy to the existing GitHub repository

1. Extract the ZIP.
2. Upload the six HTML pages, `assets/`, `sw.js`, and `manifest.webmanifest` into the root of `e-xpressconvenience/e-xpressconvenience.github.io`, replacing matching files. Keep the assets directory structure.
3. Commit the update to the branch selected in GitHub Settings → Pages (normally `main`).
4. Once GitHub Pages completes deployment, refresh the website. The updated service worker replaces the previous Express cache.

No build command or hosting change is required. This package has not been pushed or deployed automatically.

## Changes

- Shared sticky header and accessible mobile menu on all six pages; basket badge available throughout.
- Cleaner logo framing, more compact layouts, restrained transitions, improved touch targets and reduced-motion support.
- Clearer customer copy, shop-first homepage action, and category links that open filtered products.
- Category filtering, search, basket feedback and persisted quantities.
- Checkout restores saved address/notes, includes current form values in the WhatsApp draft, and allows removal of saved GPS coordinates.
- WhatsApp enquiry is the primary checkout path. Existing signed-in delivery submission is retained in a separate disclosure, with address validation and a pending-request button lock.
- Fixed malformed JavaScript that prevented the entire Delivery Centre script from executing.
- Deferred auth-event work outside the auth callback; rider location watching stops on sign-out.
- Account email-confirmation instructions are no longer immediately overwritten by a refresh.
- Service worker caches only same-origin static website resources, not third-party APIs/auth traffic, and clears obsolete Express caches.

## Validation completed

- JavaScript syntax checks for all inline and standalone scripts.
- Local page/asset link and duplicate-ID checks.
- Desktop visual review and phone-sized iframe layout review at 360/390px.
- Browser checks: homepage category navigation, add to basket, increment quantity, reload persistence, saved address restoration, no-results search, mobile menu expansion, signed-out rider dashboard.
- No application console errors observed during those browser flows.

## Still requires owner testing

The existing remote backend was not changed. No live orders, accounts, payments, or messages were created during testing. Signed-in customer/rider/admin access, row-level security, database functions, routing, delivery fees and dispatch require a test account and backend review before relying on them operationally. Preventing concurrent duplicate orders across devices requires server-side idempotency; the UI lock only prevents repeated clicks while a request is pending.

Catalogue prices, stock, pack sizes and coverage remain confirmation-based. No prices, delivery guarantees or merchant details were invented. Payment options express a preference; this site does not collect payments.
