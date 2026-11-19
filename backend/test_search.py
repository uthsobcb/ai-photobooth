"""End-to-end check of upload -> search -> delete with the real face model and an in-memory DB.

    pip install mongomock
    python test_search.py

Downloads the InsightFace model on first run. Uses InsightFace's bundled sample photo (several faces).
"""
import io
import os
import tempfile

os.environ["IMAGE_FOLDER"] = tempfile.mkdtemp()
os.environ["VECTOR_FOLDER"] = tempfile.mkdtemp()
os.environ["UPLOAD_FOLDER"] = tempfile.mkdtemp()

import cv2
import mongomock
import insightface.data

import main

main.albums_collection = mongomock.MongoClient().db.albums
client = main.app.test_client()


def jpg(image):
    return io.BytesIO(cv2.imencode(".jpg", image)[1].tobytes())


def post(url, image, name="p.jpg"):
    return client.post(url, data={"file": (jpg(image), name), "user_id": "u1"}, content_type="multipart/form-data")


photo = insightface.data.get_image("t1")
faces = main.face_app.get(photo)
assert len(faces) >= 3, f"sample photo should have several faces, found {len(faces)}"
crops = []
for f in faces:
    x1, y1, x2, y2 = [int(v) for v in f.bbox]
    pad = int((x2 - x1) * 0.6)
    crops.append(photo[max(0, y1 - pad):y2 + pad, max(0, x1 - pad):x2 + pad])

album_id = client.post("/create_album", json={"user_id": "u1", "album_name": "t"}).get_json()["album_id"]

# upload the group photo, and one extra photo that is just a different person's face crop
r = post(f"/albums/{album_id}/upload", photo, "group.jpg"); assert r.status_code == 200, r.get_json()
assert r.get_json()["faces"] == len(faces), r.get_json()
r = post(f"/albums/{album_id}/upload", crops[1], "solo.jpg"); assert r.status_code == 200, r.get_json()

# searching with each person's crop finds the group photo, strongly
for i, crop in enumerate(crops):
    m = post(f"/albums/{album_id}/find_faces", crop).get_json()["matches"]
    assert any(x["path"].endswith("group.jpg") and x["strong"] for x in m), (i, m)

# person 1 is also in solo.jpg; person 0 must not be
m0 = [x["path"] for x in post(f"/albums/{album_id}/find_faces", crops[0]).get_json()["matches"]]
m1 = [x["path"] for x in post(f"/albums/{album_id}/find_faces", crops[1]).get_json()["matches"]]
assert any(p.endswith("solo.jpg") for p in m1), m1
assert not any(p.endswith("solo.jpg") for p in m0), m0

# no face -> clear error; deleting a photo removes it from search
blank = photo * 0
assert post(f"/albums/{album_id}/find_faces", blank).status_code == 400
solo = next(p for p in m1 if p.endswith("solo.jpg"))
r = client.delete("/delete_image", json={"album_id": album_id, "image_name": solo, "user_id": "u1"}); assert r.status_code == 200
m1 = [x["path"] for x in post(f"/albums/{album_id}/find_faces", crops[1]).get_json()["matches"]]
assert not any(p.endswith("solo.jpg") for p in m1), m1

# a legacy/missing index is rebuilt from the stored photos
for name in ("index.faiss", "meta.json"):
    os.remove(os.path.join(os.environ["VECTOR_FOLDER"], album_id, name))
m = post(f"/albums/{album_id}/find_faces", crops[0]).get_json()["matches"]
assert any(x["path"].endswith("group.jpg") for x in m), m

print("OK: upload, search, delete and rebuild all work")
