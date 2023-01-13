#!/bin/sh

echo 'Replace connect-src with' $ENABLED_CONNECT_SRC
envsubst < /etc/nginx/nginx.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf

# When the container starts, replace the settings.json with values from environment variables
envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

exec nginx -g 'daemon off;'
