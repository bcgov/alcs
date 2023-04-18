import sys, logging, argparse

from documents import process_application_documents
from rich.console import Console
from db import connection_pool
from applications import process_applications, clean_applications

document_import_batch_size = 10000


def document_import_command_parser(document_import_batch_size, subparsers):
    document_import_command = subparsers.add_parser(
        "document-import",
        help=f"Import documents with specified batch size: (default: {document_import_batch_size})",
    )
    document_import_command.add_argument(
        "--batch-size",
        type=int,
        default=document_import_batch_size,
        metavar="",
        help=f"batch size (default: {document_import_batch_size})",
    )
    document_import_command.set_defaults(func=process_application_documents)


def setup_menu_args_parser(document_import_batch_size, document_import_command_parser):
    parser = argparse.ArgumentParser(description="OATS ETL utility")

    # Add subcommands to parser
    subparsers = parser.add_subparsers(dest="command")

    document_import_command_parser(document_import_batch_size, subparsers)

    import_command = subparsers.add_parser("import", help="Placeholder command")

    # Print help message if user specifies --help or -h flag
    if "-h" in sys.argv or "--help" in sys.argv:
        parser.print_help()
        sys.exit(0)

    # Parse arguments and call command function
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = setup_menu_args_parser(
        document_import_batch_size, document_import_command_parser
    )

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
                    process_applications()
                    console.log("Done")
            case "clean":
                with console.status("[bold green]Cleaning previous ETL...") as status:
                    console.log("Cleaning applications:")
                    clean_applications()
                    console.log("Done")
            case "document-import":
                console.log("Beginning OATS -> ALCS document-import process")
                with console.status("[bold green]Import OATS into ALCS...") as status:
                    if args.batch_size:
                        document_import_batch_size = args.batch_size

                    console.log(
                        f"Processing documents in batch size = {document_import_batch_size}"
                    )

                    process_application_documents(batch_size=document_import_batch_size)

    finally:
        if connection_pool:
            connection_pool.closeall()
