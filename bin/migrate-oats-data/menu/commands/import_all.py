from applications import (
    process_applications,
    process_alcs_application_prep_fields,
)
from noi.notice_of_intent_migration import (
    init_notice_of_intents,
    process_notice_of_intent,
)
from applications.submissions import process_alcs_app_submissions
from applications.application_submission_status_email import (
    process_application_submission_status_emails,
)
from noi.noi_submission_status_email import (
    process_notice_of_intent_submission_status_emails,
)
from noi import (
    process_notice_of_intent,
)
from documents import (
    process_application_documents,
    process_noi_documents,
)


def import_all(console, args):
    console.log("Beginning OATS -> ALCS import process")

    with console.status("[bold green]Import OATS into ALCS...\n") as status:
        console.log("Init applications:")
        # this will be enabled once application import is ready

        if args and args.batch_size:
            import_batch_size = args.batch_size

        console.log("Batching applications:")
        process_applications(batch_size=import_batch_size)

        console.log("Init NOIs:")
        init_notice_of_intents(batch_size=import_batch_size)

        # TODO Liam question: which process_documents_noi or process_noi_documents is the correct one to keep?
        # console.log("Processing NOI specific documents:")
        # process_documents_noi(batch_size=import_batch_size)

        # console.log("Processing documents:")
        # process_documents(batch_size=import_batch_size)

        console.log("Processing application documents:")
        process_application_documents(batch_size=import_batch_size)

        console.log("Processing NOI documents:")
        process_noi_documents(batch_size=import_batch_size)

        console.log("Processing application prep:")
        process_alcs_application_prep_fields(batch_size=import_batch_size)

        console.log("Processing application submission:")
        process_alcs_app_submissions(batch_size=import_batch_size)

        console.log("Processing notice of intents")
        process_notice_of_intent(batch_size=import_batch_size)

        # NOTE: both process_application_submission_status_emails(), process_notice_of_intent_submission_status_emails()
        #       must be the last ones in the migrate etl
        console.log("Processing submission status emails")
        process_application_submission_status_emails()
        process_notice_of_intent_submission_status_emails()
        console.log("Done")
