# Best practices
https://github.com/kubeflow/manifests/blob/master/docs/KustomizeBestPractices.md




## Redis
`helm install -f redis-values.yaml alcs-redis ../..//redis`

To get your password run:

    export REDIS_PASSWORD=$(kubectl get secret --namespace a5cf88-dev alcs-redis -o jsonpath="{.data.redis-password}" | base64 -d)

To connect to your Redis&reg; server:

1. Run a Redis&reg; pod that you can use as a client:

   kubectl run --namespace a5cf88-dev redis-client --restart='Never'  --env REDIS_PASSWORD=$REDIS_PASSWORD  --image docker.io/bitnami/redis:7.0.4-debian-11-r11 --command -- sleep infinity

   Use the following command to attach to the pod:

   kubectl exec --tty -i redis-client \
   --namespace a5cf88-dev -- bash

2. Connect using the Redis&reg; CLI:
   REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h alcs-redis-master
   REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h alcs-redis-replicas

To connect to your database from outside the cluster execute the following commands:

    kubectl port-forward --namespace a5cf88-dev svc/alcs-redis-master 6379:6379 &
    REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h 127.0.0.1 -p 6379


## Patroni
`helm install -f patroni-values.yaml alcs-patroni patroni-chart/patroni`

https://github.com/bcgov/nr-patroni-chart

helm install alcs-patroni patroni-chart/patroni

### NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace a5cf88-dev -l "app.kubernetes.io/name=patroni,app.kubernetes.io/instance=alcs-patroni" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace a5cf88-dev $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace a5cf88-dev port-forward $POD_NAME 8080:$CONTAINER_PORT
