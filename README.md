# RouterPlus admin

Fork of [OmniRoute](https://github.com/diegosouzapw/OmniRoute) (`diegosouzapw/OmniRoute`)
running as the management dashboard for **admin.router.plus**.

- **Upstream baseline**: `main` tracks the upstream v3.8.50 development cycle
  (`package.json` version `3.8.50`; tip commit is contained in `upstream/release/v3.8.50`).
- **All core functionality is inherited unchanged** — 290 providers, combo routing,
  MCP server, A2A, compression pipeline, etc. See [`AGENTS.md`](AGENTS.md) and
  [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) for the
  full upstream architecture reference.

## Changes vs original OmniRoute

Everything below is verifiable with `git diff HEAD` / `git status` against the
upstream tree.

| Change                                                                                                                                                                                     | Files                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| New endpoint `GET /api/swagger` — interactive Swagger UI ("Try it out") rendering `docs/openapi.yaml`, CDN-loaded Swagger UI 5, public tier, graceful fallback when the CDN is unreachable | `src/app/api/swagger/route.ts` (new)                                      |
| Made both documentation UIs publicly readable (read-only methods, same tier as `/api/health/ping`)                                                                                         | `src/shared/constants/publicApiRoutes.ts` (+`/api/docs`, +`/api/swagger`) |
| Documented all four documentation endpoints in the OpenAPI spec                                                                                                                            | `docs/openapi.yaml`                                                       |
| Swagger rollout notes and setup guide (incl. air-gapped asset mirroring)                                                                                                                   | `SWAGGER_README.md`, `docs/api/SWAGGER_SETUP.md` (new)                    |
| Product requirements for the router.plus offering (Telegram bot, payments, partner API)                                                                                                    | `PRD.md` (new)                                                            |

The other three documentation endpoints already existed upstream; this fork only adds
`/api/swagger` and wires the public-route policy:

```
GET /api/docs          → Redoc UI            (upstream)
GET /api/swagger       → Swagger UI          (fork)
GET /openapi.yaml      → raw spec, YAML      (upstream)
GET /api/openapi/spec  → parsed spec, JSON   (upstream)
```

## Deployment (admin.router.plus)

This repo lives at `/root/router` on the VPS that serves `admin.router.plus`
(77.110.124.102). Traffic path:

```
client → nginx (TLS, /etc/nginx/sites-enabled/router.plus → admin.router.plus server block)
       → http://127.0.0.1:3002
       → systemd omniroute.service (this app, scripts/dev/run-next.mjs start)
```

Manage the service:

```bash
systemctl status omniroute
journalctl -u omniroute -f
sudo systemctl restart omniroute
```

### Install & run

Builds happen in CI: every GitHub Release carries an installable
`omniroute-<version>.tgz`, packed only after the boot-smoke and
install-upgrade gates pass. Install the latest release artifact with:

```bash
curl -fsSL https://raw.githubusercontent.com/RouterPlus/router/main/scripts/install-latest.sh | bash
```

The script ([`scripts/install-latest.sh`](scripts/install-latest.sh)) downloads the latest
release tarball and installs it globally (`npm install -g <tarball>`) — no local
build needed. Re-run it to upgrade. To inspect before running:

```bash
curl -fsSL https://raw.githubusercontent.com/RouterPlus/router/main/scripts/install-latest.sh -o /tmp/install-latest.sh
less /tmp/install-latest.sh && bash /tmp/install-latest.sh
```

Start the server (defaults to port 20128; `PORT`/`API_PORT`/`DASHBOARD_PORT`
override, see `bin/cli/commands/serve.mjs`):

```bash
PORT=3002 omniroute serve
```

Runtime config comes from `.env` (see `.env.example` for every variable); the
systemd unit overrides `PORT=3002` / `HOST=127.0.0.1` so nginx terminates TLS.

## Local development

```bash
npm install
npm run dev        # http://localhost:20128
```

Then open `/api/swagger` (interactive) or `/api/docs` (read-only). To test
authenticated endpoints in Swagger UI use the **Authorize** button with a Bearer key.
