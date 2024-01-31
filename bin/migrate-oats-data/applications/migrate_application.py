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
    clean_reviews,
    update_application_submissions,
    process_application_applicant_on_submissions
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
from .decisions import (
    clean_application_decisions,
    init_application_decisions,
    clean_application_decision_components,
    init_application_decision_components,
    update_application_decision_component_soil_details,
    update_application_decision,
    init_application_conditions,
    link_application_conditions,
    update_application_conditions,
    clean_application_conditions,
    clean_application_conditions_to_components,
    init_application_component_lots,
    clean_application_component_lots,
)
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

from .set_application_visibility import set_application_visibility

from .update_app_created_date import update_application_created_date

from .application_decision_date import process_alcs_application_decision_date


def process_application_etl(batch_size):
    process_alcs_application_prep_fields(batch_size)
    update_application_date_rx_all_items(batch_size)
    update_application_created_date(batch_size)
    process_alcs_app_submissions(batch_size)
    update_application_submissions(batch_size)
    insert_application_submission_review(batch_size)
    process_alcs_application_decision_date(batch_size)
    process_application_statuses(batch_size)
    process_application_parcels(batch_size)
    process_application_owners(batch_size)
    process_application_applicant_on_submissions(batch_size)
    process_app_staff_journal(batch_size)
    process_application_decisions(batch_size)
    set_application_visibility()
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
    update_application_decision(batch_size)
    update_application_modifications(batch_size)
    init_application_reconsiderations(batch_size)
    link_application_reconsiderations(batch_size)
    update_application_reconsiderations(batch_size)
    init_application_decision_components(batch_size)
    update_application_decision_component_soil_details(batch_size)
    init_application_component_lots(batch_size)
    init_application_conditions(batch_size)
    update_application_conditions(batch_size)
    link_application_conditions(batch_size)


def clean_application_decisions_etl():
    # modifications do not have clean since all of them were created in ALCS and ETL is not introducing new records.
    clean_application_conditions_to_components()
    clean_application_conditions()
    clean_application_component_lots()
    clean_application_decision_components()
    unlink_application_reconsiderations()
    clean_application_reconsiderations()
    clean_application_decisions()


def clean_application_parcels():
    clean_primary_contacts()
    clean_parcel_owners()
    clean_owners()
    clean_parcels()
