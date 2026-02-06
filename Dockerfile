# Etapa 1: Construcción (Node)
FROM node:25-alpine AS build
WORKDIR /app
ARG VITE_WEBHOOK_URL
ENV VITE_WEBHOOK_URL=$VITE_WEBHOOK_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor (Nginx)
FROM nginx:stable-alpine
# En lugar de RUN sed, simplemente COPIAMOS nuestra configuración
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]