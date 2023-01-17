# Database Recovery

- Disable ArgoCD autosync on the environment you're restoring
- Spin down the FE, API
- Spin down the database then spin back up to ensure all connections are closed
- Run this command `oc debug jobs/alcs-db-backup-manual -n $namespace`

- `./backup.sh -r alcs-patroni:5432/app -f /backups/daily/2023-01-13/alcs-patroni-app_2023-01-13_10-41-17.sql.gz`
