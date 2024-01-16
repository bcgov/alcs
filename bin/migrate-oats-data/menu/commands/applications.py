from applications import (
    process_application_etl,
    clean_alcs_applications,
    init_applications,
)
from users.alcs_init_users import init_alcs_users
from staff_journal_users import (
    clean_staff_journal_users,
    populate_default_staff_journal_user,
)


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

        init_applications(batch_size=import_batch_size)
        init_alcs_users(batch_size=import_batch_size)
        process_application_etl(batch_size=import_batch_size)
        populate_default_staff_journal_user(batch_size=import_batch_size)


def application_clean(console):
    console.log("Beginning ALCS application clean")
    with console.status("[bold green]Cleaning ALCS Applications...\n") as status:
        clean_staff_journal_users()
        clean_alcs_applications()
