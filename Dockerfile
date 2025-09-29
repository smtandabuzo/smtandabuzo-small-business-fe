# Stage 1: Build the Angular application
FROM node:20-alpine as build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies with verbose output
RUN npm ci --verbose

# Copy the rest of the application
COPY . .

# Build the application with production configuration
RUN npm run build -- --configuration=production --output-path=dist/small-business-fe

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist/small-business-fe/ /usr/share/nginx/html/

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /usr/share/nginx/html/*.js && \
    chmod 644 /usr/share/nginx/html/*.css

# Expose port 8080
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
