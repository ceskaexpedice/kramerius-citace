# Use an official Node.js LTS image from the Docker Hub
FROM node:22-alpine

# Create a directory for the app inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies only (ts-node and typescript are regular dependencies)
RUN npm ci --omit=dev

# Copy the rest of your application files
COPY . .

# Runtime configuration (can be overridden with `docker run -e ...`)
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port that your app will run on
EXPOSE 3000

# Start the Node.js app
CMD ["npm", "run", "start"]
