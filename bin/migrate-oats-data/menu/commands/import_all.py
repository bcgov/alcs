from applications.migrate_application import process_application_etl, init_applications
from noi.notice_of_intent_migration import (
    init_notice_of_intents,
    process_notice_of_intent,
)
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
    import_oats_noi_documents,
    import_oats_app_documents,
    link_alcs_docs_to_noi_docs,
    link_alcs_docs_to_app_docs,
)


def import_all(console, args):
    console.log("Beginning OATS -> ALCS import process")

    with console.status("[bold green]Import OATS into ALCS...\n") as status:
        console.log("Init applications:")
        # this will be enabled once application import is ready

        if args and args.batch_size:
            import_batch_size = args.batch_size

        console.log("Init Applications:")
        init_applications(batch_size=import_batch_size)

        console.log("Init NOIs:")
        init_notice_of_intents(batch_size=import_batch_size)

        console.log("Importing NOI specific OATS documents into ALCS:")
        import_oats_noi_documents(batch_size=import_batch_size)

        console.log("Importing OATS app_documents into ALCS:")
        import_oats_app_documents(batch_size=import_batch_size)

        console.log("Processing ALCS application documents:")
        link_alcs_docs_to_app_docs(batch_size=import_batch_size)

        console.log("Processing ALCS NOI documents:")
        link_alcs_docs_to_noi_docs(batch_size=import_batch_size)

        console.log("Processing Applications:")
        process_application_etl(batch_size=import_batch_size)

        console.log("Processing notice of intents")
        process_notice_of_intent(batch_size=import_batch_size)

        # NOTE: both process_application_submission_status_emails(), process_notice_of_intent_submission_status_emails()
        #       must be the last ones in the migrate etl
        console.log("Processing submission status emails")
        process_application_submission_status_emails()
        process_notice_of_intent_submission_status_emails()
        console.log("Done")
