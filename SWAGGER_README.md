# Management API with Swagger Documentation

## Summary

OmniRoute's management API is now exposed with interactive Swagger documentation, complementing the existing Redoc documentation viewer.

## What's New

### 🎯 New Endpoint: `/api/swagger`

- **Interactive Swagger UI** with "Try it out" functionality
- Test API endpoints directly from your browser
- Built-in authentication UI for Bearer tokens
- Request/response examples and schema exploration
- No authentication required to view the documentation

### 📚 Enhanced Documentation

All four documentation endpoints are now public and documented:

| Endpoint                | Format | Description                  |
| ----------------------- | ------ | ---------------------------- |
| **`/api/swagger`**      | HTML   | Interactive Swagger UI (new) |
| **`/api/docs`**         | HTML   | Read-only Redoc UI           |
| **`/openapi.yaml`**     | YAML   | Raw OpenAPI 3.1.0 spec       |
| **`/api/openapi/spec`** | JSON   | Structured API catalog       |

## Quick Start

```bash
# Start the server
npm run dev

# Open Swagger UI in your browser
open http://localhost:20128/api/swagger

# Or use Redoc for read-only documentation
open http://localhost:20128/api/docs
```

## Features Comparison

| Feature             | Swagger UI | Redoc |
| ------------------- | ---------- | ----- |
| Interactive Testing | ✓          | ✗     |
| Try It Out          | ✓          | ✗     |
| Auth UI             | ✓          | ✗     |
| Code Samples        | ✓          | ✓     |
| Search              | ✓          | ✓     |
| Mobile Friendly     | ○          | ✓     |
| Load Speed          | ○          | ✓     |

**Use Swagger UI** for testing and development  
**Use Redoc** for documentation reading

## Testing Authenticated Endpoints

1. Navigate to http://localhost:20128/api/swagger
2. Click the **"Authorize"** button (lock icon, top right)
3. Enter your API key: `Bearer your-api-key-here`
4. Click **"Authorize"**, then **"Close"**
5. All requests will now include authentication

## Implementation Details

### Files Created

```
src/app/api/swagger/route.ts          # Swagger UI HTML endpoint
docs/api/SWAGGER_SETUP.md             # Detailed setup guide
```

### Files Modified

```
src/shared/constants/publicApiRoutes.ts   # Added /api/swagger and /api/docs as public
docs/openapi.yaml                         # Documented all 4 documentation endpoints
```

### Architecture Highlights

- **Force-static rendering** for zero cold-start overhead
- **CDN-based assets** (Swagger UI, Redoc) for minimal bundle size
- **Graceful degradation** if CDN is unreachable
- **Public tier** (no authentication required to view docs)
- **Follows OmniRoute conventions** from existing `/api/docs` implementation

## Security Classification

All documentation endpoints are **PUBLIC** with **READ-ONLY** methods:

- No authentication required to view documentation
- Same tier as `/api/health/ping` and `/api/monitoring/health`
- Follows the principle that API docs should be freely accessible
- Testing endpoints still requires valid API keys

## CDN Dependencies

- **Swagger UI**: https://unpkg.com/swagger-ui-dist@5/
- **Redoc**: https://cdn.redocly.com/redoc/latest/

For air-gapped deployments, mirror these assets locally and update script sources.

## Documentation

- **Setup Guide**: `docs/api/SWAGGER_SETUP.md` (detailed)
- **OpenAPI Spec**: `docs/openapi.yaml` (canonical source)
- **API Reference**: `docs/reference/API_REFERENCE.md`

## Related Endpoints

```
GET  /api/swagger              →  Interactive Swagger UI
GET  /api/docs                 →  Read-only Redoc UI
GET  /openapi.yaml             →  OpenAPI 3.1.0 spec (YAML)
GET  /api/openapi/spec         →  Parsed spec (JSON catalog)
GET  /api/v1/models            →  List available models (requires auth)
POST /api/v1/chat/completions  →  Chat completions (requires auth)
```

## Next Steps

1. **Test the implementation**: `npm run dev` and visit `/api/swagger`
2. **Explore the API**: Try out endpoints with your API key
3. **Update docs**: Any API changes should update `docs/openapi.yaml`
4. **Add examples**: Enhance request/response examples in the spec

---

**Note**: The Swagger UI loads from CDN (unpkg.com). If you're in an air-gapped environment, see `docs/api/SWAGGER_SETUP.md` for local mirroring instructions.
