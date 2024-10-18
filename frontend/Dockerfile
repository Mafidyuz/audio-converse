# Use an official Node.js runtime as a base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the development server
EXPOSE 3000

# Run the development server for hot-reloading
CMD ["npm", "start"]
