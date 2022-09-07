if ! oc whoami
then
    echo
    echo "Please obtain an OpenShift API token by following this link"
    echo "https://oauth-openshift.apps.silver.devops.gov.bc.ca/oauth/token/request"
    exit
fi

docker login -u `oc whoami` -p `oc whoami --show-token` image-registry.apps.silver.devops.gov.bc.ca

