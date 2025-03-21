#!/bin/bash

# Exit on error
set -e

# Cleanup function to kill port forwarding
cleanup() {
    if [ -n "$PORT_FORWARD_PID" ]; then
        echo "Cleaning up port forwarding (PID: $PORT_FORWARD_PID)..."
        { kill $PORT_FORWARD_PID && exec 3<&-; } 2>/dev/null
    fi

    # Drop the local database if it was created
    if [ -n "$LOCAL_DB_NAME" ] && [ -n "$LOCAL_DB_PASSWORD" ]; then
        echo "Dropping local database: $LOCAL_DB_NAME"
        export PGPASSWORD=$LOCAL_DB_PASSWORD
        "$PG_TOOLS_PATH/dropdb" \
            -h "$LOCAL_DB_HOST" \
            -p "$LOCAL_DB_PORT" \
            -U "$LOCAL_DB_USER" \
            --if-exists \
            "$LOCAL_DB_NAME" 2>/dev/null || true
    fi

    # Clear environment variables
    echo "Clearing environment variables..."
    unset DB_USER DB_PASSWORD DB_HOST DB_PORT DB_DATABASE PGPASSWORD
}

# Set up trap to ensure cleanup on script exit (including errors)
trap cleanup EXIT

# --------------------------------------
# Local environment check
# --------------------------------------
# Check for Python 3.11
if ! command -v python3.11 &> /dev/null; then
    echo "Error: Python 3.11 is required but not found"
    exit 1
fi

# Get Postgres tools path
read -p "Path to PostgreSQL 12 tools [/usr/local/opt/libpq/bin]: " PG_TOOLS_PATH
PG_TOOLS_PATH=${PG_TOOLS_PATH:-/usr/local/opt/libpq/bin}

# Verify the path exists
if [ ! -d "$PG_TOOLS_PATH" ]; then
    echo "Error: PostgreSQL tools directory not found at $PG_TOOLS_PATH"
    exit 1
fi

# Get local database connection details
read -p "Local database host [localhost]: " LOCAL_DB_HOST
LOCAL_DB_HOST=${LOCAL_DB_HOST:-localhost}

read -p "Local database port [5432]: " LOCAL_DB_PORT
LOCAL_DB_PORT=${LOCAL_DB_PORT:-5432}

read -p "Local database username [postgres]: " LOCAL_DB_USER
LOCAL_DB_USER=${LOCAL_DB_USER:-postgres}

echo -n "Local database password [postgres]: "
read -s LOCAL_DB_PASSWORD
LOCAL_DB_PASSWORD=${LOCAL_DB_PASSWORD:-postgres}
echo  # Add newline after password input

# Test local database connection
export PGPASSWORD=$LOCAL_DB_PASSWORD
if ! "$PG_TOOLS_PATH/psql" \
    -h "$LOCAL_DB_HOST" \
    -p "$LOCAL_DB_PORT" \
    -U "$LOCAL_DB_USER" \
    -d postgres \
    -c "SELECT version();" > /dev/null 2>&1; then
    echo "Error: Could not connect to local database server"
    exit 1
fi

# --------------------------------------
# Get remote connection details
# --------------------------------------
# Prompt for port with default value
read -p "Port for OpenShift port forwarding [15432]: " PORT
PORT=${PORT:-15432}

if [ ! -f "audit_functions.tar" ] || [ ! -f "alcs_oats_data.tar" ]; then
    # Prompt for PROD database password
    echo -n "PROD database password: "
    read -s PROD_DB_PASSWORD
    echo  # Add newline after password input
fi

# Prompt for target environment
read -p "Target environment [TEST]: " TARGET_ENV
TARGET_ENV=${TARGET_ENV:-TEST}

# Convert to uppercase and validate target environment
TARGET_ENV=$(echo "$TARGET_ENV" | tr '[:lower:]' '[:upper:]')
case "$TARGET_ENV" in
  "TEST")
    TARGET_ENV_NAMESPACE="a5cf88-test"
    ;;
  "DEV")
    TARGET_ENV_NAMESPACE="a5cf88-dev"
    ;;
  *)
    echo "Error: Invalid target environment. Must be either TEST or DEV"
    exit 1
    ;;
