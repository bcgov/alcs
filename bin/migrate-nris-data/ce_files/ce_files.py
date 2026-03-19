from common.etl_logger import setup_and_get_logger
from config import ABS_PATH
from db import batch_read_write
from faker import Faker


def etl(batch_size):
    logger = setup_and_get_logger("ce-file-etl")

    logger.info("Inserting C&E files...")
    batch_read_write(
        logger,
        batch_size,
        ABS_PATH / "ce_files/sql/count.sql",
        ABS_PATH / "ce_files/sql/et.sql",
        ABS_PATH / "ce_files/sql/l.sql",
    )
    logger.info("C&E file insert complete.")

    logger.info("Closing C&E files...")
    batch_read_write(
        logger,
        batch_size,
        ABS_PATH / "ce_files/sql/close_count.sql",
        ABS_PATH / "ce_files/sql/close_et.sql",
        ABS_PATH / "ce_files/sql/close_l.sql",
    )
    logger.info("C&E file closure complete.")


def obfuscate(batch_size):
    logger = setup_and_get_logger("ce-file-obfuscation")

    batch_read_write(
        logger,
        batch_size,
        ABS_PATH / "ce_files/sql/obfuscate_count.sql",
        ABS_PATH / "ce_files/sql/obfuscate_get_rows.sql",
        ABS_PATH / "ce_files/sql/obfuscate_update.sql",
        row_processor=row_obfuscator(),
    )


def row_obfuscator():
    faker = Faker("la")

    def obfuscate_row(row):
        row["intake_notes"] = "\n\n".join(faker.paragraphs())

        return row

    return obfuscate_row
