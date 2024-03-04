from srw.post_launch import (
    process_srw,
    clean_srw,
)
from common import setup_and_get_logger

logger = setup_and_get_logger("srw_import_post_launch")


def srw_import(console, args):
    logger.debug("Beginning OATS -> ALCS SRW import process")
    with console.status(
        "[bold green]SRW import (notification table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        logger.debug(f"Processing SRW import in batch size = {import_batch_size}")

        process_srw(batch_size=import_batch_size)


def srw_clean(console):
    logger.debug("Beginning OATS -> ALCS SRW import clean process")
    with console.status("[bold green]SRW clean import...\n") as status:
        clean_srw()
