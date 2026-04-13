from pathlib import Path

from common.etl_logger import setup_and_get_logger
import db

REL_PATH = Path(__file__).parent


def create_table():
    logger = setup_and_get_logger("complaint-create-table")

    logger.info("Creating complaint table...")

    db.run_script(
        logger,
        REL_PATH / "sql/create_table.sql",
    )

    logger.info("Complaint table created.")


def import_csv(csv_file):
    logger = setup_and_get_logger("complaint-csv-import")

    db.copy_from_csv(logger, "nris.complaint", csv_file)
