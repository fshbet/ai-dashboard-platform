FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN mkdir -p /data /uploads
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
ENV NODE_ENV=production PORT=4000 DATABASE_PATH=/data/dashboards.db UPLOAD_DIR=/uploads
EXPOSE 4000
CMD ["node", "dist/index.js"]
