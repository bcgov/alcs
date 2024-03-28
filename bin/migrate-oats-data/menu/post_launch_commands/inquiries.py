from common import setup_and_get_logger
from inquiry.inquiry_migration import process_inquiry, clean_inquiry

logger = setup_and_get_logger("inquiries_import_post_launch")


def inquiry_import(console, args):
    logger.debug("Beginning OATS -> ALCS Inquiry import process")
    with console.status(
        "[bold green]Inquiry import (notification table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        logger.debug(f"Processing Inquiry import in batch size = {import_batch_size}")

        process_inquiry(batch_size=import_batch_size)


def inquiry_clean(console):
    logger.debug("Beginning OATS -> ALCS Inquiry import clean process")
    with console.status("[bold green]Inquiry clean import...\n") as status:
        clean_inquiry()
