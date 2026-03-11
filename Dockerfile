# STAGE 1: Build & Test (The "Workshop")
FROM node:20-alpine AS build_stage
WORKDIR /app

# 1. Install ALL dependencies (including devDependencies like Jest/Vite)
COPY package*.json ./
RUN npm install

# 2. Copy the full source code
COPY . .

# 3. Quality Gates
# This ensures no broken code or failing tests make it to the next stage
RUN npm run lint || echo "Linting issues found, but continuing..."
RUN npm test -- --watchAll=false

# 4. Generate the production assets (creates the /build or /dist folder)
RUN npm run build


# STAGE 2: Production (The "Final Package")
# We switch to Nginx for high-performance static file serving
FROM nginx:stable-alpine

# 5. Copy ONLY the compiled static files from the build_stage
# Note: For Create React App use /app/build. For Vite use /app/dist.
COPY --from=build_stage /app/build /usr/share/nginx/html

# 6. Expose port 80 for the web server
EXPOSE 80

# 7. Start Nginx
CMD ["nginx", "-g", "daemon off;"]