Puppeteer Browser Server
-------------------------

This is the backend for the Roku Remote Browser channel.

Run with Node.js:
1. Run `npm install`
2. Run `node server.js`
3. The server will listen on port 3000

Run with Docker:
1. Run `docker-compose up --build`
2. The server will listen on port 3000

Endpoints:
- POST /session -> { sessionId }
- POST /session/:id/navigate { url }
- POST /session/:id/click { x, y, posterWidth, posterHeight }
- POST /session/:id/back or /reload
- GET /session/:id/screenshot

This will allow the Roku client to behave like a full web browser (navigate, click, back, reload, screenshot).