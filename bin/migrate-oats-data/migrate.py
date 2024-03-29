import logging
from rich.logging import RichHandler
from rich.traceback import install
from rich.console import Console
from logging.handlers import RotatingFileHandler

from menu import setup_menu_args_parser
from menu.post_launch_commands import (
    import_all,
    clean_all,
    application_import,
    application_clean,
    notice_of_intent_import,
    notice_of_intent_clean,
    srw_import,
    srw_clean,
    document_import,
    document_clean,
)
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
                import_all(console, args)
            case "clean":
                clean_all(console, args)
            case "noi-import":
                notice_of_intent_import(console, args)
            case "noi-clean":
                notice_of_intent_clean(console)
            case "application-import":
                application_import(console, args)
            case "application-clean":
                application_clean(console)
            case "srw-import":
                srw_import(console, args)
            case "srw-clean":
                srw_clean(console)
            case "document-import":
                document_import(console, args)
            case "document-clean":
                document_clean(console)

    finally:
        if connection_pool:
            connection_pool.closeall()
