# Kreyòl ⇄ English Translator

A web app that translates between Haitian Kreyòl and English using Claude.
The Anthropic API key stays on the server, so it is never exposed to visitors.

## Run it locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your API key**

   Copy `.env.example` to `.env` and paste your key from
   https://console.anthropic.com/settings/keys
   ```bash
   cp .env.example .env
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. Open http://localhost:3000

## How it works

- `server.js` — Express server. Serves the web page and exposes
  `POST /api/translate`, which calls Claude and returns the translation.
- `public/index.html` — the whole front end (UI + logic), no build step.

Change the model with the `CLAUDE_MODEL` env var. The default is
`claude-haiku-4-5` (fast + cheap); `claude-sonnet-5` gives the strongest
idiom handling.

## Publishing to a website

This runs anywhere that hosts a Node.js app. Good free/cheap options:

- **Render** or **Railway** — connect your GitHub repo, set the
  `ANTHROPIC_API_KEY` environment variable in their dashboard, deploy.
- **Fly.io** — `fly launch`, set the secret with
  `fly secrets set ANTHROPIC_API_KEY=...`.

In all cases: never commit `.env`. Set the API key as an environment
variable / secret in the host's dashboard instead.
