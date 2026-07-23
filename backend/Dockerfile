# Use official Node.js LTS (Alpine for smaller size)
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# Expose port 5000 (matches our backend PORT env)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
