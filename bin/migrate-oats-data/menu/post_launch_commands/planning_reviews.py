from planning_review.migrate_planning_review import (
    process_planning_review,
    clean_planning_review,
)
from common import setup_and_get_logger

logger = setup_and_get_logger("plannng_review_import_post_launch")


def planning_review_import(console, args):
    logger.debug("Beginning OATS -> ALCS Planning Review import process")
    with console.status(
        "[bold green]Planning Review import (notification table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        logger.debug(
            f"Processing Planning Review import in batch size = {import_batch_size}"
        )

        process_planning_review(batch_size=import_batch_size)


def planning_review_clean(console):
    logger.debug("Beginning OATS -> ALCS Planning Review import clean process")
    with console.status("[bold green]SRW clean import...\n") as status:
        clean_planning_review()
