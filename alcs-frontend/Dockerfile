###### Install dependencies only when needed ######
FROM node:18-alpine AS build

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

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config file
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copy dist folder fro build stage to nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Start Nginx service
CMD ["nginx", "-g", "daemon off;"]