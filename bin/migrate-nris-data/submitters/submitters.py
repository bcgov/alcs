from common.etl_logger import setup_and_get_logger
from config import ABS_PATH
from db import batch_read_write
from faker import Faker


def etl(batch_size):
    logger = setup_and_get_logger("submitters-etl")

    batch_read_write(
        logger,
        batch_size,
        ABS_PATH / "submitters/sql/count.sql",
        ABS_PATH / "submitters/sql/et.sql",
        ABS_PATH / "submitters/sql/l.sql",
    )


def obfuscate(batch_size):
    logger = setup_and_get_logger("ce-file-obfuscation")

    batch_read_write(
        logger,
        batch_size,  # Obfuscation can be done in smaller batches to reduce transaction size.
        ABS_PATH / "submitters/sql/count.sql",
        ABS_PATH / "submitters/sql/obfuscate_get_rows.sql",
        ABS_PATH / "submitters/sql/obfuscate_update.sql",
        row_processor=row_obfuscator(),
    )

def row_obfuscator():
    faker = Faker("la")

    def obfuscate_row(row):
        row["name"] = faker.name()
        row["email"] = faker.email()
        row["telephone_number"] = faker.numerify("###-###-####")
        row["affiliation"] = "\n\n".join(faker.paragraphs())
        row["additional_contact_information"] = "\n\n".join(faker.paragraphs())

        return row

    return obfuscate_row
