FROM node:22-alpine

WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Copy and setup the startup script
COPY docker-start.sh ./
RUN chmod +x docker-start.sh

# Start using the script
CMD ["./docker-start.sh"]
