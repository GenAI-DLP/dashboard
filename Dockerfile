# dashboard/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite는 빌드 타임에 import.meta.env.VITE_* 를 번들에 박아넣는다 (런타임 env로는 안 바뀜).
# 소스(src/lib/api.ts)가 읽는 이름은 VITE_API_BASE.
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80