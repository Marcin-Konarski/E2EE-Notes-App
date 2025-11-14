# Frontend
FROM node:24-slim AS build

RUN apt-get update

RUN groupadd app && useradd -m -g app app

WORKDIR /app
# RUN npm init -y
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

RUN chown -R app:app /app
USER app

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Nginx
FROM nginx:1.29-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

# Copy from the frontend image to nginx to set up as production
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx","-g","daemon off;"]