from flask import Flask, request, jsonify
from flask_cors import CORS
from whisper_transcript import transcribe_audio
from gpt_summary import generate_summary
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, PointStruct
import openai
import os
import uuid

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Qdrant client
qdrant_client = QdrantClient(host="qdrant", port=6333)

api_key = os.getenv('OPENAI_API_KEY')
openai_client = openai.OpenAI(api_key=api_key)

COLLECTION_NAME = "transcription_summary"

# Ensure collection exists
def create_qdrant_collection():
    if not qdrant_client.collection_exists(collection_name=COLLECTION_NAME):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance="Cosine")
        )

def get_embeddings(text):
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",  # OpenAI's embedding model
        input=[text]
    )
    return response.data[0].embedding

@app.route("/transcribe", methods=["POST"])
def transcribe():
    file = request.files['file']
    transcription = transcribe_audio(file)
    return jsonify({"transcription": transcription})

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    transcription = data.get("transcription")
    summary = generate_summary(transcription)
    return jsonify({"summary": summary})

# Confirm transcription or summary and save in Qdrant
@app.route("/confirm", methods=["POST"])
def confirm():
    data = request.get_json()
    transcription = data.get("transcription")
    summary = data.get("summary")

    if transcription:
        transcription_embedding = get_embeddings(transcription)
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=[PointStruct(
                id=str(uuid.uuid4()),
                vector=transcription_embedding,
                payload={"type": "transcription", "text": transcription}
            )]
        )

    if summary:
        summary_embedding = get_embeddings(summary)
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=[PointStruct(
                id=str(uuid.uuid4()),
                vector=summary_embedding,
                payload={"type": "summary", "text": summary}
            )]
        )

    return jsonify({"message": "Data saved successfully!"})

if __name__ == "__main__":
    create_qdrant_collection()
    app.run(host='0.0.0.0', port=5000)
