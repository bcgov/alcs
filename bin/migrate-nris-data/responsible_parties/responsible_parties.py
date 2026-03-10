from common.etl_logger import setup_and_get_logger
from config import ABS_PATH
from db import batch_read_write
from faker import Faker


def etl(batch_size):
    logger = setup_and_get_logger("responsible-party-etl")

    batch_read_write(
        logger,
        batch_size,
        ABS_PATH / "responsible_parties/sql/count.sql",
        ABS_PATH / "responsible_parties/sql/et.sql",
        ABS_PATH / "responsible_parties/sql/l.sql",
    )


def obfuscate(batch_size):
    logger = setup_and_get_logger("responsible-party-obfuscation")

    batch_read_write(
        logger,
        batch_size,
        ABS_PATH / "responsible_parties/sql/obfuscate_count.sql",
        ABS_PATH / "responsible_parties/sql/obfuscate_get_rows.sql",
        ABS_PATH / "responsible_parties/sql/obfuscate_update.sql",
        row_processor=row_obfuscator(),
    )


def row_obfuscator():
    faker = Faker("la")

    def obfuscate_row(row):
        row["individual_name"] = faker.name()

        return row

    return obfuscate_row
