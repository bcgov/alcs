from applications.post_launch import process_application_etl
from noi.post_launch import (
    process_notice_of_intent,
)


def import_all(console, args):
    console.log("Beginning OATS -> ALCS import process")

    with console.status("[bold green]Import OATS into ALCS...\n") as status:
        console.log("Init applications:")
        # this will be enabled once application import is ready

        if args and args.batch_size:
            import_batch_size = args.batch_size

        console.log("Processing Applications:")
        process_application_etl(batch_size=import_batch_size)

        console.log("Processing notice of intents")
        process_notice_of_intent(batch_size=import_batch_size)

        console.log("Done")
