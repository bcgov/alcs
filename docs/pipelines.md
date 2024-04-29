# Pipelines

* OWASP ZAP - Split among two files one for frontend the other for backend. Manually triggered and runs OWASP Zap
  against the production environments. Creating github issues for any issues.
* Code Coverage - Runs npm rum test:cov against all projects and aggregates the code coverage data. This is the data
  codeclimate uses for its coverage.
* Generate Schemaspy Docs - This runs migrations then runs schemaspy against the environment. Triggered on Main merged
  and keeps the Schemaspy docs up to date.
* E2E Testing w/ Playwright - E2E automation tests. Runs once daily and has an attached report of any failures.
