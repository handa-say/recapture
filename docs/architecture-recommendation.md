# reCAPTCHA Parody: Future Development Recommendation

## Short answer
Do **not** keep everything in one HTML file.

Use:
- **Frontend:** HTML + CSS + JavaScript (or TypeScript)
- **Backend API:** Node.js (Express/Nest) or Python (FastAPI)
- **Data source:** JSON/SQLite/PostgreSQL now, object storage later (S3/GCS/local NAS)

## Why this fits your goals

### 1) Easy to maintain
- Split UI, logic, and data into separate files/modules.
- Keep challenge definitions in external JSON/database instead of hardcoding in `<script>`.
- Add a lightweight build/test pipeline (lint + unit tests).

### 2) Add more functions (topic switching)
- Add a `topic` field to each challenge.
- Backend endpoint can filter by topic (`/api/challenges?topic=history`).
- Frontend can add a topic dropdown without changing core verification logic.

### 3) Multiple image databases
- Use an abstraction layer (provider pattern):
  - `LocalFolderProvider`
  - `S3Provider`
  - `DatabaseProvider`
- Backend returns normalized image URLs regardless of source.

### 4) Connect external code/storage
- Backend can call other services (internal API, CMS, ML tagger).
- Signed URLs or CDN links can point to images outside your code repo.
- Keep secrets/credentials on server side only.

## Suggested project layout

```text
recapture/
  frontend/
    index.html
    styles.css
    app.js
  backend/
    src/
      server.js
      routes/challenges.js
      services/challengeService.js
      providers/
        localProvider.js
        s3Provider.js
  data/
    challenges.json
```

## Minimal migration path
1. Move inline CSS -> `styles.css`.
2. Move inline JS -> `app.js`.
3. Move `challenges` array -> `data/challenges.json`.
4. Serve JSON via backend API.
5. Add topic filter + provider abstraction.

## Practical recommendation
If you want the fastest path with lots of tutorials and easy deployment:
- **Use JavaScript/TypeScript across frontend + backend** (Node.js).

If you prefer Python ecosystems:
- Keep frontend in JS, use **FastAPI** backend.

Either way, keep HTML for rendering, but put business/data logic in backend modules.
