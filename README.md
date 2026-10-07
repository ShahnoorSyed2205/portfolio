# 369 LTD website

Bilingual (English / Arabic, RTL) marketing site for 369 LTD, Dubai. Built from the client brand strategy and visual identity decks.

**Stack:** Next.js 15 (App Router), Tailwind v4, React Three Fiber (3D hero), Motion, Phosphor icons.
Routes are `/en` and `/ar` (hreflang, canonical, sitemap alternates, JSON-LD in each language). `/` redirects by saved choice or browser language.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Environment (all optional)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production origin used for canonical, sitemap, OG. Default `https://369ltd.vercel.app` |
| `LEAD_WEBHOOK_URL` | Where the contact form posts JSON (Make, Zapier, Slack, CRM). **Without it leads are only logged, not delivered.** |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `_PHONE` / `_WHATSAPP` | Shown in contact section and JSON-LD only when set |

## Where things live

- `src/i18n/en.ts`, `ar.ts`: all copy. Arabic is typed against English, so a missing key fails the build.
- `src/components/HeroScene.tsx`: 3D scene (khatam star, coins, spiral rings). Falls back to a static poster until WebGL is ready, pauses off-screen, static under reduced motion.
- `src/app/globals.css`: brand tokens (navy, lime, gold, cyan), radius and accent rules.
- `public/media`: optimised office photos and videos from the client. `public/brand`: logo assets extracted from the identity deck.

## To confirm with the client before launch

1. **Contact details:** phone in the identity deck is illegible, and the old site shows `info@359ltd.com` (likely a typo). Set the env vars above once confirmed.
2. **Compliance wording:** FAQ and footer say transactions go through identity and source-of-funds checks and UAE law. Confirm this matches real procedure and add licence or regulator details if they exist.
3. **Fonts:** brand primary font is Benton. Libre Franklin is used as a free stand-in. Swap in licensed Benton files when available.
4. **Third-party marks:** the office photos show an exchange UI on the wall screen, and the 3D coins use generic BTC/USDT faces. Check this is acceptable to the client.
5. **Dummy bank details and receipt upload** from the old site were deliberately not carried over.
