# Photo Finder

Hosts upload an event's photos once. Guests open a link, take a selfie, and get every photo they appear in.

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind, Clerk for sign-in
- **Backend:** Flask, `face_recognition` (dlib) for face encodings, FAISS for per-album search, MongoDB for album records

## How it works

1. A signed-in host creates an album and uploads photos. Each face in each photo is encoded (128-d) and added to that album's FAISS index.
2. The host shares the guest link `/find/<album_id>`. No account is needed to use it.
3. A guest takes a selfie or uploads a photo. The largest face is compared with the album index and every photo within distance 0.6 is returned, best match first, with a match percentage.

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

Needs Python 3.9+, a MongoDB database, and the ability to build `dlib` (CMake and a C++ compiler).

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# create backend/.env with the variables below, then:
python main.py         # serves on http://localhost:7860
```

`backend/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string (database `photobooth`) |
| `CLERK_JWKS_URL` | for production | `https://<your-clerk-domain>/.well-known/jwks.json`. When set, every protected route verifies the Clerk session token. When unset, the backend trusts a client-sent `user_id` and prints a warning. Dev only. |
| `IMAGE_FOLDER` | no | Where photos are stored (default `Images`) |
| `VECTOR_FOLDER` | no | Where per-album indexes are stored (default `album_vectors`) |
| `FLASK_DEBUG` | no | Set to `1` to enable Flask debug mode |

### Frontend

Needs Node 20 or 22 LTS.

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

`frontend/.env.local`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:7860` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From the Clerk dashboard |
| `CLERK_SECRET_KEY` | From the Clerk dashboard |

Without Clerk keys, Clerk runs in keyless mode in development with temporary keys.

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
- **Face search uses the HOG detector.** It is fast on CPU but works best with clear, front-facing faces.
