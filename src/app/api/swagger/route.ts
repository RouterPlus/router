/**
 * GET /api/swagger — Interactive API documentation (Swagger UI).
 *
 * Serves an HTML page that loads Swagger UI from a CDN and points it at
 * `/openapi.yaml`. Swagger UI provides interactive "Try it out" functionality
 * for testing API endpoints directly from the browser, complementing the
 * read-only Redoc view at `/api/docs`.
 *
 * Auth: PUBLIC tier. Anyone can read and test the API surface.
 *
 * Implementation note: we intentionally inline a minimal HTML shell
 * (no React, no client bundle) so this route stays cheap to render
 * even under cold-start conditions. Swagger UI is loaded from
 * `https://unpkg.com/swagger-ui-dist` which is the official CDN distribution.
 */
export const dynamic = "force-static";

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OmniRoute API - Swagger UI</title>
    <meta name="description" content="Interactive OpenAPI documentation for the OmniRoute v1 API." />
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; padding: 0; }
      #swagger-ui { min-height: 100vh; }
      .swagger-ui .topbar { display: none; }
      .or-fallback { padding: 24px; max-width: 800px; margin: 64px auto; line-height: 1.6; color: #1a1a1a; }
      .or-fallback h1 { font-size: 24px; margin-bottom: 12px; }
      .or-fallback a { color: #0066cc; }
      .or-fallback code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
    </style>
  </head>
  <body>
    <noscript>
      <div class="or-fallback">
        <h1>JavaScript required</h1>
        <p>Swagger UI needs JavaScript to render the OpenAPI spec. The raw spec is also
          <a href="/openapi.yaml">available as YAML</a>.</p>
      </div>
    </noscript>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
    <script>
      // Initialize Swagger UI. Falls back gracefully if the CDN is blocked.
      if (typeof SwaggerUIBundle !== "undefined") {
        window.ui = SwaggerUIBundle({
          url: "/openapi.yaml",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          persistAuthorization: true,
          docExpansion: "list",
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          displayRequestDuration: true,
          filter: true,
          syntaxHighlight: {
            activate: true,
            theme: "agate"
          },
          tryItOutEnabled: true
        });
      } else {
        document.getElementById("swagger-ui").innerHTML =
          '<div class="or-fallback"><h1>Swagger UI CDN unreachable</h1>' +
          '<p>The Swagger UI bundle at <code>unpkg.com</code> did not load. The raw spec is still ' +
          '<a href="/openapi.yaml">available as YAML</a>, and you can render it locally with any ' +
          'OpenAPI viewer (e.g. <code>npx swagger-ui-watcher docs/openapi.yaml</code>).</p></div>';
      }
    </script>
  </body>
</html>
`;

export function GET() {
  return new Response(SWAGGER_HTML, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
