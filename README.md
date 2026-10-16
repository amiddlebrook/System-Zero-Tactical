# System Zero Tactical

**A local-first, responsive operational workspace deployed on Cloudflare Workers Static Assets.**

System Zero Tactical is a browser-based control board for tracking operational registers, asset inventories, action items, and workload analytics. It is a **workspace**, not a real-time network monitor. The bundled dataset is fictional, and status readings are explicitly entered by the user.

## Features

- **Command overview** — actual counts from your saved local operations and tasks, recent changes and priority queue.
- **Operations register** — add, filter, update status, and remove operations.
- **Asset network** — manually track gateway and node statuses without implying live connectivity.
- **Action board** — add, complete, reopen, and remove tasks.
- **Analytics** — charts based on saved operation states and priorities.
- **Portable data** — export/import versioned JSON snapshots; localStorage persistence.
- **Responsive design** — desktop sidebar, mobile navigation, keyboard-focus styles, reduced-motion support.

### Architecture

```text
GitHub (master)
   │
   ├── Pull request → npm ci → TypeScript → Vite build → smoke test
   └── Push/merge  → same checks → GitHub Actions → Wrangler
                                                  ↓
                                      Cloudflare Workers
                                         Static Assets
                                                  ↓
                                        Browser workspace
                                          localStorage
```

There is **no database**, server runtime, API key, external CDN, subscription, paid third-party service, or mandatory custom domain. The application can run within Cloudflare's free Workers plan, subject to Cloudflare's published free-tier limits. GitHub Actions on a public repository can run at no monetary cost under standard free usage.

## Development

Use Node.js 22 or later.

```bash
npm ci
npm run dev
```

Validate the production build:

```bash
npm run check
npm run preview
```

## Cloudflare deployment

1. Create a free Cloudflare account.
2. In Cloudflare, create a scoped API token with **Edit Cloudflare Workers** permission for that account.
3. In this GitHub repository's **Settings → Secrets and variables → Actions**, create:
   - `CLOUDFLARE_API_TOKEN` — scoped Workers deployment token.
   - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID.
4. On a push to `master`, the [CI/CD workflow](.github/workflows/cloudflare.yml) verifies the build and deploys with `cloudflare/wrangler-action@v4`.
5. The default hosted URL will follow the pattern `https://system-zero-tactical.<your-subdomain>.workers.dev`. Obtain the exact URL from Cloudflare's dashboard or the deployment logs.

Without these two GitHub secrets, build verification still runs; the deploy step is **skipped** instead of falsely reporting a live deployment. Deployments do not require a custom domain or any payment method specifically for this app.

For a one-off manual deployment after `npm run build`, authenticate Wrangler using `npx wrangler login`, then run `npx wrangler deploy`.

## Data and safety boundaries

- All input is stored in browser **localStorage** under `system-zero-tactical-workspace-v2`, not in Cloudflare or GitHub.
- Initial records are intentionally **fictional sample data**. Dashboard charts are computed from these records. Asset statuses are not hardware or network probes.
- The app does not support user accounts, encryption at rest, authorization, shared edits, real-time feeds, or audit-grade retention.
- Do not store secrets, personal identifiers, sensitive operational material, or classified data in this unauthenticated local workspace.
- Clear browser storage will erase the local workspace. Use **Export** to back up data and **Import** to restore it. Import accepts JSON snapshots no larger than 1 MB.
- No public API keys are embedded in the client bundle. The previous unused `GEMINI_API_KEY` substitution has been removed.

## Deployment cost

| Layer | Service | Expected cost |
|---|---|---|
| Static hosting | Cloudflare Workers Static Assets | $0 within free allowances |
| Continuous integration/deployment | GitHub Actions (public repo) | $0 within free allowances |
| State | Browser localStorage | $0 |
| Charting/UI | Bundled open-source packages | $0 |

There is no live deployment until Cloudflare credentials are configured and the workflow successfully deploys.
