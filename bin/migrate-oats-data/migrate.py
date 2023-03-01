import sys, logging, argparse
from dotenv import load_dotenv
from applications import process_applications

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

    # Call function corresponding to selected action using match statement
    match args.action:
        case "import":
            print("Beginning import")
            process_applications()
            # import_function(conn_pool)
        case "clean":

            print("Beginning import")
            # clean_function(conn_pool)
