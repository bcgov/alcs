# Database Recovery

- Disable ArgoCD autosync on the environment you're restoring
    - If Argo is blank add user to gitopsteam in tools environment
- Spin down the FE, API
    - Reduce pods to 0
- Spin down the database then spin back up to ensure all connections are closed
- Login through openshift
- Run this command `oc debug jobs/alcs-db-backup-manual -n $namespace`
    - Test env job is under a different job  `oc debug jobs/manual-backup -n $namespace`
- After sucessful sign in to pod, run `./backup.sh -l` to list available backups
- Resore with this command `./backup.sh -r alcs-patroni:5432/app -f /backups/path-to-desired-file/desired-file.sql.gz`
    - Example `./backup.sh -r alcs-patroni:5432/app -f /backups/daily/2023-01-13/alcs-patroni-app_2023-01-13_10-41-17.sql.gz`
- Enter superuser password when prompted

## Recovery Settings

- Frequency of backups can be changed in `alcs-db-backup` CronJob yml
- Number of retained backups can be changed in `alcs-db-backup-config` ConfigMap yml
- More information on ([backup.sh](https://github.com/BCDevOps/backup-container/blob/master/README.md))
