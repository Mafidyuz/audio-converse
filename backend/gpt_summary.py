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
            {"role": "system", "content": "You help summarizing medical reports."},
            {"role": "user", "content": f"Summarize the following transcription. Use bullet points if it makes sense. After the summary write the top 5 key words: {transcription}"}
        ]
    )
    print(response)
    return response.choices[0].message.content
