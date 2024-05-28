# Maintenance Jobs

## PMBC Import

We receive the parcel data in a GDB from PMBC, this data changes and needs to be imported once a year.

1. Grab the new PMBC export in GDB and download to local machine
1. Setup Portforwading as necessary to get access to Postgres
1. Truncate the existing parcel_lookup table
1. Run the following command replacing username and password as
   necessary: `ogr2ogr -f "PostgreSQL" PG:"host=localhost port=5432 dbname=app user=postgres password=postgres active_schema=alcs" PMBC_export.gdb -nln parcel_lookup`
1. Be patient, this will import ~2 million rows and will take ~10 minutes

## Running Jobs in Openshift

The main ALCS service has been programmed with several useful jobs. Jobs can be executed locally by checking the package
json and running the relevant commands.

### Openshift

Using the template below these jobs can be executed inside openshift. Once logged into OpenShift go to the Jobs tab and
Click new Job. Paste the below yml and update the following pieces:

* Replace the JOB_NAME with the jobs name
* Replace NAMESPACE with the project where you want to run the job
* Replace VERSION_HERE with the version of the image to use
* Replace COMMAND_HERE with the command to execute such as import

### Template

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