import { NextResponse } from 'next/server'

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RealEST API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #fafafa;
    }
    .swagger-ui {
      max-width: none;
      padding-top: 0;
    }
    .swagger-ui .topbar {
      background-color: #07402F;
      padding: 15px 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .swagger-ui .topbar h1 {
      color: #ADF434;
      font-size: 24px;
      font-weight: 600;
    }
    .swagger-ui .topbar .topbar-inner {
      max-width: none;
      padding: 0;
    }
    .swagger-ui .btn {
      background-color: #ADF434;
      border-color: #ADF434;
      color: #07402F;
      font-weight: 600;
    }
    .swagger-ui .btn:hover {
      background-color: #8cc311;
      border-color: #8cc311;
    }
    .swagger-ui .info .title {
      color: #07402F;
    }
    .swagger-ui .scheme-container {
      background-color: #07402F;
      padding: 20px;
      border-radius: 4px;
    }
    .swagger-ui .scheme-container .scheme-container__title {
      color: #ADF434;
    }
    .swagger-ui .execute-wrapper input[type=text],
    .swagger-ui .execute-wrapper textarea {
      background-color: #f0f0f0;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      // Build the Swagger UI
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
        layout: 'StandaloneLayout',
        persistAuthorization: true,
        defaultModelsExpandDepth: 2,
        docExpansion: 'list',
        onComplete: function() {
          console.log('Swagger UI loaded successfully')
        }
      })
      window.ui = ui
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
