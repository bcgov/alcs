#!/bin/sh

echo 'Replace nginx environment variables'
envsubst "`printf '${%s} ' $(awk 'BEGIN{for(v in ENVIRON) print v}')`" < /etc/nginx/nginx.conf > /tmp/nginx.conf && cp /tmp/nginx.conf /etc/nginx/nginx.conf

# When the container starts, replace the settings.json with values from environment variables
envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

exec nginx -g 'daemon off;'
