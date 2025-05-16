import os
import cv2
import numpy as np
import faiss
import face_recognition
import pickle
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
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_album_index_path(album_id):
    folder = os.path.join(VECTOR_FOLDER, str(album_id))
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "index.pkl")

# Create Album
@app.route('/create_album', methods=['POST'])
def create_album():
    data = request.json
    user_id = data.get('user_id')
    album_name = data.get('album_name')

    album = {
        "user_id": user_id,
        "album_name": album_name,
        "images": [],
        "created_at": datetime.utcnow()
    }
    album_id = albums_collection.insert_one(album).inserted_id

    # Create album-specific image folder
    os.makedirs(os.path.join(IMAGE_FOLDER, str(album_id)), exist_ok=True)
    return jsonify({"album_id": str(album_id), "album_url": f"/albums/{album_id}"})


# Upload Image & Add to Album
@app.route('/albums/<album_id>/upload', methods=['POST'])
def upload_image(album_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    album = albums_collection.find_one({"_id": ObjectId(album_id)})
    if not album:
        return jsonify({'error': 'Album not found'}), 404

    # Store in album-specific folder
    album_folder = os.path.join(IMAGE_FOLDER, str(album_id))
    os.makedirs(album_folder, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
    filename = timestamp + secure_filename(file.filename)
    filepath = os.path.join(album_folder, filename)
    file.save(filepath)

    image = cv2.imread(filepath)
    if image is None:
        os.remove(filepath)
        return jsonify({'error': 'Could not read image file'}), 400

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_image, model="hog")
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

    if len(face_encodings) == 0:
        os.remove(filepath)
        return jsonify({'error': 'No face detected'}), 400

    relative_path = os.path.join(str(album_id), filename)

    index_path = get_album_index_path(album_id)
    if os.path.exists(index_path):
        with open(index_path, "rb") as f:
            index, metadata = pickle.load(f)
    else:
        index = faiss.IndexFlatL2(128)
        metadata = []

    for encoding in face_encodings:
        index.add(np.array([encoding], dtype=np.float32))
        metadata.append(relative_path)

    with open(index_path, "wb") as f:
        pickle.dump((index, metadata), f)

    albums_collection.update_one(
        {"_id": ObjectId(album_id)},
        {"$push": {"images": relative_path}}
    )

    return jsonify({'message': 'Image uploaded and processed', 'filename': relative_path})


# Search Faces Within Album
@app.route('/albums/<album_id>/find_faces', methods=['POST'])
def find_faces(album_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    image = cv2.imread(filepath)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_image, model="hog")
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

    if len(face_encodings) == 0:
        os.remove(filepath)
        return jsonify({'error': 'No face detected'}), 400

    index_path = get_album_index_path(album_id)
    if not os.path.exists(index_path):
        os.remove(filepath)
        return jsonify({'error': 'No vector DB for this album'}), 404

    with open(index_path, "rb") as f:
        index, metadata = pickle.load(f)

    query_encoding = np.array(face_encodings[0], dtype=np.float32).reshape(1, -1)
    D, I = index.search(query_encoding, k=5)

    MAX_DISTANCE = 0.6

    matched_images = [
        {
            "path": metadata[i],
            "score": float(dist)
        }
        for i, dist in zip(I[0], D[0])
        if 0 <= i < len(metadata) and dist < MAX_DISTANCE
    ]

    return jsonify({"matches": matched_images})


# Fetch all albums of a user
@app.route('/fetch-albums', methods=['GET'])
def fetch_albums():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    albums = list(albums_collection.find({"user_id": user_id}, {"_id": 1, "album_name": 1}))
    for album in albums:
        album["album_id"] = str(album["_id"])
        del album["_id"]

    return jsonify({"albums": albums})


# Get Album Details
@app.route('/albums/<album_id>', methods=['GET'])
def get_album(album_id):
    album = albums_collection.find_one({"_id": ObjectId(album_id)})
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
    if os.path.isfile(file_path):
        return send_file(file_path)
    return jsonify({'error': 'File not found'}), 404


# Delete Image
@app.route('/delete_image', methods=['DELETE'])
def delete_image():
    data = request.json
    image_name = data.get('image_name')
    album_id = data.get('album_id')
    if not image_name or not album_id:
        return jsonify({"error": "Image name and album ID are required"}), 400

    image_path = os.path.join(IMAGE_FOLDER, image_name)
    if os.path.exists(image_path):
        os.remove(image_path)

    albums_collection.update_one(
        {"_id": ObjectId(album_id)},
        {"$pull": {"images": image_name}}
    )
    return jsonify({"message": "Image deleted successfully"})


# Edit Album
@app.route('/edit_album', methods=['PUT'])
def edit_album():
    data = request.json
    album_id = data.get('album_id')
    new_album_name = data.get('new_album_name')

    if not album_id or not new_album_name:
        return jsonify({"error": "Album ID and new album name are required"}), 400

    result = albums_collection.update_one(
        {"_id": ObjectId(album_id)},
        {"$set": {"album_name": new_album_name}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Album not found or name unchanged"}), 404

    return jsonify({"message": "Album name updated successfully"})


# Delete Album
@app.route('/delete_album', methods=['DELETE'])
def delete_album():
    data = request.json
    album_id = data.get('album_id')
    if not album_id:
        return jsonify({"error": "Album ID is required"}), 400

    album = albums_collection.find_one({"_id": ObjectId(album_id)})
    if not album:
        return jsonify({'error': 'Album not found'}), 404

    for image in album.get("images", []):
        image_path = os.path.join(IMAGE_FOLDER, image)
        if os.path.exists(image_path):
            os.remove(image_path)

    index_path = get_album_index_path(album_id)
    if os.path.exists(index_path):
        os.remove(index_path)

    albums_collection.delete_one({"_id": ObjectId(album_id)})
    return jsonify({"message": "Album deleted successfully"})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7860)
    