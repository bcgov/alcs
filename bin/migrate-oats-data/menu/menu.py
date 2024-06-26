import sys, argparse
from .command_parser.application_command_parser import (
    application_import_command_parser,
    app_clean_command_parser,
)
from .command_parser.notice_of_intent_command_parser import (
    noi_import_command_parser,
    noi_clean_command_parser,
)
from .command_parser.document_command_parser import (
    document_import_command_parser,
    application_document_import_command_parser,
    document_noi_import_command_parser,
    noi_document_import_command_parser,
    document_clean_command_parser,
)
from .command_parser.user_command_parser import (
    user_import_command_parser,
    user_clean_command_parser,
)
from common import BATCH_UPLOAD_SIZE
from .command_parser.srw_command_parser import (
    srw_import_command_parser,
    srw_clean_command_parser,
)
from .command_parser.planning_review_command_parser import (
    planning_review_clean_command_parser,
    planning_review_import_command_parser,
)
from .command_parser.inquiry_command_parser import (
    inquiry_import_command_parser,
    inquiry_clean_command_parser,
)

import_batch_size = BATCH_UPLOAD_SIZE


def _import_command_parser(subparsers):
    import_command = subparsers.add_parser(
        "import",
        help=f"Starts OATS -> ALCS import process with specified batch size: (default: {import_batch_size})",
    )
    import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )


def setup_menu_args_parser(import_batch_size):
    parser = argparse.ArgumentParser(description="OATS ETL utility")

    # Add subcommands to parser
    subparsers = parser.add_subparsers(dest="command")
    application_import_command_parser(import_batch_size, subparsers)
    app_clean_command_parser(subparsers)
    document_import_command_parser(import_batch_size, subparsers)
    document_clean_command_parser(subparsers)
    application_document_import_command_parser(import_batch_size, subparsers)
    noi_import_command_parser(import_batch_size, subparsers)
    noi_clean_command_parser(subparsers)
    document_noi_import_command_parser(import_batch_size, subparsers)
    noi_document_import_command_parser(import_batch_size, subparsers)
    _import_command_parser(subparsers)
    user_import_command_parser(import_batch_size, subparsers)
    user_clean_command_parser(subparsers)
    srw_import_command_parser(import_batch_size, subparsers)
    srw_clean_command_parser(subparsers)
    planning_review_import_command_parser(import_batch_size, subparsers)
    planning_review_clean_command_parser(subparsers)
    inquiry_import_command_parser(import_batch_size, subparsers)
    inquiry_clean_command_parser(subparsers)
    subparsers.add_parser("clean", help="Clean all imported data")

    subparsers.add_parser("obfuscate", help="Obfuscate PROD data")

    # Print help message if user specifies --help or -h flag
    if "-h" in sys.argv or "--help" in sys.argv:
        parser.print_help()
        sys.exit(0)

    # Parse arguments and call command function
    args = parser.parse_args()
    return args
