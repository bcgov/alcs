# Helper script to deploy dev environment
# TODO: Will be folded into ALCS CLI

registry-login.sh

docker build -t alcs-api:latest alcs-api 
docker tag alcs-api:latest image-registry.apps.silver.devops.gov.bc.ca/a5cf88-dev/alcs-api:latest
docker push image-registry.apps.silver.devops.gov.bc.ca/a5cf88-dev/alcs-api:latest

docker build -t alcs-migrate:latest -f alcs-api/Dockerfile.migrate alcs-api 
docker tag alcs-migrate:latest image-registry.apps.silver.devops.gov.bc.ca/a5cf88-dev/alcs-migrate:latest
docker push image-registry.apps.silver.devops.gov.bc.ca/a5cf88-dev/alcs-migrate:latest

docker build -t alcs-web:latest alcs-frontend 
docker tag alcs-web:latest image-registry.apps.silver.devops.gov.bc.ca/a5cf88-dev/alcs-web:latest
docker push image-registry.apps.silver.devops.gov.bc.ca/a5cf88-dev/alcs-web:latest
oc patch deployment/alcs-web -n a5cf88-dev --patch \
  "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"last-restart\":\"`date +'%s'`\"}}}}}"