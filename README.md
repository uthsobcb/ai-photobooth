# Photo Finder

Hosts upload an event's photos once. Guests open a link, take a selfie, and get every photo they appear in.

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind 4, Clerk 7 for sign-in
- **Backend:** Flask, InsightFace (RetinaFace detector + ArcFace embeddings) for faces, FAISS for per-album search, MongoDB for album records

## How it works

1. A signed-in host creates an album and uploads photos. Each face in each photo is encoded (512-d ArcFace embedding) and added to that album's FAISS index.
2. The host shares the guest link `/find/<album_id>`. No account is needed to use it.
3. A guest takes a selfie or uploads a photo. The largest face is compared with the album index by cosine similarity. Every photo at or above the match threshold is returned, best first, labelled "Strong match" or "Possible match".

Guest selfies are decoded in memory and never saved. Deleting a photo removes its faces from the index; deleting an album removes its images and index.

## Project layout

```
backend/    Flask API (main.py)
frontend/   Next.js app
  src/app/
    page.tsx              landing (how it works, pricing, FAQ)
    dashboard/            host: list, create, rename, delete albums
    albums/[id]/          host: upload and manage photos, copy guest link
    find/[albumId]/       guest: selfie search and results
    components/           Button, Modal, Camera, Gallery, ...
    lib/utils.ts          API helpers
```

## Running locally

### Backend

Needs Python 3.9 to 3.12 (onnxruntime has no wheels for newer versions yet), a MongoDB database, and a C++ compiler (InsightFace builds a small extension on install). On first start it downloads the face model (about 280 MB) to `~/.insightface`.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# create backend/.env with the variables below, then:
python main.py         # serves on http://localhost:7860
python main.py reindex # rebuild every album's face index (needed after changing FACE_MODEL)
pip install mongomock && python test_search.py   # end-to-end check of upload, search and delete
```

Albums indexed with the old dlib model are rebuilt automatically from their stored photos the first time they're used. For large albums run `python main.py reindex` first.

`backend/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string (database `photobooth`) |
| `CLERK_JWKS_URL` | for production | `https://<your-clerk-domain>/.well-known/jwks.json`. When set, every protected route verifies the Clerk session token. When unset, the backend trusts a client-sent `user_id` and prints a warning. Dev only. |
| `IMAGE_FOLDER` | no | Where photos are stored (default `Images`) |
| `VECTOR_FOLDER` | no | Where per-album indexes are stored (default `album_vectors`) |
| `FLASK_DEBUG` | no | Set to `1` to enable Flask debug mode |
| `FACE_MODEL` | no | InsightFace model pack (default `buffalo_l`) |
| `FACE_DET_SIZE` | no | Detector input size in px (default `960`). Larger finds smaller faces but is slower |
| `MATCH_THRESHOLD` | no | Minimum cosine similarity to return a photo (default `0.40`) |
| `STRONG_THRESHOLD` | no | Similarity at or above which a photo is a "strong match" (default `0.55`) |

### Frontend

Needs Node 22 or 24 LTS (Next 16 requires 20.9+, and Node 20 is end-of-life).

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
npm run lint           # ESLint 10 (flat config)
```

`frontend/.env.local`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:7860` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From the Clerk dashboard |
| `CLERK_SECRET_KEY` | From the Clerk dashboard |

Both Clerk keys are required, including in development (Clerk 7 has no keyless mode), and `next build` also needs them.

If you must use Node 25, `next dev` fails with `localStorage.getItem is not a function`. Start it with `NODE_OPTIONS=--no-experimental-webstorage npm run dev`.

Photos are served from the backend, so its hostname must be listed in `images.remotePatterns` in `frontend/next.config.js`.

## API

| Method and path | Auth | Purpose |
| --- | --- | --- |
| `POST /create_album` | host | Create an album |
| `GET /fetch-albums` | host | List the host's albums (with cover and photo count) |
| `GET /albums/<id>` | none | Album name, photos and owner |
| `POST /albums/<id>/upload` | owner | Add a photo and index its faces |
| `POST /albums/<id>/find_faces` | none | Find matching photos for a selfie |
| `DELETE /delete_image` | owner | Delete a photo and its faces |
| `PUT /edit_album` | owner | Rename an album |
| `DELETE /delete_album` | owner | Delete an album |
| `GET /images/<path>` | none | Serve a photo |

Protected routes expect `Authorization: Bearer <Clerk session token>`.

## Known limits

- **Pricing is a demo.** The plans on the landing page are placeholders. Nothing limits albums or photos, and there is no checkout.
- **Album pages are viewable by anyone with the link.** Only uploading, renaming and deleting are owner-only. The guest link shows only matching photos.
- **Photos and indexes are stored on local disk.** Use a persistent volume or move them to object storage before deploying somewhere with an ephemeral filesystem.
- **Model licence.** InsightFace's pretrained models are licensed for non-commercial research use. Check the terms before using this commercially, or set `FACE_MODEL` to a model you are licensed to use.
- **Thresholds are defaults, not tuned.** `MATCH_THRESHOLD` and `STRONG_THRESHOLD` should be checked against a labelled sample of your own photos.
- **Indexing and search run on CPU.** Large albums take longer to upload and to reindex.
