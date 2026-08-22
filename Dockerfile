FROM nginx:alpine

COPY index.html styles.css app.js /usr/share/nginx/html/
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY entrypoint.sh /entrypoint.sh

# Strip Windows CRLF and make the entrypoint executable.
RUN sed -i 's/\r$//' /entrypoint.sh \
    && chmod +x /entrypoint.sh

ENV BACKEND_HOST=host.docker.internal
ENV BACKEND_PORT=8000

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
