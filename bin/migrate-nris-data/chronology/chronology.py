from pathlib import Path

from common.etl_logger import setup_and_get_logger
import config
from db import batch_read_write, run_script
from faker import Faker

REL_PATH = Path(__file__).parent


def etl(batch_size):
    logger = setup_and_get_logger("chronology-etl")

    logger.info("Create chronology author...")
    run_script(
        logger,
        REL_PATH / "sql/create_author.sql",
        values=(config.AUTHOR_UUID,),
    )
    logger.info("Chronology author created.")

    logger.info("Inserting chronology entries...")
    batch_read_write(
        logger,
        batch_size,
        REL_PATH / "sql/count.sql",
        REL_PATH / "sql/et.sql",
        REL_PATH / "sql/l.sql",
        row_processor=set_author_uuid,
    )
    logger.info("Chronology entry insert complete.")

    logger.info("Closing C&E files...")
    batch_read_write(
        logger,
        batch_size,
        REL_PATH / "sql/close_count.sql",
        REL_PATH / "sql/close_et.sql",
        REL_PATH / "sql/close_l.sql",
    )
    logger.info("C&E file closure complete.")


def set_author_uuid(row):
    if row["author_uuid"] is None:
        row["author_uuid"] = config.AUTHOR_UUID

    return row


def obfuscate(batch_size):
    logger = setup_and_get_logger("chronology-obfuscation")

    batch_read_write(
        logger,
        batch_size,
        REL_PATH / "sql/obfuscate_count.sql",
        REL_PATH / "sql/obfuscate_get_rows.sql",
        REL_PATH / "sql/obfuscate_update.sql",
        row_processor=row_obfuscator(),
    )


def row_obfuscator():
    faker = Faker("la")

    def obfuscate_row(row):
        if row["description"] is not None:
            row["description"] = "\n\n".join(faker.paragraphs())

        return row

    return obfuscate_row
