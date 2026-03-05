from common.etl_logger import setup_and_get_logger
from config import ABS_PATH
from db import batch_etl


def submitter_etl(batch_size):
    logger = setup_and_get_logger("submitters")

    batch_etl(
        logger,
        batch_size,
        ABS_PATH / "submitters/sql/count.sql",
        ABS_PATH / "submitters/sql/et.sql",
        ABS_PATH / "submitters/sql/l.sql",
    )
