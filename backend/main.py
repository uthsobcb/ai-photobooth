import os
import shutil
import uuid
import cv2
import numpy as np
import faiss
import face_recognition
import pickle
import jwt
import pymongo
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from werkzeug.security import safe_join
from flask_cors import CORS
from bson.objectid import ObjectId
from datetime import datetime
from dotenv import load_dotenv

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
MAX_SIDE = 1600          # downscale big photos before face detection (speed)
MAX_DISTANCE = 0.6       # face_recognition's standard Euclidean threshold
MAX_RESULTS = 100


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def oid(value):
    """ObjectId or None, so a bad id is a 404 instead of a 500."""
    try:
        return ObjectId(value)
    except Exception:
        return None


def get_album_index_path(album_id):
    folder = os.path.join(VECTOR_FOLDER, str(album_id))
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "index.pkl")


def read_faces(file):
    """Decode an upload in memory -> list of (box, 128d encoding). None if unreadable."""
    data = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        return None
    h, w = image.shape[:2]
    scale = MAX_SIDE / max(h, w)
    if scale < 1:
        image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    boxes = face_recognition.face_locations(rgb, model="hog")
    return list(zip(boxes, face_recognition.face_encodings(rgb, boxes)))


def remove_from_index(album_id, rel_path):
    """Drop every face of one image from the album's FAISS index."""
    path = get_album_index_path(album_id)
    if not os.path.exists(path):
        return
    with open(path, "rb") as f:
        index, metadata = pickle.load(f)
    keep = [i for i, m in enumerate(metadata) if m != rel_path]
    if len(keep) == len(metadata):
        return
    new_index = faiss.IndexFlatL2(128)
    if keep:
        new_index.add(index.reconstruct_n(0, index.ntotal)[keep])
    with open(path, "wb") as f:
        pickle.dump((new_index, [metadata[i] for i in keep]), f)


# Set CLERK_JWKS_URL (https://<your-clerk-domain>/.well-known/jwks.json) to enforce auth.
JWKS_URL = os.getenv('CLERK_JWKS_URL')
jwks = jwt.PyJWKClient(JWKS_URL) if JWKS_URL else None
if not jwks:
    print("WARNING: CLERK_JWKS_URL not set, trusting client-sent user_id (dev only)")


def current_user():
    """Clerk user id from the Bearer token, or None if missing/invalid."""
    if not jwks:  # dev fallback
        data = request.get_json(silent=True) or {}
        return data.get('user_id') or request.args.get('user_id')
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

    faces = read_faces(file)
    if faces is None:
        return jsonify({'error': 'Could not read image file'}), 400
    if not faces:
        return jsonify({'error': 'No face detected in this photo'}), 400

    file.seek(0)
    album_folder = os.path.join(IMAGE_FOLDER, str(album_id))
    os.makedirs(album_folder, exist_ok=True)
    filename = f"{datetime.now():%Y%m%d_%H%M%S}_{uuid.uuid4().hex[:6]}_{secure_filename(file.filename)}"
    file.save(os.path.join(album_folder, filename))
    relative_path = os.path.join(str(album_id), filename)

    index_path = get_album_index_path(album_id)
    if os.path.exists(index_path):
        with open(index_path, "rb") as f:
            index, metadata = pickle.load(f)
    else:
        index, metadata = faiss.IndexFlatL2(128), []

    index.add(np.array([enc for _, enc in faces], dtype=np.float32))
    metadata.extend([relative_path] * len(faces))
    with open(index_path, "wb") as f:
        pickle.dump((index, metadata), f)

    albums_collection.update_one({"_id": oid_}, {"$push": {"images": relative_path}})
    return jsonify({'message': 'Image uploaded and processed', 'filename': relative_path, 'faces': len(faces)})


# Search Faces Within Album
@app.route('/albums/<album_id>/find_faces', methods=['POST'])
def find_faces(album_id):
    file = request.files.get('file')
    if not file or not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Please choose a PNG or JPG image'}), 400

    faces = read_faces(file)
    if faces is None:
        return jsonify({'error': 'Could not read image file'}), 400
    if not faces:
        return jsonify({'error': 'No face detected in your photo'}), 400

    if not oid(album_id):
        return jsonify({'error': 'Album not found'}), 404
    index_path = get_album_index_path(album_id)
    if not os.path.exists(index_path):
        return jsonify({"matches": []})  # album exists but has no photos yet

    with open(index_path, "rb") as f:
        index, metadata = pickle.load(f)
    if index.ntotal == 0:
        return jsonify({"matches": []})

    # Largest face in the frame is the subject; background faces are ignored
    box, encoding = max(faces, key=lambda f: (f[0][2] - f[0][0]) * (f[0][1] - f[0][3]))
    query = np.array(encoding, dtype=np.float32).reshape(1, -1)
    D, I = index.search(query, k=min(MAX_RESULTS, index.ntotal))

    best = {}  # one entry per photo, closest face wins. FAISS L2 is squared distance.
    for i, d in zip(I[0], D[0]):
        dist = float(np.sqrt(d))
        if 0 <= i < len(metadata) and dist < MAX_DISTANCE:
            best[metadata[i]] = min(dist, best.get(metadata[i], dist))

    matches = [{"path": p, "score": d} for p, d in sorted(best.items(), key=lambda kv: kv[1])]
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
    remove_from_index(album_id, image_name)
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
    app.run(debug=os.getenv('FLASK_DEBUG') == '1', host='0.0.0.0', port=7860)
