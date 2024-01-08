from .submissions import (
    clean_app_submissions,
    process_application_statuses,
    process_alcs_app_submissions,
    clean_parcels,
    process_application_parcels,
    clean_owners,
    clean_parcel_owners,
    process_application_owners,
    clean_primary_contacts,
    insert_application_submission_review,
    clean_reviews
)
from .base_applications import process_applications, clean_applications
from .app_prep import process_alcs_application_prep_fields
from .app_rx_items import update_application_date_rx_all_items
from .application_submission_status_email import (
    process_application_submission_status_emails,
    clean_application_submission_status_emails,
)
from .app_staff_journal import (
    process_app_staff_journal,
    clean_application_staff_journal,
)
from .decisions import clean_application_decisions, init_application_decisions
from .decisions.app_modifications import (
    update_application_modifications,
)
from .decisions.app_reconsiderations import (
    init_application_reconsiderations,
    clean_application_reconsiderations,
    link_application_reconsiderations,
    unlink_application_reconsiderations,
    update_application_reconsiderations,
)

from .set_hide_from_portal_on_application import set_hide_from_portal_on_application


def process_application_etl(batch_size):
    process_alcs_application_prep_fields(batch_size)
    update_application_date_rx_all_items(batch_size)
    process_alcs_app_submissions(batch_size)
    insert_application_submission_review(batch_size)
    process_application_statuses(batch_size)
    process_application_parcels(batch_size)
    process_application_owners(batch_size)
    process_app_staff_journal(batch_size)
    process_application_decisions(batch_size)
    set_hide_from_portal_on_application()
    process_application_submission_status_emails()


def clean_alcs_applications():
    clean_application_submission_status_emails()
    clean_reviews()
    clean_application_staff_journal()
    clean_application_parcels()
    clean_application_decisions_etl()
    clean_app_submissions()
    clean_applications()


def init_applications(batch_size):
    process_applications(batch_size)


def process_application_decisions(batch_size):
    init_application_decisions(batch_size)
    update_application_modifications(batch_size)
    init_application_reconsiderations(batch_size)
    link_application_reconsiderations(batch_size)
    update_application_reconsiderations(batch_size)


def clean_application_decisions_etl():
    # modifications do not have clean since all of them were created in ALCS and ETL is not introducing new records.
    unlink_application_reconsiderations()
    clean_application_reconsiderations()
    clean_application_decisions()


def clean_application_parcels():
    clean_primary_contacts()
    clean_parcel_owners()
    clean_owners()
    clean_parcels()
