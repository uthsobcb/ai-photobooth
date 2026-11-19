import os
import shutil
import uuid
import cv2
import numpy as np
import faiss
import json
import sys
import jwt
import pymongo
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from werkzeug.security import safe_join
from flask_cors import CORS
from bson.objectid import ObjectId
from datetime import datetime
from dotenv import load_dotenv
from insightface.app import FaceAnalysis

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure folders and database
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
IMAGE_FOLDER = os.getenv('IMAGE_FOLDER', 'Images')
VECTOR_FOLDER = os.getenv('VECTOR_FOLDER', 'album_vectors')
MONGO_URI = os.getenv('MONGO_URI')

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGE_FOLDER, exist_ok=True)
os.makedirs(VECTOR_FOLDER, exist_ok=True)

# MongoDB setup
client = pymongo.MongoClient(MONGO_URI)
db = client.photobooth
albums_collection = db.albums

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_SIDE = 2000          # downscale huge photos before face detection (speed)
MAX_RESULTS = 300        # faces fetched from the index per search

# Face model: InsightFace ArcFace embeddings (512-d, L2-normalised) compared by cosine similarity.
# NOTE: InsightFace's pretrained models are licensed for non-commercial research use.
FACE_MODEL = os.getenv('FACE_MODEL', 'buffalo_l')
DET_SIZE = int(os.getenv('FACE_DET_SIZE', '960'))                    # larger = finds smaller faces, slower
EMB_DIM = 512
MATCH_THRESHOLD = float(os.getenv('MATCH_THRESHOLD', '0.40'))        # "possible match" cutoff
STRONG_THRESHOLD = float(os.getenv('STRONG_THRESHOLD', '0.55'))      # "strong match" cutoff
MIN_DET_SCORE = 0.5      # ignore low-confidence detections
MIN_FACE_PX = 32         # ignore faces smaller than this (too little detail to match reliably)

face_app = FaceAnalysis(name=FACE_MODEL, allowed_modules=['detection', 'recognition'],
                        providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=-1, det_size=(DET_SIZE, DET_SIZE))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def oid(value):
    """ObjectId or None, so a bad id is a 404 instead of a 500."""
    try:
        return ObjectId(value)
    except Exception:
        return None


def album_paths(album_id):
    folder = os.path.join(VECTOR_FOLDER, str(album_id))
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "index.faiss"), os.path.join(folder, "meta.json"), folder


def detect(image):
    """Run the detector without upscaling: it fails on faces much larger than ~250px, which a selfie easily is."""
    h, w = image.shape[:2]
    if max(h, w) < DET_SIZE:
        canvas = np.zeros((DET_SIZE, DET_SIZE, 3), np.uint8)
        canvas[:h, :w] = image
        image = canvas
    return face_app.get(image)


