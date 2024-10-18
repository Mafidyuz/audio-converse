# AudioConverse

AudioConverse is an interactive web application that allows users to upload audio files or record audio directly, generating transcriptions and summaries. Built with a Flask backend, a React frontend, and a Streamlit chatbot interface, the application leverages OpenAI's models for transcription and summarization and utilizes Qdrant for efficient vector storage and retrieval.

## Key Features
- Upload audio files or record audio directly from the browser.
- Transcribe audio to text using OpenAI Whisper.
- Generate concise summaries from transcriptions using OpenAI GPT.
- Interactive chatbot interface for conversational interactions.
- Easy to deploy using Docker with a multi-service architecture.

## Technologies Used
- **Frontend**: React
- **Backend**: Flask
- **Chatbot Interface**: Streamlit
- **Database**: Qdrant
- **AI Models**: OpenAI Whisper for transcription, OpenAI GPT for summarization

## Getting Started

### Prerequisites
- Docker installed on your machine.

### Running the Application
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/AudioConverse.git
   ```
2. Navigate to the project directory:
   ```bash
   cd AudioConverse
   ```
3. Build and start the services:
   ```bash
   docker-compose up --build
   ```

### Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Chatbot**: [http://localhost:8501](http://localhost:8501)
- **Qdrant Dashboard**: [http://localhost:6333](http://localhost:6333)

## Environment Variables
- Create a `.env` file in the `chatbot` directory and add your OpenAI API key:
  ```
  OPENAI_API_KEY=your_api_key
  ```

- Additionally, create a `.env.example` file in the `chatbot` directory to provide an example of required environment variables.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any improvements or bug fixes.

## License
This project is licensed under the MIT License.
