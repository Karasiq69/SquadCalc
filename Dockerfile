# === Build stage ===
FROM node:22-alpine AS builder
WORKDIR /app

ARG API_URL=https://calc.krest.gg/api
ARG SEARCH_ENGINES=false
ARG SMO_WEBSOCKET=false

COPY package*.json ./
RUN npm ci

COPY . .

RUN printf "API_URL=%s\nSEARCH_ENGINES=%s\nSMO_WEBSOCKET=%s\n" \
    "$API_URL" "$SEARCH_ENGINES" "$SMO_WEBSOCKET" > .env \
 && npm run build

# === Serve stage ===
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]