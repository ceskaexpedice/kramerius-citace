# Use an official Node.js LTS image from the Docker Hub
FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Install all dependencies (including TypeScript) needed for the build
COPY package*.json ./
RUN npm ci

# Compile TypeScript to dist/
COPY . .
RUN npm run build

FROM node:22-alpine

# Create a directory for the app inside the container
WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the compiled app and the files it reads at runtime
COPY --from=build /usr/src/app/dist ./dist
COPY locales ./locales
COPY openapi.json ./

# Runtime configuration (can be overridden with `docker run -e ...`)
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port that your app will run on
EXPOSE 3000

# Start the Node.js app
CMD ["node", "dist/index.js"]
