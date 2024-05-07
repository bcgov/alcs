import logging
from rich.logging import RichHandler
from rich.traceback import install
from rich.console import Console
from logging.handlers import RotatingFileHandler

from menu import setup_menu_args_parser
from menu.post_launch_commands import (
    notice_of_intent_import,
    notice_of_intent_clean,
    document_import,
    document_clean,
    planning_review_clean,
    planning_review_import,
    inquiry_import,
    inquiry_clean,
    import_all_pr_inq,
    clean_all_pr_inq,
    application_local_government_status_reset,
)
from menu import start_obfuscation
from db import connection_pool
from common import BATCH_UPLOAD_SIZE, setup_and_get_logger


import_batch_size = BATCH_UPLOAD_SIZE


if __name__ == "__main__":
    args = setup_menu_args_parser(import_batch_size)

    logger = setup_and_get_logger("migrate")
    console = Console()

    try:
        # Call function corresponding to selected action using match statement
        match args.command:
            case "import":
                import_all_pr_inq(console, args)
            case "clean":
                clean_all_pr_inq(console, args)
            case "noi-import":
                notice_of_intent_import(console, args)
            case "noi-clean":
                notice_of_intent_clean(console)
            case "application-import":
                application_local_government_status_reset(console, args)
            case "document-import":
                document_import(console, args)
            case "document-clean":
                document_clean(console)
            case "pr-import":
                planning_review_import(console, args)
            case "pr-clean":
                planning_review_clean(console)
            case "inquiry-import":
                inquiry_import(console, args)
            case "inquiry-clean":
                inquiry_clean(console)
            case "obfuscate":
                start_obfuscation(console)

    finally:
        if connection_pool:
            connection_pool.closeall()
