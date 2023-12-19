from .app_submissions import clean_application_submission, process_alcs_app_submissions
from .statuses import (
    init_application_statuses,
    clean_application_submission_statuses,
    process_alcs_application_in_progress_status,
    process_alcs_application_received_by_alc_status,
    process_alcs_application_submitted_to_alc_status,
    process_alcs_application_submitted_to_alc_incomplete_status,
    process_alcs_application_decision_released_status,
    process_alcs_application_cancelled_status,
    process_alcs_application_review_lfng_status,
    process_alcs_application_wrong_lfng_status,
    process_alcs_application_returned_incomplete_lfng_status,
    process_alcs_application_submitted_lfng_status,
    process_alcs_application_status_refused,
)


def clean_app_submissions():
    clean_application_submission_statuses()
    clean_application_submission()


def process_application_statuses(batch_size):
    init_application_statuses()
    process_alcs_application_in_progress_status(batch_size)
    process_alcs_application_received_by_alc_status()
    process_alcs_application_submitted_to_alc_status(batch_size)
    process_alcs_application_submitted_to_alc_incomplete_status(batch_size)
    process_alcs_application_decision_released_status()
    process_alcs_application_cancelled_status(batch_size)
    process_alcs_application_review_lfng_status(batch_size)
    process_alcs_application_wrong_lfng_status(batch_size)
    process_alcs_application_returned_incomplete_lfng_status(batch_size)
    process_alcs_application_submitted_lfng_status(batch_size)
    process_alcs_application_status_refused(batch_size)
