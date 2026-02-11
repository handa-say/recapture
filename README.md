# recapture

Starter implementation of a parody image challenge with separated frontend/backend/data layers.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Project structure

- `frontend/`: HTML/CSS/JS UI.
- `backend/src/`: API server and challenge service.
- `data/challenges.json`: challenge content, including topic and source metadata.

## API endpoints

- `GET /api/metadata` returns available topics and image sources.
- `GET /api/challenges/random?topic=all&source=all` returns one challenge from filters.

## Extending image providers

`backend/src/providers/challengeProvider.js` includes a base provider and local JSON provider.
Add new providers for S3, database, or other services and pass them into `ChallengeService`.
