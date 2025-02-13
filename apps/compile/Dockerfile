# Dockerfile
FROM node:20-slim as development

WORKDIR /usr/src/app

# Install Docker CLI and procps
RUN apt-get update && apt-get install -y \
    docker.io \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p dist/apps/temp dist/apps/solution \
    && chmod 777 dist/apps/temp \
    && chmod 777 dist/apps/solution

# Build application
RUN npm run build

# Production stage
FROM node:20-slim as production

WORKDIR /usr/src/app

# Install Docker CLI and procps
RUN apt-get update && apt-get install -y \
    docker.io \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy build files from development stage
COPY --from=development /usr/src/app/dist ./dist

# Create necessary directories with proper permissions
# Add these lines after installing docker.io
RUN groupadd -g 999 docker && \
    usermod -aG docker node && \
    chmod 666 /var/run/docker.sock

# Make sure compilation directories are properly owned
RUN mkdir -p dist/apps/compile/temp dist/apps/compile/solution && \
    chown -R node:node dist/apps/compile && \
    chmod -R 777 dist/apps/compile
VOLUME ["/usr/src/app/dist"]


# Start application as root
CMD ["node", "dist/apps/compile/main"]

