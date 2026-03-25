# sleeping any where

A tiny web app that checks whether a remote `http(s)` target is reachable.

## What it does

- Accepts a single target URL or hostname
- Sends a server-side `GET` request from a serverless function
- Reports:
  - reachability
  - HTTP status code
  - elapsed time
  - final URL
  - common failure type such as timeout, DNS, or TLS

## Local development

```bash
npm test
npm run dev
```

Then open:

- http://localhost:3000

## Deploy

1. Push the repository to GitHub.
2. Import it into your hosting platform.
3. Deploy with the default settings.

The app uses:

- `index.html` for the UI
- `api/check.js` for the serverless checker

## File map

- `index.html` - page structure
- `styles.css` - visual styling
- `app.js` - client-side behavior
- `api/check.js` - serverless API endpoint
- `lib/check.js` - check orchestration logic
- `lib/target.js` - target normalization and error classification
- `tests/*.test.js` - unit tests
