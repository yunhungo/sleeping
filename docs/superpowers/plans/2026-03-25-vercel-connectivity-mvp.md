# Vercel Connectivity MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small Vercel-deployable site that checks whether a remote `http(s)` target is reachable from Vercel and shows latency, status, and failure reasons.

**Architecture:** A static front end serves a single-target checker UI, while a Vercel serverless function performs the outbound request so the browser never hits `CORS`. Shared utility code normalizes targets and classifies common network failures, keeping the UI simple and the API logic testable.

**Tech Stack:** Vanilla HTML/CSS/JS, Node.js built-in test runner, Vercel serverless functions.

---

### Task 1: Define target normalization and error classification

**Files:**
- Create: `lib/target.js`
- Create: `tests/target.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTarget, classifyFetchError } from "../lib/target.js";

test("normalizeTarget adds https when the scheme is missing", () => {
  assert.equal(normalizeTarget("example.com"), "https://example.com/");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/target.test.js`
Expected: FAIL because `lib/target.js` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement URL normalization and a small error classifier for timeout, DNS, TLS, and network failures.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/target.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/target.js tests/target.test.js
git commit -m "feat: add target normalization helpers"
```

### Task 2: Build the Vercel check endpoint

**Files:**
- Create: `api/check.js`
- Modify: `lib/target.js`

- [ ] **Step 1: Write the failing test**

Create a small API-level test for request validation and response shape.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/api-check.test.js`
Expected: FAIL because the handler is not implemented.

- [ ] **Step 3: Write minimal implementation**

Parse the incoming `target`, normalize it, perform a timed `fetch`, and return JSON with `ok`, `reachable`, `statusCode`, `elapsedMs`, `finalUrl`, and `error`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/api-check.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/check.js lib/target.js tests/api-check.test.js
git commit -m "feat: add connectivity check api"
```

### Task 3: Build the single-page UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`

- [ ] **Step 1: Write the failing test**

No automated browser test is required for the MVP; validate behavior with a manual smoke test.

- [ ] **Step 2: Run test to verify it fails**

Run: open the page locally and confirm the button has no behavior before implementation.

- [ ] **Step 3: Write minimal implementation**

Create an input, submit button, result card, loading state, and friendly error messaging.

- [ ] **Step 4: Run test to verify it passes**

Open the page locally and check that successful and failed requests render correctly.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "feat: add connectivity checker ui"
```

### Task 4: Add deployment and project docs

**Files:**
- Create: `package.json`
- Create: `vercel.json`
- Create: `README.md`

- [ ] **Step 1: Write the failing test**

Verify the project has a `test` script and deploy instructions.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: fail until the scripts and docs exist.

- [ ] **Step 3: Write minimal implementation**

Add a test script, keep the Vercel config minimal, and document local/dev/deploy steps.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add package.json vercel.json README.md
git commit -m "docs: add deployment instructions"
```
