from applications import (
    process_application_etl,
    clean_alcs_applications,
    init_applications,
)
from common.alcs_init_users import init_alcs_users


def application_import(console, args):
    console.log("Beginning OATS -> ALCS application import process")
    with console.status(
        "[bold green]application import (Application and application related table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(
            f"Processing applications import in batch size = {import_batch_size}"
        )

        # TODO uncomment this
        # init_applications(batch_size=import_batch_size)
        # init_alcs_users(batch_size=import_batch_size)
        process_application_etl(batch_size=import_batch_size)


def application_clean(console):
    console.log("Beginning ALCS application clean")
    with console.status("[bold green]Cleaning ALCS Applications...\n") as status:
        clean_alcs_applications()
