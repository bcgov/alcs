import sys, logging, argparse
from dotenv import load_dotenv
from rich.console import Console
from db import connection_pool
from applications import process_applications, clean_applications

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OATS ETL utility")
    
    # TODO draft-import will be later replaced with actual import. Draft-import is needed only till the structure of import is finalized
    parser.add_argument(
        "action",
        choices=["import", "clean", "draft-import"],
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

    try:
        # Call function corresponding to selected action using match statement
        match args.action:
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
            case "draft-import":
                console.log("Beginning OATS -> ALCS draft-import process")
                with console.status("[bold green]Import OATS into ALCS...") as status:
                    template_applications_count = 1000
                    console.log(f"Processing placeholder applications: {template_applications_count}")
                    
    finally:
        if connection_pool:
            connection_pool.closeall()
