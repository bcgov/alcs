# ALCS Database Roles

## Read Access Role

This is the read access role created for the ALCS system, to be used by Metabase and developers wanting to access the database directly.

```sql
-- Create a group
CREATE ROLE readaccess;

-- Grant connect privileges
GRANT CONNECT ON DATABASE app TO readaccess;

-- Access to alcs schema
GRANT USAGE ON SCHEMA alcs TO readaccess;
GRANT SELECT ON ALL TABLES IN SCHEMA alcs TO readaccess;
ALTER DEFAULT PRIVILEGES IN SCHEMA alcs GRANT SELECT ON TABLES TO readaccess;

-- Access to portal schema
GRANT USAGE ON SCHEMA portal TO readaccess;
GRANT SELECT ON ALL TABLES IN SCHEMA portal TO readaccess;
ALTER DEFAULT PRIVILEGES IN SCHEMA portal GRANT SELECT ON TABLES TO readaccess;

-- Access to tracking sheet schema
GRANT USAGE ON SCHEMA tracking TO readaccess;
GRANT SELECT ON ALL TABLES IN SCHEMA tracking TO readaccess;
ALTER DEFAULT PRIVILEGES IN SCHEMA tracking GRANT SELECT ON TABLES TO readaccess;


```

### Create the Metabase User

```sql
CREATE USER metabase WITH PASSWORD 'FILLME';
GRANT readaccess TO metabase;
```

### Create the Developer Read User

```sql
CREATE USER readonly WITH PASSWORD 'FILLME';
GRANT readaccess TO readonly;
```
