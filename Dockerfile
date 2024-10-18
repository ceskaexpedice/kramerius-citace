# Use an official Node.js image from the Docker Hub
FROM node:16-alpine

# Create a directory for the app inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the port that your app will run on
EXPOSE 3000

# Start the Node.js app
CMD ["npm", "run", "start"]