def read_faces(raw):
    """Image bytes -> list of (face_area, embedding). None if the bytes aren't an image."""
    image = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return None
    s = MAX_SIDE / max(image.shape[:2])
    if s < 1:
        image = cv2.resize(image, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)

    scale, faces = 1.0, detect(image)
    while not faces and min(image.shape[:2]) >= 96:  # nothing found: faces may be too large, retry smaller
        image = cv2.resize(image, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
        scale *= 0.5
        faces = detect(image)

    out = []
    for f in faces:
        x1, y1, x2, y2 = f.bbox / scale  # back to the uploaded photo's pixels
        if f.det_score >= MIN_DET_SCORE and min(x2 - x1, y2 - y1) >= MIN_FACE_PX:
            out.append(((x2 - x1) * (y2 - y1), f.normed_embedding))
    return out


def save_index(album_id, index, metadata):
    index_path, meta_path, _ = album_paths(album_id)
    faiss.write_index(index, index_path)
    with open(meta_path, "w") as f:
        json.dump(metadata, f)


def get_index(album):
    """(index, metadata) for an album. Missing or from the old dlib model -> rebuilt from the stored photos."""
    index_path, meta_path, folder = album_paths(album["_id"])
    if os.path.exists(index_path) and os.path.exists(meta_path):
        with open(meta_path) as f:
            return faiss.read_index(index_path), json.load(f)

    # ponytail: rebuilds inline on first use, slow for huge albums; run `python main.py reindex` ahead of time
    index, metadata = faiss.IndexFlatIP(EMB_DIM), []
    for rel in album.get("images", []):
        path = safe_join(IMAGE_FOLDER, rel)
        if not path or not os.path.isfile(path):
            continue
        with open(path, "rb") as f:
            for _, emb in read_faces(f.read()) or []:
                index.add(emb.reshape(1, -1).astype(np.float32))
                metadata.append(rel)
    if metadata:
        save_index(album["_id"], index, metadata)
    legacy = os.path.join(folder, "index.pkl")
    if os.path.exists(legacy):
        os.remove(legacy)
    return index, metadata


def remove_from_index(album, rel_path):
    """Drop every face of one image from the album's index."""
    index, metadata = get_index(album)
    keep = [i for i, m in enumerate(metadata) if m != rel_path]
    if len(keep) == len(metadata):
        return
    new_index = faiss.IndexFlatIP(EMB_DIM)
    if keep:
        new_index.add(index.reconstruct_n(0, index.ntotal)[keep])
    save_index(album["_id"], new_index, [metadata[i] for i in keep])


# Set CLERK_JWKS_URL (https://<your-clerk-domain>/.well-known/jwks.json) to enforce auth.
JWKS_URL = os.getenv('CLERK_JWKS_URL')
jwks = jwt.PyJWKClient(JWKS_URL) if JWKS_URL else None
if not jwks:
    print("WARNING: CLERK_JWKS_URL not set, trusting client-sent user_id (dev only)")


def current_user():
    """Clerk user id from the Bearer token, or None if missing/invalid."""
    if not jwks:  # dev fallback
        data = request.get_json(silent=True) or {}
        return data.get('user_id') or request.args.get('user_id') or request.form.get('user_id')
    try:
        token = request.headers.get('Authorization', '').removeprefix('Bearer ')
        key = jwks.get_signing_key_from_jwt(token).key
        return jwt.decode(token, key, algorithms=['RS256'], options={'verify_aud': False})['sub']
    except Exception:
        return None


def forbidden(album):
    user = current_user()
    return user is None or album["user_id"] != user


# Create Album
@app.route('/create_album', methods=['POST'])
def create_album():
    data = request.get_json(silent=True) or {}
    user_id = current_user()
    album_name = (data.get('album_name') or '').strip()
    if not user_id:
        return jsonify({"error": "Sign in required"}), 401
    if not album_name:
        return jsonify({"error": "Album name is required"}), 400

    album_id = albums_collection.insert_one({
        "user_id": user_id,
        "album_name": album_name,
        "images": [],
        "created_at": datetime.utcnow()
    }).inserted_id

    os.makedirs(os.path.join(IMAGE_FOLDER, str(album_id)), exist_ok=True)
    return jsonify({"album_id": str(album_id), "album_url": f"/albums/{album_id}"})


# Upload Image & Add to Album
@app.route('/albums/<album_id>/upload', methods=['POST'])
def upload_image(album_id):
    file = request.files.get('file')
    if not file or not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Please choose a PNG or JPG image'}), 400

    oid_ = oid(album_id)
    album = oid_ and albums_collection.find_one({"_id": oid_})
    if not album:
        return jsonify({'error': 'Album not found'}), 404
    if forbidden(album):
        return jsonify({'error': 'Not your album'}), 403

    raw = file.read()
    faces = read_faces(raw)
    if faces is None:
        return jsonify({'error': 'Could not read image file'}), 400
    if not faces:
        return jsonify({'error': 'No face detected in this photo'}), 400

    index, metadata = get_index(album)  # before the new photo is saved, so a rebuild doesn't double-count it
    album_folder = os.path.join(IMAGE_FOLDER, str(album_id))
    os.makedirs(album_folder, exist_ok=True)
    filename = f"{datetime.now():%Y%m%d_%H%M%S}_{uuid.uuid4().hex[:6]}_{secure_filename(file.filename)}"
    with open(os.path.join(album_folder, filename), "wb") as f:
        f.write(raw)
    relative_path = os.path.join(str(album_id), filename)

    index.add(np.array([emb for _, emb in faces], dtype=np.float32))
    metadata.extend([relative_path] * len(faces))
    save_index(album_id, index, metadata)

    albums_collection.update_one({"_id": oid_}, {"$push": {"images": relative_path}})
    return jsonify({'message': 'Image uploaded and processed', 'filename': relative_path, 'faces': len(faces)})


# Search Faces Within Album
@app.route('/albums/<album_id>/find_faces', methods=['POST'])
def find_faces(album_id):
    file = request.files.get('file')
    if not file or not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Please choose a PNG or JPG image'}), 400

    oid_ = oid(album_id)
    album = oid_ and albums_collection.find_one({"_id": oid_})
    if not album:
        return jsonify({'error': 'Album not found'}), 404

    faces = read_faces(file.read())
    if faces is None:
        return jsonify({'error': 'Could not read image file'}), 400
    if not faces:
        return jsonify({'error': 'No face detected in your photo'}), 400

    index, metadata = get_index(album)
    if index.ntotal == 0:
        return jsonify({"matches": []})  # album has no photos yet

    # Largest face in the frame is the subject; background faces are ignored
    _, embedding = max(faces, key=lambda f: f[0])
    sims, ids = index.search(embedding.reshape(1, -1).astype(np.float32), k=min(MAX_RESULTS, index.ntotal))

    best = {}  # one entry per photo, closest face wins
    for i, sim in zip(ids[0], sims[0]):
        if i >= 0 and sim >= MATCH_THRESHOLD:
            best[metadata[i]] = max(float(sim), best.get(metadata[i], 0.0))

    matches = [{"path": p, "score": round(s, 3), "strong": s >= STRONG_THRESHOLD}
               for p, s in sorted(best.items(), key=lambda kv: -kv[1])]
    return jsonify({"matches": matches})


# Fetch all albums of a user
@app.route('/fetch-albums', methods=['GET'])
def fetch_albums():
    user_id = current_user()
    if not user_id:
        return jsonify({"error": "Sign in required"}), 401

    albums = list(albums_collection.find(
        {"user_id": user_id}, {"_id": 1, "album_name": 1, "images": 1}
    ).sort("created_at", -1))
    return jsonify({"albums": [
        {"album_id": str(a["_id"]), "album_name": a["album_name"], "image_count": len(a.get("images", [])),
         "cover": (a.get("images") or [None])[0]}
        for a in albums
    ]})


# Get Album Details
@app.route('/albums/<album_id>', methods=['GET'])
def get_album(album_id):
    oid_ = oid(album_id)
    album = oid_ and albums_collection.find_one({"_id": oid_})
    if not album:
        return jsonify({'error': 'Album not found'}), 404
    return jsonify({
        "album_name": album["album_name"],
        "images": album["images"],
        "owner": album["user_id"]
    })


# Serve Images
@app.route('/images/<path:filename>')
def serve_image(filename):
    file_path = safe_join(IMAGE_FOLDER, filename)
    if file_path and os.path.isfile(file_path):
        return send_file(file_path, max_age=86400)
    return jsonify({'error': 'File not found'}), 404


# Delete Image
@app.route('/delete_image', methods=['DELETE'])
def delete_image():
    data = request.get_json(silent=True) or {}
    image_name, album_id = data.get('image_name'), data.get('album_id')
    oid_ = oid(album_id)
    if not image_name or not oid_:
        return jsonify({"error": "Image name and album ID are required"}), 400

    album = albums_collection.find_one({"_id": oid_})
    if not album:
        return jsonify({'error': 'Album not found'}), 404
    if forbidden(album):
        return jsonify({'error': 'Not your album'}), 403
    if image_name not in album.get("images", []):  # also blocks path traversal
        return jsonify({'error': 'Image not in album'}), 404

    image_path = safe_join(IMAGE_FOLDER, image_name)
    if image_path and os.path.exists(image_path):
        os.remove(image_path)
    remove_from_index(album, image_name)
    albums_collection.update_one({"_id": oid_}, {"$pull": {"images": image_name}})
    return jsonify({"message": "Image deleted successfully"})


# Edit Album
@app.route('/edit_album', methods=['PUT'])
def edit_album():
    data = request.get_json(silent=True) or {}
    album_id = data.get('album_id')
    new_name = (data.get('new_album_name') or '').strip()
    oid_ = oid(album_id)
    if not oid_ or not new_name:
        return jsonify({"error": "Album ID and new album name are required"}), 400

    album = albums_collection.find_one({"_id": oid_})
    if not album:
        return jsonify({"error": "Album not found"}), 404
    if forbidden(album):
        return jsonify({'error': 'Not your album'}), 403

    albums_collection.update_one({"_id": oid_}, {"$set": {"album_name": new_name}})
    return jsonify({"message": "Album name updated successfully"})


# Delete Album
@app.route('/delete_album', methods=['DELETE'])
def delete_album():
    data = request.get_json(silent=True) or {}
    album_id = data.get('album_id')
    oid_ = oid(album_id)
    if not oid_:
        return jsonify({"error": "Album ID is required"}), 400

    album = albums_collection.find_one({"_id": oid_})
    if not album:
        return jsonify({'error': 'Album not found'}), 404
    if forbidden(album):
        return jsonify({'error': 'Not your album'}), 403

    shutil.rmtree(os.path.join(IMAGE_FOLDER, str(album_id)), ignore_errors=True)
    shutil.rmtree(os.path.join(VECTOR_FOLDER, str(album_id)), ignore_errors=True)
    albums_collection.delete_one({"_id": oid_})
    return jsonify({"message": "Album deleted successfully"})


if __name__ == '__main__':
    if sys.argv[1:] == ['reindex']:  # rebuild every album's face index with the current model
        for album in albums_collection.find():
            for name in ("index.faiss", "meta.json"):
                p = os.path.join(VECTOR_FOLDER, str(album["_id"]), name)
                if os.path.exists(p):
                    os.remove(p)
            get_index(album)
            print("reindexed", album["_id"], album["album_name"])
        sys.exit(0)
    app.run(debug=os.getenv('FLASK_DEBUG') == '1', host='0.0.0.0', port=7860)
