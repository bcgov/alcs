# Oracle in Docker

## Prerequisites

- Docker
- Oracle account
- SQLDeveloper tool
- At least 4GB of memory allocated to docker

## Oracle 12.2 in Docker container

- login to Oracle Docker registry with your oracle account

```sh
docker login container-registry.oracle.com
```

- navigate to https://container-registry.oracle.com/ -> Database -> enterprise -> Sign in -> accept license agreement
- select image that you interested in and

```sh
docker pull <image>
```

- run container, where 5g is 5GB allocated to Oracle

```sh
docker run -d  -p 1527:1521 -p 5507:5500 -it --name oraDB --shm-size="5g" container-registry.oracle.com/database/enterprise:12.2.0.1
```

- keep an eye on container, if everything went successfully you should see a container in list. Note, it takes couple of minutes for container to fully start up.

```
docker ps
```

- in container logs you will see tnsnames.ora configuration.

!NOTE: the default values for container 12c (12.2.. image)

```
Container Database:
Username: SYS
Role: SYSDBA
Password: Oradoc_db1
Host: localhost
SID: ORCLCDB

Pluggable Database:
Username: SYS
Role: SYSDBA
Password: Oradoc_db1
Host: localhost
Service Name: ORCLPDB1.localdomain
```

## Dump import

- exec into container

```sh
docker exec -ti oraDB bash
```

- create directory in Oracle container
- copy dump file there
- create table space in PDB

```sql
CREATE TABLESPACE OATS_TABLES
   DATAFILE 'OATS_TABLES.dbf'
   SIZE 1m
   AUTOEXTEND ON;
```

- create PDB import user, where 'IMPOATS' is username, 'Oradoc_db1' is password

```sql
-- USER SQL
CREATE USER "IMPOATS" IDENTIFIED BY "Oradoc_db1"
DEFAULT TABLESPACE "OATS_TABLES"
TEMPORARY TABLESPACE "TEMP";

-- QUOTAS
ALTER USER "IMPOATS" QUOTA UNLIMITED ON "SYSTEM";
ALTER USER "IMPOATS" QUOTA UNLIMITED ON "SYSAUX";
ALTER USER "IMPOATS" QUOTA UNLIMITED ON "OATS_TABLES";
ALTER USER "IMPOATS" QUOTA UNLIMITED ON "USERS";

-- ROLES
GRANT "DBA" TO "IMPOATS" WITH ADMIN OPTION;
GRANT "DATAPUMP_EXP_FULL_DATABASE" TO "IMPOATS" WITH ADMIN OPTION;
GRANT "CONNECT" TO "IMPOATS" WITH ADMIN OPTION;
GRANT "DATAPUMP_IMP_FULL_DATABASE" TO "IMPOATS" WITH ADMIN OPTION;
```

- set DATA_PUMP_DIRECTORY in CDB. '/u01/app/oracle/admin/ORCL/dpdump' is a location in Oracle container where the dump file is.

```SQL
CREATE OR REPLACE DIRECTORY "DATA_PUMP_DIR" as '/u01/app/oracle/admin/ORCL/dpdump';
```

- start importing data with impdp

```sh
impdp IMPOATS/Oradoc_db1@localhost:1521/ORCLPDB1.localdomain directory=DATA_PUMP_DIR dumpfile=expdp.OATS-395.20220831.dmp full=y
```
