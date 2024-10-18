import whisper
import os

# Load the Whisper model
model = whisper.load_model("base")

def transcribe_audio(audio_file):
    # Ensure the 'temp' directory exists
    temp_dir = "temp"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    
    # Save the audio file locally to transcribe
    audio_path = os.path.join(temp_dir, audio_file.filename)
    audio_file.save(audio_path)

    # Transcribe audio using Whisper
    result = model.transcribe(audio_path)
    print(result["text"])
    return result["text"]
