<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MoEST M&E API Documentation</title>
    <!-- Swagger UI Styles -->
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
    <style>
        html {
            box-sizing: border-box;
            overflow: -y-scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
            font-family: sans-serif;
        }
        .swagger-ui .topbar {
            background-color: #1e3a5f; /* Match MoEST Deep Navy */
            border-bottom: 3px solid #14b8a6; /* Match MoEST Teal */
            padding: 10px 0;
        }
        .swagger-ui .topbar .download-url-wrapper {
            display: none; /* Hide URL input box to keep it clean */
        }
        .custom-header {
            background: #1e3a5f;
            color: #ffffff;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #14b8a6;
        }
        .custom-header h1 {
            margin: 0;
            font-size: 1.25rem;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .custom-header a {
            color: #F0A500;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="custom-header">
        <h1>
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" style="vertical-align: middle;">
                <circle cx="50" cy="50" r="46" fill="#14b8a6" />
                <path d="M50 15 L80 35 V65 L50 85 L20 65 V35 Z" fill="#1e3a5f" stroke="#F0A500" strokeWidth="4" />
            </svg>
            Ministry of Education, Science and Technology — M&E API Documentation
        </h1>
        <a href="/">← Back to Portal</a>
    </div>

    <div id="swagger-ui"></div>

    <!-- Swagger UI Scripts -->
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
    <script>
        window.onload = function() {
            // Build a system
            const ui = SwaggerUIBundle({
                url: "/openapi.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "BaseLayout"
            });
            window.ui = ui;
        };
    </script>
</body>
</html>
