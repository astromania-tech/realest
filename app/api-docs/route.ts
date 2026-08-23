import { NextResponse } from 'next/server'

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RealEST API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      padding: 0;
      background: #fafafa;
      font-family: sans-serif;
    }
    .swagger-ui {
      max-width: none;
    }
    .swagger-ui .topbar {
      background-color: #07402F;
      padding: 10px 0;
    }
    .swagger-ui .logo {
      padding: 0 20px;
    }
    .swagger-ui .info .title {
      color: #07402F;
    }
    .swagger-ui .btn {
      background: #ADF434;
      border-color: #ADF434;
      color: #07402F;
      font-weight: 600;
    }
    .swagger-ui .btn:hover {
      background: #8cc311;
      border-color: #8cc311;
    }
    .swagger-ui .scheme-container {
      background: #07402F;
      padding: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      try {
        const ui = SwaggerUIBundle({
          url: '/api/docs/openapi.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: 'BaseLayout',
          persistAuthorization: true,
          deepLinking: true,
          displayRequestDuration: true,
          docExpansion: 'list',
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          defaultModelsExpandDepth: 2,
          showExtensions: true,
          showCommonExtensions: true
        })
        window.ui = ui
      } catch (e) {
        console.error('Swagger UI Error:', e)
      }
    }
  </script>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
