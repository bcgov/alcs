from applications import (
    process_applications,
    process_alcs_application_prep_fields,
    process_alcs_app_submissions,
    init_application_statuses,
    process_alcs_application_in_progress_status,
    process_alcs_application_received_by_alc_status,
    process_alcs_application_submitted_to_alc_status,
    batch_application_statuses,
    process_alcs_application_submitted_to_alc_incomplete_status,
    process_alcs_application_decision_released_status,
    process_alcs_application_cancelled_status,
    process_alcs_application_review_lfng_status,
    process_alcs_application_wrong_lfng_status,
    process_alcs_application_returned_incomplete_lfng_status,
)


def app_prep_import(console, args):
    console.log("Beginning OATS -> ALCS app-prep import process")
    with console.status(
        "[bold green]App prep import (applications table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing app-prep import in batch size = {import_batch_size}")

        process_alcs_application_prep_fields(batch_size=import_batch_size)


def application_import(console, args):
    console.log("Beginning OATS -> ALCS application import process")
    with console.status(
        "[bold green]application import (application table update in ALCS)...\n"
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
        "[bold green]App submission import (application_submission table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing app-sub import in batch size = {import_batch_size}")

        process_alcs_app_submissions(batch_size=import_batch_size)


def application_status_import(console, args):
    console.log("Beginning OATS -> ALCS app-status import process")
    with console.status(
        "[bold green]App submission status import (application_submission_to_submission_status table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(
            f"Processing application statuses import in batch size = {import_batch_size}"
        )

        init_application_statuses()
        # batch_application_statuses(batch_size=import_batch_size)
        process_alcs_application_in_progress_status(batch_size=import_batch_size)
        process_alcs_application_received_by_alc_status()
        process_alcs_application_submitted_to_alc_status(batch_size=import_batch_size)
        process_alcs_application_submitted_to_alc_incomplete_status(
            batch_size=import_batch_size
        )
        process_alcs_application_decision_released_status()
        process_alcs_application_cancelled_status(batch_size=import_batch_size)
        process_alcs_application_review_lfng_status(batch_size=import_batch_size)
        process_alcs_application_wrong_lfng_status(batch_size=import_batch_size)
        process_alcs_application_returned_incomplete_lfng_status(
            batch_size=import_batch_size
        )
