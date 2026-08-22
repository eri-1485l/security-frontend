#!/bin/sh
set -e

if [ -z "${API_KEY}" ]; then
    echo "ERROR: API_KEY must be set at container runtime."
    exit 1
fi

BACKEND_HOST="${BACKEND_HOST:-host.docker.internal}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

export API_KEY BACKEND_HOST BACKEND_PORT

# Substitute only these vars so nginx tokens like $host stay intact.
envsubst '${API_KEY} ${BACKEND_HOST} ${BACKEND_PORT}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf

echo "Nginx config generated at /etc/nginx/conf.d/default.conf"
echo "Proxy target: ${BACKEND_HOST}:${BACKEND_PORT}"

exec nginx -g "daemon off;"
