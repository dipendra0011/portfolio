# Design implementation notes

## Figma MCP

- **Server:** `plugin-figma-figma` (connected).
- **Source:** file `3rcSFTiGX4AHXNkylhvB6i`, node `1:166` (landing page).
- **Assets:** URLs in `lib/figma-assets.ts` are Figma MCP CDN links (~7 day TTL). For production, export from Figma to `public/` and swap constants.

## Repo layout / dev

- The app must run from **`portfolio/`** (`cd portfolio && npm run dev`). An empty **`package.json` / `package-lock.json` at the GitHub Pages repo root** caused Next.js to treat that folder as the workspace and fail resolving `tailwindcss`. Those root files were removed; only `portfolio/package-lock.json` should exist.
- **MallocStackLogging** lines on macOS are harmless OS noise (many Node workers). Use `npm run dev:webpack` for fewer workers / quieter logs. The `next` CLI is not global — use `npm run dev` or `npx next dev`.

## Decisions

- **Fonts:** Figma uses Satoshi; **Plus Jakarta Sans** substitutes for display. **Instrument Sans**, **Inter**, and **Poppins** match label/body roles from the file.
- **Section order:** Hero → Recent work → About (Hello) → Expertise → Full-width gallery → Experience → Client logos → Footer (matches vertical composition from design context).
- **Side nav** labels preserve Figma casing (e.g. `eXPEDRIENCE`); **Expertise** card (3) preserves copy including trailing “.T” as in source.
- **Removed** prior generic sections and unused UI primitives after aligning to this file.
- **Contact:** `/contact` route with `ContactPage` section; **`lib/site-contact.ts`** holds `CONTACT_EMAIL` so hero / recent work / header stay consistent with the mailto target.
