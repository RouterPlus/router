# Swagger UI Setup for OmniRoute

## Overview

OmniRoute now exposes its management API with interactive Swagger documentation alongside the existing Redoc documentation.

## Endpoints

| Endpoint            | Description                                            | Authentication            |
| ------------------- | ------------------------------------------------------ | ------------------------- |
| `/api/swagger`      | Interactive Swagger UI with "Try it out" functionality | Public (no auth required) |
| `/api/docs`         | Read-only Redoc documentation                          | Public (no auth required) |
| `/openapi.yaml`     | Raw OpenAPI 3.1.0 specification (YAML)                 | Public (no auth required) |
| `/api/openapi/spec` | Parsed OpenAPI specification (JSON catalog)            | Public (no auth required) |

## Features

### Swagger UI (`/api/swagger`)

- **Interactive Testing**: "Try it out" buttons for all endpoints
- **Authentication Support**: Built-in Bearer token authentication UI
- **Request/Response Examples**: Pre-filled example payloads
- **Schema Exploration**: Browse all API schemas and models
- **Filtering**: Search endpoints by keyword
- **Persistent Authorization**: Bearer tokens persist across page reloads

### Redoc UI (`/api/docs`)

- **Clean, Read-only View**: Optimized for API exploration
- **Three-Column Layout**: Navigation, description, and code samples
- **Deep Linking**: Direct links to specific endpoints
- **Responsive Design**: Works on mobile and desktop

## Implementation Details

### Files Created

- **`src/app/api/swagger/route.ts`**: Swagger UI HTML endpoint
  - Force-static rendering for performance
  - CDN-based asset loading (fallback gracefully if offline)
  - Configured with optimal defaults (deep linking, filter, syntax highlighting)

### Files Modified

- **`src/shared/constants/publicApiRoutes.ts`**: Added `/api/swagger` and `/api/docs` to public readonly routes
- **`docs/openapi.yaml`**: Added documentation for all four documentation endpoints

### Security Classification

All documentation endpoints are classified as **PUBLIC** with **READ-ONLY** methods (GET, HEAD, OPTIONS). They require no authentication, following the principle that API documentation should be freely accessible.

## Usage

### For End Users

1. Start OmniRoute: `npm run dev` or `npm start`
2. Navigate to `http://localhost:20128/api/swagger`
3. Click "Authorize" to add your API key (if testing authenticated endpoints)
4. Click "Try it out" on any endpoint to test it

### For Developers

The OpenAPI specification is the single source of truth:

```yaml
# Primary spec location
docs/openapi.yaml
```

Any changes to the API surface should update this file. The Swagger/Redoc UIs automatically reflect changes.

### Testing Authentication

1. Create an API key via the dashboard: `http://localhost:20128/dashboard`
2. In Swagger UI, click the "Authorize" button (top right)
3. Enter your API key in the format: `Bearer your-api-key-here`
4. Click "Authorize" then "Close"
5. All requests will now include the authentication header

## CDN Dependencies

Both UIs load from CDN for zero-bundle-size overhead:

- **Swagger UI**: `https://unpkg.com/swagger-ui-dist@5/`
- **Redoc**: `https://cdn.redocly.com/redoc/latest/`

If deploying in an air-gapped environment:

1. Download assets to `public/vendor/swagger-ui/` and `public/vendor/redoc/`
2. Update the `<script src>` tags in the route files
3. Set proper `Cache-Control` headers for the static assets

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
├─────────────────────────────────────────────────────────────┤
│  GET /api/swagger  →  Minimal HTML Shell                    │
│                       ↓                                      │
│                   Loads Swagger UI from CDN                  │
│                       ↓                                      │
│                   Fetches /openapi.yaml                      │
│                       ↓                                      │
│              Renders Interactive Docs + Try It Out           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      OmniRoute Server                        │
├─────────────────────────────────────────────────────────────┤
│  /api/swagger       →  route.ts (force-static HTML)         │
│  /api/docs          →  route.ts (force-static HTML)         │
│  /openapi.yaml      →  Static file (docs/openapi.yaml)      │
│  /api/openapi/spec  →  Dynamic JSON (parsed + enriched)     │
└─────────────────────────────────────────────────────────────┘
```

## Comparison: Swagger UI vs Redoc

| Feature                 | Swagger UI           | Redoc                |
| ----------------------- | -------------------- | -------------------- |
| **Interactive Testing** | ✓ Yes                | ✗ No                 |
| **Try It Out**          | ✓ Yes                | ✗ No                 |
| **Auth UI**             | ✓ Built-in           | ✗ No                 |
| **Code Samples**        | ✓ Multiple languages | ✓ Multiple languages |
| **Search/Filter**       | ✓ Yes                | ✓ Yes                |
| **Mobile Friendly**     | ~ Adequate           | ✓ Excellent          |
| **Print/Export**        | ~ Basic              | ✓ Good               |
| **Load Time**           | ~ Medium             | ✓ Fast               |
| **Bundle Size**         | ~ 2.5MB              | ~ 500KB              |

**Recommendation**: Use Swagger UI for testing and development, Redoc for documentation reading.

## Troubleshooting

### "Swagger UI CDN unreachable"

The CDN failed to load. Options:

1. Check internet connectivity
2. Use a local mirror (see "CDN Dependencies" above)
3. Use the raw spec: `curl http://localhost:20128/openapi.yaml`

### "401 Unauthorized" when testing endpoints

Some endpoints require authentication:

1. Click "Authorize" in Swagger UI
2. Enter your API key with "Bearer " prefix
3. Try the request again

### OpenAPI spec not loading

1. Check that `docs/openapi.yaml` exists
2. Validate YAML syntax: `npx @redocly/cli lint docs/openapi.yaml`
3. Check server logs for parsing errors

## References

- [OpenAPI Specification 3.1.0](https://spec.openapis.org/oas/v3.1.0)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Redoc Documentation](https://redocly.com/docs/redoc/)
- [OmniRoute API Reference](../reference/API_REFERENCE.md)