esac

# Prompt for target database password
echo -n "$TARGET_ENV database password: "
read -s TARGET_DB_PASSWORD
echo  # Add newline after password input

# --------------------------------------
# Connect and dump data from production
# --------------------------------------
if [ ! -f "audit_functions.tar" ] || [ ! -f "alcs_oats_data.tar" ]; then
    # Start port forwarding in the background
    exec 3< <(exec oc -n a5cf88-prod port-forward service/alcs-patroni $PORT:5432 2>/dev/null)
    PORT_FORWARD_PID=$!

    # Give port forwarding a moment to establish
    sleep 6

    # Check if port forwarding is running
    if ps -p $PORT_FORWARD_PID > /dev/null; then
        echo "Port forwarding to PROD on port $PORT successfully started (PID: $PORT_FORWARD_PID)"
    else
        echo "Failed to start port forwarding"
        exit 1
    fi

    # Set PROD database password
    export PGPASSWORD=$PROD_DB_PASSWORD

    # Dump audit functions
    echo "Dumping audit functions..."
    "$PG_TOOLS_PATH/pg_dump" \
        -h localhost \
        -p $PORT \
        -U postgres \
        --schema=audit \
        --schema-only \
        --no-owner --no-acl \
        -F t \
        -f audit_functions.tar \
        app

    # Dump ALCS and OATS data
    echo "Dumping ALCS and OATS data..."
    "$PG_TOOLS_PATH/pg_dump" \
        -h localhost \
        -p $PORT \
        -U postgres \
        --schema=alcs --schema=oats \
        --no-owner --no-acl \
        -F t \
        -f alcs_oats_data.tar \
        app

    # Stop port forwarding
    echo "Stopping port forwarding (PID: $PORT_FORWARD_PID)..."
    { kill $PORT_FORWARD_PID && exec 3<&-; } 2>/dev/null
    unset PORT_FORWARD_PID
fi

if [ ! -f "obfuscated_alcs_oats_data.tar" ]; then
    # --------------------------------------
    # Setup local database and import data
    # --------------------------------------
    export PGPASSWORD=$LOCAL_DB_PASSWORD

    # Generate random database name
    LOCAL_DB_NAME="db_sync_$(date +%Y%m%d_%H%M%S)"

    # Create local database
    echo "Creating local database: $LOCAL_DB_NAME"
    "$PG_TOOLS_PATH/createdb" \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        "$LOCAL_DB_NAME"

    # Create required extensions
    echo "Creating required extensions..."
    "$PG_TOOLS_PATH/psql" \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$LOCAL_DB_NAME" \
        -c "CREATE EXTENSION IF NOT EXISTS plpgsql; CREATE EXTENSION IF NOT EXISTS hstore; CREATE EXTENSION IF NOT EXISTS pgcrypto;"

    # Restore audit functions first
    echo "Restoring audit functions..."
    "$PG_TOOLS_PATH/pg_restore" \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$LOCAL_DB_NAME" \
        --no-owner --no-acl \
        --clean --if-exists \
        --single-transaction \
        --disable-triggers \
        --no-comments \
        audit_functions.tar

    # Restore ALCS and OATS data
    echo "Restoring ALCS and OATS data..."
    "$PG_TOOLS_PATH/pg_restore" \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$LOCAL_DB_NAME" \
        --no-owner --no-acl \
        --clean --if-exists \
        --single-transaction \
        --disable-triggers \
        --no-comments \
        alcs_oats_data.tar

    # Truncate parcel_lookup table
    echo "Truncating parcel_lookup table..."
    "$PG_TOOLS_PATH/psql" \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$LOCAL_DB_NAME" \
        -c "TRUNCATE TABLE alcs.parcel_lookup;"

    # Update local_government table
    echo "Updating local_government table..."
    "$PG_TOOLS_PATH/psql" \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        -d "$LOCAL_DB_NAME" \
        -c "
    UPDATE alcs.local_government 
    SET bceid_business_guid = CASE 
        WHEN name = 'Peace River Regional District' THEN '4CECD3792F3B4237B4182E408FBE8262'
        WHEN name = 'Tsawwassen First Nation' THEN '1D17E367DD2344CAAEECB92EE964057D'
    END
    WHERE name IN ('Peace River Regional District', 'Tsawwassen First Nation');"

    # --------------------------------------
    # Obfuscate data
    # --------------------------------------
    echo "Changing to migrate-oats-data directory..."
    cd ../migrate-oats-data

    # Create Python virtual environment
    if [ ! -d ".venv" ]; then
        echo "Creating Python virtual environment using Python 3.11..."
        python3.11 -m venv .venv
    fi

    # Activate virtual environment
    echo "Activating virtual environment..."
    source .venv/bin/activate

    # Install requirements
    if [ -f "requirements.txt" ]; then
        echo "Installing Python dependencies..."
        pip install -r requirements.txt
    else
        echo "Error: requirements.txt not found"
        exit 1
    fi

    # Export database connection details for the Python script
    export DB_USER="$LOCAL_DB_USER"
    export DB_PASSWORD="$LOCAL_DB_PASSWORD"
    export DB_HOST="$LOCAL_DB_HOST"
    export DB_PORT="$LOCAL_DB_PORT"
    export DB_DATABASE="$LOCAL_DB_NAME"

    # Run obfuscation script
    echo "Running data obfuscation..."
    python migrate.py obfuscate

    # Deactivate virtual environment
    deactivate

    # Return to original directory
    cd - > /dev/null

    # Dump obfuscated data
    echo "Dumping obfuscated data..."
    "$PG_TOOLS_PATH/pg_dump" \
        -h "$LOCAL_DB_HOST" \
        -p "$LOCAL_DB_PORT" \
        -U "$LOCAL_DB_USER" \
        --schema=alcs --schema=oats \
        --no-owner --no-acl \
        -F t \
        -f obfuscated_alcs_oats_data.tar \
        "$LOCAL_DB_NAME"

    # Remove temporary files
    if [ -f "audit_functions.tar" ]; then
        echo "Removing temporary file: audit_functions.tar"
        rm audit_functions.tar
    fi
    if [ -f "alcs_oats_data.tar" ]; then
        echo "Removing temporary file: alcs_oats_data.tar"
        rm alcs_oats_data.tar
    fi
