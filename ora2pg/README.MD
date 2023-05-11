# Ora2PG

There are 2 ways documented here to run the ora2pg binary - using a local install and inside Docker. The first approach was to use Docker exclusively,
but owing to network issues originating with attempting to reach the OATS db behind a VPN the local install was ultimately used.

The local install usage steps should work for any machine where ora2pg is installed, but specific installation steps for Ubuntu are provided.

---

## Local Ubuntu Ora2pg install

### Prerequisites

- Ubuntu
- Perl >5.10

### Installation

Followed these instructions in order to install Ora2PG locally:
https://stackoverflow.com/questions/1414679/perl-ora2pg-on-ubuntu

Rather than installing the perl extensions manually you can also use cpanm

```sh
apt install cpanminus

cpanm DBI
cpanm DBD::Oracle
cpanm DBD::Pg
```

If you run into an issue where you can't install the DBD::Oracle module, you may need to link the specific versions of your module as below:

`sudo ln -s $ORACLE_HOME/libclntsh.so.xx.x $ORACLE_HOME/libclntsh.so`
`sudo ln -s $ORACLE_HOME/libclntshcore.so.xx.x $ORACLE_HOME/libclntshcore.so`

### Configuration

Ensure that the ora2pg.conf is populated with the necessary connection details to the Oracle database.

### Usage

There are 3 helper scripts to facilitate performing exports from the OATS DB and importing into the ALCS DB.

- `export-ddl-and-data.sh` - Will export the OATS DDL and Data to the ddl.sql and data.sql files respectively
- `import-into-pg.sh` - Will import both sql files against the ALCS database
- `clean-pg.sh` - Will drop the OATS schema within the ALCS database to do a fresh import

_NOTE_: After performing the DDL export, be sure to remove the following constraints from the `oats_alr_appl_components` table (usually located around line 601)

- oats_apcp_chk1
- oats_apcp_chk3
- oats_apcp_chk5

---

## Oracle 12.2 in Docker container

### Prerequisites

- Docker
- Oracle account
- SQLDeveloper tool
- At least 4GB of memory allocated to docker

Login to Oracle Docker registry with your oracle account

```sh
docker login container-registry.oracle.com
```

Navigate to https://container-registry.oracle.com/ -> Database -> enterprise -> Sign in and accept the license agreement

Create network

```sh
docker network create alpine-net
```

Run container, where 5GB is amount allocated to Oracle. !NOTE: Container has network specified and it will not be available from the host OS.

```sh
docker run -d  -p 1527:1521 -p 5507:5500 -it --name oraDB --shm-size="5g" --network alpine-net container-registry.oracle.com/database/enterprise:12.2.0.1
```

Keep an eye on the container. If everything goes successfully, you should see a container in the list. !NOTE, it takes a couple of minutes for the container to start up fully.

```
docker ps
```

In container logs you will see tnsnames.ora configuration if you ever need that.

!NOTE: the default values for container 12c (12.2.0.1 image)

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

### Docker Dump import

Exec into the container

```sh
# docker exec -it <db container name> bash
docker exec -it oraDB bash
```

Create a directory in the Oracle container for the dump

```sh
# -p create parents if do not exist
mkdir -p /u01/app/oracle/admin/ORCL/dpdump
```

Launch a new terminal window and copy the dump file from the host into it

```sh
# docker cp <path to source dump file on host> <db container>:<path to dump file on container>
docker cp ./expdp.OATS-395.20220831.dmp abc38c2849e0:/u01/app/oracle/admin/ORCL/dpdump
```

Set DATA_PUMP_DIRECTORY in CDB. '/u01/app/oracle/admin/ORCL/dpdump' is the location where the dump file was copied to

```sh
# connect to oracle CDB inside container
sqlplus sys/Oradoc_db1@localhost:1521/ORCLCDB
```

You can check the current connection by executing

```SQL
show con_name;
```

```SQL
-- in sqlplus connected to CDB
CREATE OR REPLACE DIRECTORY "DATA_PUMP_DIR" as '/u01/app/oracle/admin/ORCL/dpdump';
```

Switch to the PDB in sqlplus

```SQL
alter session set container=ORCLPDB1;
```

Create a table space in PDB

```sql
CREATE TABLESPACE OATS_TABLES
   DATAFILE 'OATS_TABLES.dbf'
   SIZE 1m
   AUTOEXTEND ON;
```

Create a PDB import user, where 'IMPOATS' is username, 'Oradoc_db1' is password

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

Start importing data with impdp

```sh
impdp IMPOATS/Oradoc_db1@localhost:1521/ORCLPDB1.localdomain directory=DATA_PUMP_DIR dumpfile=expdp.OATS-395.20220831.dmp full=y
```

---

# ora2pg
NOTE: at the time of writing this documentation the only version of ora2pg that was working properly is 18.2. This may change based on the Oracle version used for OATS.

### Oracle to Postgres migration

Dockerized version of ora2pg tool will be used for migration from Oracle to Postgres. Follow this link for more details: https://github.com/Guy-Incognito/ora2pg

- (only if you are running local Oracle in docker) make sure that the steps above regarding the Oracle data import is completed successfully, and your Oracle instance is running. Use docker ps to check running containers

```sh
docker ps
```

