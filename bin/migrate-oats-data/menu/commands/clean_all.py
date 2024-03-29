from applications.migrate_application import (
    clean_alcs_applications,
    clean_application_parcels,
)
from noi.notice_of_intent_migration import clean_notice_of_intent
from applications.application_submission_status_email import (
    clean_application_submission_status_emails,
)
from noi.noi_submission_status_email import (
    clean_notice_of_intent_submission_status_emails,
)
from users.alcs_init_users import clean_users
from documents import (
    clean_application_documents,
    clean_documents,
    clean_noi_documents,
)
from staff_journal_users import clean_staff_journal_users

def clean_all(console, args):
    with console.status("[bold green]Cleaning previous ETL...\n") as status:
        console.log("Cleaning data:")
        clean_staff_journal_users()
        # application parcels need to be cleaned before application documents
        clean_application_parcels()
        clean_application_documents()
        clean_noi_documents()
        clean_documents()
        clean_alcs_applications()
        clean_notice_of_intent()
        clean_users()
        clean_application_submission_status_emails(),
        clean_notice_of_intent_submission_status_emails(),

        console.log("Done")
