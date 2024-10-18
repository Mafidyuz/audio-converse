from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)




def generate_summary(transcription):
    response = client.chat.completions.create(
        model="gpt-4o-mini", 
            messages=[
            {"role": "system", "content": "You are a helpful summarizer."},
            {"role": "user", "content": f"Summarize the following meeting transcription: {transcription}"}
        ]
    )
    print(response)
    return response.choices[0].message.content
