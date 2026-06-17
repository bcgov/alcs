from pathlib import Path

from common.etl_logger import setup_and_get_logger
from db import batch_read_write
from faker import Faker

REL_PATH = Path(__file__).parent


def etl(batch_size):
    logger = setup_and_get_logger("submitter-etl")

    batch_read_write(
        logger,
        batch_size,
        REL_PATH / "sql/count.sql",
        REL_PATH / "sql/et.sql",
        REL_PATH / "sql/l.sql",
    )


def obfuscate(batch_size):
    logger = setup_and_get_logger("submitter-obfuscation")

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
        if row["name"] != "":
            row["name"] = faker.name()

        if row["email"] != "":
            row["email"] = faker.email()

        if row["telephone_number"] != "":
            row["telephone_number"] = faker.numerify("###-###-####")

        if row["affiliation"] != "":
            row["affiliation"] = "\n\n".join(faker.paragraphs())

        if row["additional_contact_information"] != "":
            row["additional_contact_information"] = "\n\n".join(faker.paragraphs())

        return row

    return obfuscate_row
