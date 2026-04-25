FROM nginx:alpine

# Copiar archivos estáticos del sitio
COPY src/ /usr/share/nginx/html/

# Copiar db.json para que el sitio lo pueda cargar como fallback estático
COPY db.json /usr/share/nginx/html/db.json

# Reemplazar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
