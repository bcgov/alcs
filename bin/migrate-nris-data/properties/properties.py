from pathlib import Path

from common.etl_logger import setup_and_get_logger
from db import batch_read_write
from faker import Faker

REL_PATH = Path(__file__).parent


def etl(batch_size):
    logger = setup_and_get_logger("property-etl")

    batch_read_write(
        logger,
        batch_size,
        REL_PATH / "sql/count.sql",
        REL_PATH / "sql/et.sql",
        REL_PATH / "sql/l.sql",
    )


def obfuscate(batch_size):
    logger = setup_and_get_logger("property-obfuscation")

    batch_read_write(
        logger,
        batch_size,  # Obfuscation can be done in smaller batches to reduce transaction size.
        REL_PATH / "sql/obfuscate_count.sql",
        REL_PATH / "sql/obfuscate_get_rows.sql",
        REL_PATH / "sql/obfuscate_update.sql",
        row_processor=row_obfuscator(),
    )


def row_obfuscator():
    faker = Faker("la")

    def obfuscate_row(row):
        if row["alc_history"] != "":
            row["alc_history"] = "\n\n".join(faker.paragraphs())

        return row

    return obfuscate_row
