# sleeping any where

A tiny Vercel-ready app that checks whether a remote `http(s)` target is reachable from Vercel.

## What it does

- Accepts a single target URL or hostname
- Sends a server-side `GET` request from a Vercel function
- Reports:
  - reachability
  - HTTP status code
  - elapsed time
  - final URL
  - common failure type such as timeout, DNS, or TLS

## Important note

This is not raw ICMP ping. Vercel serverless functions cannot run classic network ping in the usual sense. This app performs HTTP connectivity checks instead, which is the practical version on Vercel.

## Local development

```bash
npm test
npm run dev
```

Then open:

- http://localhost:3000

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Deploy with the default settings.

The app uses:

- `index.html` for the UI
- `api/check.js` for the serverless checker

## File map

- `index.html` - page structure
- `styles.css` - visual styling
- `app.js` - client-side behavior
- `api/check.js` - Vercel API endpoint
- `lib/check.js` - check orchestration logic
- `lib/target.js` - target normalization and error classification
- `tests/*.test.js` - unit tests
