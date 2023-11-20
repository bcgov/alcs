from .noi_submission_status_email.submission_status_email import (
    process_notice_of_intent_submission_status_emails,
)
from .notice_of_intent_init import clean_notice_of_intents, init_notice_of_intents
from .notice_of_intent_submissions import (
    clean_notice_of_intent_submissions,
    init_notice_of_intent_submissions,
    process_alcs_notice_of_intent_proposal_fields,
    process_alcs_notice_of_intent_soil_fields,
    process_notice_of_intent_adjacent_land_use,
    process_notice_of_intent_empty_adjacent_land_use,
    init_notice_of_intent_statuses,
    process_alcs_notice_of_intent_in_progress_status,
    clean_notice_of_intent_submission_statuses,
    process_alcs_notice_of_intent_submitted_to_alc_status,
    process_alcs_notice_of_intent_submitted_to_alc_incomplete_status,
    process_alcs_notice_of_intent_received_by_alc_status,
    process_alcs_notice_of_intent_decision_released_status,
    process_alcs_notice_of_intent_cancelled_status,
    update_alcs_notice_of_intent_soil_fill_fields,
)
from .oats_to_alcs_notice_of_intent_table_etl.notice_of_intent_decision_date import (
    process_alcs_notice_of_intent_decision_date,
)
from .oats_to_alcs_notice_of_intent_table_etl.oats_to_alcs_notice_of_intent_table_etl import (
    process_alcs_notice_of_intent_base_fields,
)
from .oats_to_alcs_notice_of_intent_table_etl.notice_of_intent_rx_all_items import (
    update_notice_of_intent_date_rx_all_items,
)

from .notice_of_intent_submissions.parcels import (
    init_notice_of_intent_parcels,
    clean_parcels,
    process_notice_of_intent_certificate_of_title,
)

from .notice_of_intent_submissions.parcels.owners import (
    init_notice_of_intent_parcel_owners,
    clean_owners,
    link_notice_of_intent_owners_to_parcels,
    clean_parcel_owners,
)

from .notice_of_intent_submissions.parcels.primary_contacts import (
    init_notice_of_intent_primary_contacts,
    clean_primary_contacts,
    link_notice_of_intent_primary_contacts,
)


def init_notice_of_intent(batch_size):
    init_notice_of_intents(batch_size=batch_size)


def clean_notice_of_intent():
    clean_primary_contacts()
    clean_parcel_owners()
    clean_owners()
    clean_parcels()
    clean_notice_of_intent_submission_statuses()
    clean_notice_of_intent_submissions()
    clean_notice_of_intents()


def process_notice_of_intent_soil(batch_size):
    process_alcs_notice_of_intent_soil_fields(batch_size)
    update_alcs_notice_of_intent_soil_fill_fields(batch_size)


def process_notice_of_intent(batch_size):
    # place the rest notice of intent processing functions here
    process_alcs_notice_of_intent_base_fields(batch_size)

    update_notice_of_intent_date_rx_all_items(batch_size)

    process_alcs_notice_of_intent_decision_date(batch_size)

    init_notice_of_intent_submissions(batch_size)

    process_notice_of_intent_adjacent_land_use(batch_size)

    process_notice_of_intent_empty_adjacent_land_use()

    process_notice_of_intent_soil(batch_size)

    process_alcs_notice_of_intent_proposal_fields(batch_size)

    init_notice_of_intent_statuses()

    process_alcs_notice_of_intent_in_progress_status(batch_size)

    process_alcs_notice_of_intent_submitted_to_alc_status(batch_size)

    process_alcs_notice_of_intent_submitted_to_alc_incomplete_status(batch_size)

    process_alcs_notice_of_intent_cancelled_status(batch_size)

    process_alcs_notice_of_intent_received_by_alc_status()

    process_alcs_notice_of_intent_decision_released_status()

    init_notice_of_intent_parcels(batch_size)

    process_notice_of_intent_certificate_of_title(batch_size)

    init_notice_of_intent_parcel_owners(batch_size)

    link_notice_of_intent_owners_to_parcels(batch_size)

    init_notice_of_intent_primary_contacts(batch_size)

    link_notice_of_intent_primary_contacts(batch_size)

    # this script must be the last one
    process_notice_of_intent_submission_status_emails()
