from common.etl_logger import setup_and_get_logger
from config import ABS_PATH
from db import batch_etl


def ce_file_etl(batch_size):
    logger = setup_and_get_logger("ce-files")

    batch_etl(
        logger,
        batch_size,
        ABS_PATH / "ce_files/sql/count.sql",
        ABS_PATH / "ce_files/sql/et.sql",
        ABS_PATH / "ce_files/sql/l.sql",
    )
