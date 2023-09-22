from applications import (
    process_applications,
    process_alcs_application_prep_fields,
    process_alcs_app_submissions,
)


def app_prep_import(console, args):
    console.log("Beginning OATS -> ALCS app-prep import process")
    with console.status(
        "[bold green]App prep import (applications table update in ALCS)..."
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing app-prep import in batch size = {import_batch_size}")

        process_alcs_application_prep_fields(batch_size=import_batch_size)


def application_import(console, args):
    console.log("Beginning OATS -> ALCS application import process")
    with console.status(
        "[bold green]application import (application table update in ALCS)..."
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(
            f"Processing applications import in batch size = {import_batch_size}"
        )

        process_applications(batch_size=import_batch_size)


def application_submission_import(console, args):
    console.log("Beginning OATS -> ALCS app-sub import process")
    with console.status(
        "[bold green]App submission import (application_submission table update in ALCS)..."
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing app-sub import in batch size = {import_batch_size}")

        process_alcs_app_submissions(batch_size=import_batch_size)
