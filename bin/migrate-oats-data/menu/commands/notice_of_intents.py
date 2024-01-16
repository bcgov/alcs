from noi.notice_of_intent_migration import (
    init_notice_of_intents,
    process_notice_of_intent,
    clean_notice_of_intent,
)
from common import setup_and_get_logger
from users import init_alcs_users
from staff_journal_users import (
    clean_staff_journal_users,
    populate_default_staff_journal_user,
)

logger = setup_and_get_logger("noi_import")


def notice_of_intent_import(console, args):
    logger.debug("Beginning OATS -> ALCS NOI import process")
    with console.status(
        "[bold green]NOI import (notice_of_intent table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        logger.debug(f"Processing NOI import in batch size = {import_batch_size}")

        init_notice_of_intents(batch_size=import_batch_size)
        init_alcs_users(batch_size=import_batch_size)
        process_notice_of_intent(batch_size=import_batch_size)
        populate_default_staff_journal_user(batch_size=import_batch_size)


def notice_of_intent_clean(console):
    logger.debug("Beginning OATS -> ALCS NOI import clean process")
    with console.status("[bold green]NOI clean import...\n") as status:
        clean_staff_journal_users()
        clean_notice_of_intent()
