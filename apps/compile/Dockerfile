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

USER root
RUN mkdir -p /usr/src/app/dist/apps/temp /usr/src/app/dist/apps/solution && \
        chmod -R 777 /usr/src/app/dist



# Start application as root
CMD ["node", "dist/apps/compile/main"]

# Dockerfile
# FROM node:20-slim AS development

# WORKDIR /usr/src/app

# # Install Docker CLI and procps
# RUN apt-get update && apt-get install -y \
#     docker.io \
#     procps \
#     && rm -rf /var/lib/apt/lists/*

# # Copy package files
# COPY Solution.java .

# USER root

# CMD ["sh", "-c", "\
#     echo '=== Current directory contents =====' && \
#     ls -la && \
#     docker run \
#     --rm \
#     -v /usr/src/app:/ \
#     openjdk:11 \
#     sh -c 'cd / && pwd && ls -la && javac -encoding UTF8 Solution.java'"]