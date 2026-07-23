# STAGE 1: Build the React Application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
# You should pass VITE_API_URL as a build arg or set it in your CI/CD environment
RUN npm run build

# STAGE 2: Serve with NGINX
FROM nginx:alpine

# Copy the custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from Stage 1 to NGINX html folder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
