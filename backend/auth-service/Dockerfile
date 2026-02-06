# Auth Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy prisma schema
COPY shared/prisma ./shared/prisma

# Generate Prisma client
RUN npx prisma generate --schema=./shared/prisma/schema.prisma

# Copy application code
COPY . .

# Expose the service port
EXPOSE 3001

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "start"]
