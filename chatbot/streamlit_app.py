# Import required libraries
from dotenv import load_dotenv
from itertools import zip_longest
import streamlit as st
from streamlit_chat import message
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage

# Qdrant imports
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, SearchRequest
from openai import OpenAI
import os 

# Load environment variables
load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)

# Initialize the Qdrant client (adjust host/port if necessary)
qdrant_client = QdrantClient(host="qdrant", port=6333)
COLLECTION_NAME = "transcription_summary"  # Your Qdrant collection name


# Initialize session state variables
if 'generated' not in st.session_state:
    st.session_state['generated'] = []  # Store AI generated responses

if 'past' not in st.session_state:
    st.session_state['past'] = []  # Store past user inputs

if 'entered_prompt' not in st.session_state:
    st.session_state['entered_prompt'] = ""  # Store the latest user input

# Initialize the ChatOpenAI model
chat = ChatOpenAI(temperature=0.5, model_name="gpt-4o-mini")

def build_message_list():
    """
    Build a list of messages including system, human and AI messages.
    """
    # Start zipped_messages with the SystemMessage
    zipped_messages = [SystemMessage(
        content="You are a helpful AI assistant talking with a human. If you do not know an answer, just say 'I don't know', do not make up an answer.")]

    # Zip together the past and generated messages
    for human_msg, ai_msg in zip_longest(st.session_state['past'], st.session_state['generated']):
        if human_msg is not None:
            zipped_messages.append(HumanMessage(content=human_msg))  # Add user messages
        if ai_msg is not None:
            zipped_messages.append(AIMessage(content=ai_msg))  # Add AI messages

    return zipped_messages

def search_qdrant(query):
    """
    Search Qdrant for relevant content based on the user's query.
    """
    # Get embedding for the user query
    query_embedding = client.embeddings.create(
        model="text-embedding-3-small",  # OpenAI's embedding model
        input=[query]
    ).data[0].embedding

    # Search Qdrant for similar points
    search_result = qdrant_client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,  # The vector to search against
        limit=3,  # Retrieve top 3 relevant results
        with_payload=True  # Include the payload (stored text)
    )
    print(search_result, flush=True)

    # Extract the most relevant texts from the search result
    relevant_texts = [hit.payload['text'] for hit in search_result]

    return relevant_texts

def generate_response_with_qdrant_context(user_query):
    """
    Generate AI response using the ChatOpenAI model with context from Qdrant.
    """
    # Retrieve relevant context from Qdrant
    relevant_contexts = search_qdrant(user_query)

    # Include the relevant contexts in the system message as part of the conversation history
    context_message = "\n".join(relevant_contexts)
    print(context_message, flush=True)
    zipped_messages = build_message_list() + [
        SystemMessage(content=f"Here is some context from our database: {context_message}")
    ]

    # Generate response using the chat model
    ai_response = chat(zipped_messages)

    return ai_response.content

# Define function to submit user input
def submit():
    # Set entered_prompt to the current value of prompt_input
    st.session_state.entered_prompt = st.session_state.prompt_input
    # Clear prompt_input
    st.session_state.prompt_input = ""

# Create a text input for user
st.text_input('YOU: ', key='prompt_input', on_change=submit)

if st.session_state.entered_prompt != "":
    # Get user query
    user_query = st.session_state.entered_prompt

    # Append user query to past queries
    st.session_state.past.append(user_query)

    # Generate response with context from Qdrant
    output = generate_response_with_qdrant_context(user_query)

    # Append AI response to generated responses
    st.session_state.generated.append(output)

# Display the chat history
if st.session_state['generated']:
    for i in range(len(st.session_state['generated'])-1, -1, -1):
        # Display AI response
        message(st.session_state["generated"][i], key=str(i))
        # Display user message
        message(st.session_state['past'][i], is_user=True, key=str(i) + '_user')

