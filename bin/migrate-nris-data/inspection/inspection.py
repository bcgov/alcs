from common.etl_logger import setup_and_get_logger
from config import ABS_PATH
import db


def create_table():
    logger = setup_and_get_logger("inspection-create-table")

    logger.info("Creating inspection table...")

    db.run_script(
        logger,
        ABS_PATH / "inspection/sql/create_table.sql",
    )

    logger.info("Inspection table created.")


def import_csv(csv_file):
    logger = setup_and_get_logger("inspection-csv-import")

    db.copy_from_csv(logger, "nris.inspection", csv_file)


def reduce_related_records():
    logger = setup_and_get_logger("inspection-reduce-related-records")

    logger.info("Reducing related records to 1...")

    db.run_script(
        logger,
        ABS_PATH / "inspection/sql/reduce_related_records.sql",
    )

    logger.info("Related records reduced.")


def relate_inspections_to_complaints():
    logger = setup_and_get_logger("inspection-relate-inspections-to-complaints")

    logger.info("Relating inspections to complaints...")

    db.run_script(
        logger,
        ABS_PATH / "inspection/sql/relate_inspections_to_complaints.sql",
    )

    logger.info("Inspections related to complaints.")
