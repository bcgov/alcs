# Jobs in Openshift

The main ALCS service has been programmed with several useful jobs. Jobs can be executed locally by checking the package json and running the relevant commands.

## Openshift

Using the template below these jobs can be executed inside openshift. Once logged into OpenShift go to the Jobs tab and Click new Job. Paste the below yml and update the following pieces:
* Replace the JOB_NAME with the jobs name
* Replace NAMESPACE with the project where you want to run the job
* Replace VERSION_HERE with the version of the image to use
* Replace COMMAND_HERE with the command to execute such as tagDocuments

## Template
```
apiVersion: batch/v1
kind: Job
metadata:
  name: JOB_NAME
  namespace: NAMESPACE
spec:
  parallelism: 1
  completions: 1
  backoffLimit: 1
  selector: {}
  template:
    metadata:
      name: JOB_NAME
    spec:
      volumes:
        - name: config-volume
          configMap:
            name: alcs-api
            defaultMode: 420
      containers:
        - resources:
            limits:
              cpu: 150m
              memory: 384Mi
            requests:
              cpu: 20m
              memory: 128Mi
          terminationMessagePath: /dev/termination-log
          name: alcs-api
          imagePullPolicy: Always
          volumeMounts:
            - name: config-volume
              mountPath: /opt/app-root/config
          terminationMessagePolicy: File
          image: >-
            image-registry.apps.silver.devops.gov.bc.ca/a5cf88-tools/alcs-api:VERSION_HERE
          command:
            ["node",  "dist/main.js", "COMMAND_HERE"]
      restartPolicy: Never
```