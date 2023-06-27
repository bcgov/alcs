import sys, logging, argparse

# this is a drastic change
# this is another change
from documents import (
    process_documents,
    process_application_documents,
    clean_application_documents,
    clean_documents,
)
from rich.console import Console
from db import connection_pool
from batch_applications import process_applications, clean_applications

import_batch_size = 10000

def application_import_command_parser(import_batch_size, subparsers):
    application_import_command = subparsers.add_parser(
        "application-import",
        help=f"Import application with specified batch size: (default: {import_batch_size})",
    )
    application_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    application_import_command.set_defaults(func=process_applications)


def document_import_command_parser(import_batch_size, subparsers):
    document_import_command = subparsers.add_parser(
        "document-import",
        help=f"Import documents with specified batch size: (default: {import_batch_size})",
    )
    document_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    document_import_command.set_defaults(func=process_documents)


def application_document_import_command_parser(
    import_batch_size, subparsers
):
    application_document_import_command = subparsers.add_parser(
        "app-document-import",
        help=f"Links imported documents with application documents  specified batch size: (default: {import_batch_size})",
    )
    application_document_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    application_document_import_command.set_defaults(
        func=import_batch_size
    )


def import_command_parser(subparsers):
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
    import_command.set_defaults(func=import_batch_size)


def setup_menu_args_parser(import_batch_size):
    parser = argparse.ArgumentParser(description="OATS ETL utility")

    # Add subcommands to parser
    subparsers = parser.add_subparsers(dest="command")
    application_import_command_parser(import_batch_size, subparsers)
    document_import_command_parser(import_batch_size, subparsers)
    application_document_import_command_parser(import_batch_size, subparsers)
    import_command_parser(subparsers)

    subparsers.add_parser("clean", help="Clean all imported data")

    # Print help message if user specifies --help or -h flag
    if "-h" in sys.argv or "--help" in sys.argv:
        parser.print_help()
        sys.exit(0)

    # Parse arguments and call command function
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = setup_menu_args_parser(import_batch_size)

    # Setup
    logging.basicConfig(level=logging.INFO)
    # Console for UI
    console = Console()

    try:
        # Call function corresponding to selected action using match statement
        match args.command:
            case "import":
                console.log("Beginning OATS -> ALCS import process")
                with console.status("[bold green]Import OATS into ALCS...") as status:
                    console.log("Processing applications:")
                    # this will be enabled once application import is ready
                   

                    if args and args.batch_size:
                        import_batch_size = args.batch_size

                    console.log("Batching applications:")
                    process_applications(batch_size=import_batch_size)

                    console.log("Processing documents:")
                    process_documents(batch_size=import_batch_size)

                    console.log("Processing application documents:")
                    process_application_documents(batch_size=import_batch_size)

                    console.log("Done")
            case "clean":
                with console.status("[bold green]Cleaning previous ETL...") as status:
                    console.log("Cleaning data:")
                    # this will be enabled once application import is ready
                    

                    clean_application_documents()
                    clean_documents()
                    clean_applications()

                    console.log("Done")
            case "document-import":
                console.log("Beginning OATS -> ALCS document-import process")
                with console.status("[bold green]Import OATS into ALCS...") as status:
                    if args.batch_size:
                        import_batch_size = args.batch_size

                    console.log(
                        f"Processing documents in batch size = {import_batch_size}"
                    )

                    process_documents(batch_size=import_batch_size)
            case "app-document-import":
                console.log("Beginning OATS -> ALCS app-document-import process")
                with console.status(
                    "[bold green]Link application documents in ALCS..."
                ) as status:
                    if args.batch_size:
                        import_batch_size = args.batch_size

                    console.log(
                        f"Processing application documents in batch size = {import_batch_size}"
                    )

                    process_application_documents(batch_size=import_batch_size)

    finally:
        if connection_pool:
            connection_pool.closeall()
