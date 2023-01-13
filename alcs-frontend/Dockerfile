###### Install dependencies only when needed ######
FROM node:18.12-alpine AS build

# Make /app as working directory
WORKDIR /app

# Copy package.json file
COPY package.json .

# Install dependencies
# TODO: Replace with ci when fixed - https://github.com/ng-select/ng-select/issues/2111
RUN npm install --legacy-peer-deps

# Copy the source code to the /app directory
COPY . .

# Build the application
RUN npm run build --  --output-path=dist --output-hashing=all


######  Use Nginx alpine image  ######
FROM nginx:stable-alpine

### OpenShift fixes ####
# https://torstenwalter.de/openshift/nginx/2017/08/04/nginx-on-openshift.html
# support running as arbitrary user which belogs to the root group
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx

# use a non 80 port
EXPOSE 8081

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy init.sh
COPY ./init.sh .

# Copy nginx config file
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN chmod -R go+rwx /etc/nginx

# Copy dist folder fro build stage to nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Dynamically update environment values
RUN chmod -R go+rwx /usr/share/nginx/html/assets

# provide dynamic scp content-src
ENV ENABLED_CONNECT_SRC=" 'self' http://localhost:* nrs.objectstore.gov.bc.ca"

# When the container starts, replace the settings.json with values from environment variables
ENTRYPOINT [ "./init.sh" ]
