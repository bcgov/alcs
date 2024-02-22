import logging
from rich.logging import RichHandler
from rich.traceback import install
from rich.console import Console
from logging.handlers import RotatingFileHandler

from menu import setup_menu_args_parser
from menu.commands import (
    import_all,
    clean_all,
    document_import,
    app_document_import,
    application_import,
    application_clean,
    noi_document_import,
    notice_of_intent_import,
    notice_of_intent_clean,
    start_obfuscation,
    import_users,
    users_clean,
)
from db import connection_pool
from common import BATCH_UPLOAD_SIZE, setup_and_get_logger


import_batch_size = BATCH_UPLOAD_SIZE


if __name__ == "__main__":
    args = setup_menu_args_parser(import_batch_size)

    logger = setup_and_get_logger("migrate_initial")
    console = Console()

    try:
        # Call function corresponding to selected action using match statement
        match args.command:
            case "import":
                import_all(console, args)
            case "clean":
                clean_all(console, args)
            case "document-import":
                document_import(console, args)
            case "app-document-import":
                app_document_import(console, args)
            case "noi-import":
                notice_of_intent_import(console, args)
            case "noi-clean":
                notice_of_intent_clean(console)
            case "application-import":
                application_import(console, args)
            case "application-clean":
                application_clean(console)
            case "noi-document-import":
                noi_document_import(console, args)
            case "obfuscate":
                start_obfuscation(console)
            case "user-import":
                import_users(console, args)
            case "user-clean":
                users_clean(console)

    finally:
        if connection_pool:
            connection_pool.closeall()
