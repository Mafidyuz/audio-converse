# Use an official Python runtime as a base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install git and PostgreSQL development headers (for psycopg2)
RUN apt-get update && apt-get install -y

# Copy the requirements file to the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Expose port 8501
EXPOSE 8501

# Run the Flask app
CMD ["streamlit", "run", "streamlit_app.py"]
