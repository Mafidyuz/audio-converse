import whisper
import os
from openai import OpenAI

# Load the Whisper model
model = whisper.load_model("turbo")

def transcribe_audio_local(audio_file):
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

client = OpenAI()


def generate_corrected_transcript(temperature, transcription):
    system_prompt = "You are a helpful assistant. Your task is to correct any spelling discrepancies in the transcribed text. Only add necessary punctuation such as periods, commas, and capitalization. The text is gonna be medical so pay especial attention to the medical terms that might have been transcribed wrongly."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=temperature,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": transcription
            }
        ]
    )
    return response.choices[0].message.content

def transcribe_audio_server(audio_file):
    # Ensure the 'temp' directory exists
    temp_dir = "temp"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    
    # Save the audio file locally to transcribe
    audio_path = os.path.join(temp_dir, audio_file.filename)
    audio_file.save(audio_path)
    audio_file = open(audio_path, "rb")

    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file, 
        response_format="text"
    )

    print(transcription)
    corrected_text = generate_corrected_transcript(0, transcription)
    return corrected_text
