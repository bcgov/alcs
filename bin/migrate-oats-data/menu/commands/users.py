from common import init_alcs_users, clean_users

from common import setup_and_get_logger

logger = setup_and_get_logger("user_import")


def import_users(console, args):
    logger.debug("Beginning OATS -> ALCS User import process")
    with console.status(
        "[bold green]User import (user table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        logger.debug(f"Processing User import in batch size = {import_batch_size}")

        init_alcs_users(batch_size=import_batch_size)


def users_clean(console):
    logger.debug("Beginning OATS -> ALCS Users import clean process")
    with console.status("[bold green]Users clean imported...\n") as status:
        clean_users()
