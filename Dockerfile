# Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/app

# Copy app dependencies
COPY app/package.json app/package-lock.json ./
RUN npm install

# Copy app source
COPY app/src ./src
COPY app/public ./public
COPY app/*.config.* ./
COPY app/tsconfig.json ./
COPY app/vite.config.ts ./

# Build app
RUN npm run build

# Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/flight-backend

# Copy backend dependencies
COPY flight-backend/package.json flight-backend/package-lock.json ./
RUN npm install

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy backend source
COPY flight-backend/src /app/flight-backend/src
COPY flight-backend/package.json /app/flight-backend/
COPY --from=backend-builder /app/flight-backend/node_modules /app/flight-backend/node_modules

# Copy frontend build to backend public directory
COPY --from=frontend-builder /app/app/dist /app/flight-backend/public

# Set working directory to backend
WORKDIR /app/flight-backend

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
