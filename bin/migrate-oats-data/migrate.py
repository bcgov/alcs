import sys, logging, argparse
from dotenv import load_dotenv
from rich.console import Console

from applications import process_applications, clean_applications

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OATS ETL utility")
    parser.add_argument(
        "action",
        choices=["import", "clean"],
        default="import",
        help="Action to perform (default: import)",
    )

    # Print help message if user specifies --help or -h flag
    if "-h" in sys.argv or "--help" in sys.argv:
        parser.print_help()
        sys.exit(0)
    # Parse command line arguments
    args = parser.parse_args()

    # Setup
    logging.basicConfig(level=logging.INFO)
    console = Console()  # Console for UI

    # Call function corresponding to selected action using match statement
    match args.action:
        case "import":
            console.log("Beginning OATS -> ALCS import process")
            with console.status("[bold green]Import OATS into ALCS...") as status:
                console.log("Processing applications:")
                process_applications()
                console.log("Done")
        case "clean":
            with console.status("[bold green]Import OATS into ALCS...") as status:
                console.log("Cleaning applications:")
                clean_applications()
                console.log("Done")
