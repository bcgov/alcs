from .submissions import (
    clean_app_submissions,
    process_application_statuses,
    process_alcs_app_submissions,
)
from .base_applications import process_applications, clean_applications
from .app_prep import process_alcs_application_prep_fields
from .application_submission_status_email import (
    process_application_submission_status_emails,
    clean_application_submission_status_emails,
)


def process_application_etl(batch_size):
    process_alcs_application_prep_fields(batch_size)
    process_alcs_app_submissions(batch_size)
    process_application_statuses(batch_size)
    process_application_submission_status_emails()


def clean_alcs_applications():
    clean_application_submission_status_emails()
    clean_app_submissions()
    clean_applications()


def init_applications(batch_size):
    process_applications(batch_size)
