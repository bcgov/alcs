from applications.post_launch import (
    clean_alcs_applications,
)
from noi.post_launch import clean_notice_of_intent


def clean_all(console, args):
    with console.status("[bold green]Cleaning previous ETL...\n") as status:
        console.log("Cleaning data:")
        clean_alcs_applications(),
        clean_notice_of_intent()

        console.log("Done")