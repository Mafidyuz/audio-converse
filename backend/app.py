from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
from whisper_transcript import transcribe_audio
from gpt_summary import generate_summary
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, PointStruct
import openai
import os 

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Qdrant client
qdrant_client = QdrantClient(host="qdrant", port=6333)  # Adjust host/port if necessary

api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)

# Name of the collection in Qdrant
COLLECTION_NAME = "transcription_summary"

# Ensure the collection exists in Qdrant
def create_qdrant_collection():
    if not qdrant_client.collection_exists(collection_name=COLLECTION_NAME):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance="Cosine")  # Adjust size based on embedding model
        )

# Get embeddings for a given text using OpenAI embeddings API
def get_embeddings(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",  # OpenAI's embedding model
        input=[text]
    )
    return response.data[0].embedding

# Transcription endpoint
@app.route("/transcribe", methods=["POST"])
def transcribe():
    file = request.files['file']
    transcription = transcribe_audio(file)

    # Compute embeddings for transcription
    transcription_embedding = get_embeddings(transcription)

    # Store transcription in Qdrant
    point_id = qdrant_client.get_collection(COLLECTION_NAME).points_count  # Assign a unique ID
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=point_id,
                vector=transcription_embedding,
                payload={
                    "type": "transcription",
                    "text": transcription
                }
            )
        ]
    )

    return jsonify({"transcription": transcription})

# Summary endpoint
@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    transcription = data.get("transcription")

    # Generate summary
    summary = generate_summary(transcription)

    # Compute embeddings for the summary
    summary_embedding = get_embeddings(summary)

    # Store summary in Qdrant
    point_id = qdrant_client.get_collection(COLLECTION_NAME).points_count
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=point_id,
                vector=summary_embedding,
                payload={
                    "type": "summary",
                    "text": summary
                }
            )
        ]
    )

    return jsonify({"summary": summary})

# Initialize the collection
if __name__ == "__main__":
    create_qdrant_collection()  # Make sure the collection is set up
    app.run(host='0.0.0.0', port=5000)