- locate 'ora2pg.conf' in the source code. Make sure that the DBI connection string matches your Oracle instance configuration. You are interested in the following parameters: "ORACLE_DSN", "ORACLE_USER", "ORACLE_PWD". NOTE: You want to use OATS user as "ORACLE_USER" for migrating OATS DB.
- first, prepare the migration of tables schema

  - check ora2pg.conf and make sure that TYPE is set to TABLE
  - check ora2pg.conf and make sure that FKEY_DEFERRABLE is 1
  - run ora2pg container:

  ```sh
   # docker run \
   # --name ora2pg \
   # --network <network specified for oracle container above> \
   # -it \
   # -v <path on the host to config folder with ora2pg.conf>:/config \
   # -v <path on the host to data folder where you will see the output of migration>:/data \
   # georgmoser/ora2pg

   # example of command above with populated values
   docker run \
   --name ora2pg \
   --network alpine-net \
   -it \
   -v /Users/user/Documents/Bit3/sources/alcs/alcs-api/oracle-to-pg/ora2pg/config:/config \
   -v /Users/user/Documents/Bit3/sources/alcs/alcs-api/oracle-to-pg/ora2pg/data:/data \
   georgmoser/ora2pg:18.2
  ```

  - once the container finishes, you will notice 'output.sql' in the data folder that you specified above. That file contains DDL for schema migration. However, it requires some manual adjustment.
    - at the top of the file, remove following line '\set ON_ERROR_STOP ON'
    - locate table 'oats_alr_appl_components' and navigate to the constraint creation section and search for these lines that you need to comment, otherwise the DDL script will fail on Postgres side
    ```SQL
    ALTER TABLE oats_alr_appl_components ADD CONSTRAINT oats_apcp_chk1 CHECK (--
    -- Enforces the exclusive relationships coming in
    -- from ALR APPLICATION and ALR APPL DECISION.(alr_application_id IS NOT NULL AND   alr_appl_decision_id IS NULL)
    OR(alr_application_id IS NULL AND alr_appl_decision_id IS NOT NULL));
    ALTER TABLE oats_alr_appl_components ADD CONSTRAINT oats_apcp_chk3 CHECK (--
    -- Ensures only NON FARM USE has an optional
    -- relationship from NONFARM USE SUBTYPE CODE
    ((alr_change_code = 'NFU') AND ( nonfarm_use_type_code IS NOT NULL AND
    nonfarm_use_subtype_code IS NOT NULL)
    OR ( nonfarm_use_type_code IS NULL AND
    nonfarm_use_subtype_code IS NULL)
    )
    OR(alr_change_code IN ('INC', 'EXC', 'SDV', 'SCH') AND
    nonfarm_use_type_code IS NULL AND
    nonfarm_use_subtype_code IS NULL));
    ALTER TABLE oats_alr_appl_components ADD CONSTRAINT oats_apcp_chk5 CHECK (--
    -- Ensures only a decision expiry date is
    -- supplied for a decision component.(alr_appl_decision_id IS NOT NULL AND (decision_expiry_date   IS NULL or decision_expiry_date IS NOT NULL)
    )
    OR (alr_appl_decision_id IS NULL AND decision_expiry_date IS NULL));
    ```
    - delete everything related to "document_blob" column
    - delete sequence creation at the end of the file
    - file may require some other minot cleanups, mostly deleting some indexes etc. This could be done during the run process of ddl
    - rename the file to something other than 'output.sql'

- second, prepare the migration of data

  - check ora2pg.conf and make sure that TYPE is set to COPY
  - check ora2pg.conf and make sure that DEFER_FKEY is 1
  - run ora2pg container:

  ```sh
   # docker run \
   # --name ora2pg \
   # --network host \
   # -it \
   # -v <path on host to config folder with ora2pg.conf>:/config \
   # -v <path on host to data folder where you will see the output of migration>:/data \
   # georgmoser/ora2pg:18.2

   docker run \
   --name ora2pg \
   --network host \
   -it \
   -v /Users/user/Documents/Bit3/sources/alcs/alcs-api/oracle-to-pg/ora2pg/config:/config \
   -v /Users/user/Documents/Bit3/sources/alcs/alcs-api/oracle-to-pg/ora2pg/data:/data \
   georgmoser/ora2pg
  ```

  - if container fails with the error try to comment out this "FDW_SERVER" in 'ora2pg.conf'
  - once the container finishes, you will notice 'output.sql' in the data folder that you specified above. That file contains DATA migration. !NOTE: The output.sql will be huge, and it may cause freezes in your environment if you try to open it.

### Assuming that all the steps above completed successfully, you can start import process.

- make sure that your Postgres container is up and running
- connect to Postgres DB with any tool of your choice
- create a new schema where we will be importing data
- apply the schema migration file that was generated previously. This can be done using UI or CLI tool.  
  Example using the psql:

`psql -h $HOSTe -p $PORT -U $USER -d $DBNAME -a -f path-to-ddl-file/ddl.sql`
`psql -h localhost -p 5432 -U postgres -d postgres -f ../data/ddl_18_2_test.sql`
`psql -h localhost -p 5432 -U postgres -d postgres -f ../data/data_18_2_test.sql`

- once schema migration applied check that all the tables are in place
- in the sources locate 'import.sql'
  - in 'import.sql' update the schema name to whatever schema name you used in Postgres
  - 'import.sql' update the data migration output file to whatever you named it (the Default name is 'output.sql' and it is in the data folder on your host)
- copy 'import.sql' to the postgres container

```sh
# docker cp <path to import.sql on host> <db container>:<destination path in container>
docker cp ./import.sql b6c68d998848:/
```

- copy data dump file to postgres container to the same location as import.sql. !NOTE: this may take a while due to the size of the file

```sh
# docker cp <path to import.sql on host> <db container>:<destination path in container>
docker cp ./output.sql b6c68d998848:/
```

- exec into your postgres container

```sh
# docker exec -it <db container name> bash
docker exec -it postgres bash
```

- inside the postgres container run import.sql. This will take a while so go grab some coffee :)

```sh
psql -h localhost -p 5432 -d postgres -U postgres -f import.sql
```

- once the command above is finished, you'll notice some sequence related errors. Simply ignore those since there was no step for sequence export.
