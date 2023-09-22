from applications import clean_applications
from noi.notice_of_intent_migration import clean_notice_of_intent
from applications.submissions import clean_application_submission
from applications.application_submission_status_email import (
    clean_application_submission_status_emails,
)
from noi.noi_submission_status_email import (
    clean_application_submission_status_emails,
)
from noi import clean_notice_of_intents
from documents import (
    clean_application_documents,
    clean_documents,
    clean_noi_documents,
)


def clean_all(console, args):
    with console.status("[bold green]Cleaning previous ETL...") as status:
        console.log("Cleaning data:")
        # this will be enabled once application import is ready

        clean_application_documents()
        clean_noi_documents()
        clean_documents()
        clean_application_submission()
        clean_applications()
        clean_notice_of_intents()
        clean_application_submission_status_emails(),
        clean_application_submission_status_emails(),

        console.log("Done")
