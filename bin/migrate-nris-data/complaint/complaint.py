from common.etl_logger import setup_and_get_logger
from config import ABS_PATH
import db


def create_table():
    logger = setup_and_get_logger("complaint-create-table")

    logger.info("Creating complaint table...")

    db.run_script(
        logger,
        ABS_PATH / "complaint/sql/create_table.sql",
    )

    logger.info("Complaint table created.")


def import_csv(csv_file):
    logger = setup_and_get_logger("complaint-csv-import")

    db.copy_from_csv(logger, "nris.complaint", csv_file)
