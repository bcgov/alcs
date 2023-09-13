import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load Oracle DB connection details
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_service_name = os.getenv("DB_SERVICE_NAME")
db_username = os.getenv("DB_USERNAME")
db_password = os.getenv("DB_PASSWORD")

# Load the ECS connection secrets from environment variables
ecs_host = os.getenv("ECS_HOSTNAME")
ecs_bucket = os.getenv("ECS_BUCKET")
ecs_access_key = os.getenv("ECS_ACCESS_KEY")
ecs_secret_key = os.getenv("ECS_SECRET_KEY")
