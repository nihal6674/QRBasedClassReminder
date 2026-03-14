# Auth Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (this will trigger postinstall script)
RUN npm ci

# Copy application code
COPY . .

# Regenerate Prisma client for the correct platform (in case postinstall didn't run due to env issues)
RUN npm run build || npx prisma generate --schema=./shared/prisma/schema.prisma || true

# Expose the service port
EXPOSE 3001

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "start"]
