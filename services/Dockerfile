###################
# BUILD FOR LOCAL DEVELOPMENT
# https://www.tomray.dev/nestjs-docker-production
###################

FROM node:20-alpine AS development

WORKDIR /opt/app-root/

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine AS build
ARG NEST_APP=alcs

WORKDIR /opt/app-root/

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /opt/app-root/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build ${NEST_APP}

RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine AS production
ARG NEST_APP=alcs

# Init 
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /opt/app-root/

RUN chmod og+rwx /opt/app-root/ /var/run

ARG environment=production
ENV NODE_ENV=${environment}

COPY --from=build /opt/app-root/node_modules ./node_modules
COPY --from=build /opt/app-root/dist/apps/${NEST_APP} ./dist
COPY ./config/ /opt/app-root/config/
COPY ./local-certificates /opt/app-root/local-certificates
COPY ./templates/ /opt/app-root/templates/

# Create Empty Config File if not Exists
RUN mkdir -p /vault/secrets
RUN touch /vault/secrets/config
RUN . /vault/secrets/config

CMD [ "node", "dist/main.js" ]