fi

# --------------------------------------
# Restore data to target environment
# --------------------------------------
if [ -f "obfuscated_alcs_oats_data.tar" ]; then
    # Start port forwarding in the background
    exec 3< <(exec oc -n $TARGET_ENV_NAMESPACE port-forward service/alcs-patroni $PORT:5432 2>/dev/null)
    PORT_FORWARD_PID=$!

    # Give port forwarding a moment to establish
    sleep 6

    # Check if port forwarding is running
    if ps -p $PORT_FORWARD_PID > /dev/null; then
        echo "Port forwarding to $TARGET_ENV on port $PORT successfully started (PID: $PORT_FORWARD_PID)"
    else
        echo "Failed to start port forwarding"
        exit 1
    fi

    # Set target database password
    export PGPASSWORD=$TARGET_DB_PASSWORD

    # Drop ALCS and OATS schemas
    echo "Dropping ALCS and OATS schemas..."
    "$PG_TOOLS_PATH/psql" \
        -h localhost \
        -p $PORT \
        -U postgres \
        -d app \
        -c "DROP SCHEMA IF EXISTS alcs CASCADE; DROP SCHEMA IF EXISTS oats CASCADE;"

    # Restore ALCS and OATS data
    echo "Restoring ALCS and OATS data..."
    "$PG_TOOLS_PATH/pg_restore" \
        -h localhost \
        -p $PORT \
        -U postgres \
        -d app \
        --no-owner --no-acl \
        --clean --if-exists \
        --single-transaction \
        --disable-triggers \
        --no-comments \
        obfuscated_alcs_oats_data.tar

    # Stop port forwarding
    echo "Stopping port forwarding (PID: $PORT_FORWARD_PID)..."
    { kill $PORT_FORWARD_PID && exec 3<&-; } 2>/dev/null
    unset PORT_FORWARD_PID

    # Remove temporary files
    echo "Removing temporary file: obfuscated_alcs_oats_data.tar"
    rm obfuscated_alcs_oats_data.tar
fi