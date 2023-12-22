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

from noi.notice_of_intent_staff_journal import (
    process_noi_staff_journal,
    clean_noi_staff_journal,
)

from noi.noi_decisions.notice_of_intent_decisions_init import (
    init_notice_of_intent_decisions,
    clean_notice_of_intent_decisions,
)

from .noi_decisions.noi_modifications import (
    init_notice_of_intent_modifications,
    clean_notice_of_intent_modifications,
    update_notice_of_intent_modifications,
    link_notice_of_intent_modifications,
    unlink_etl_modifications,
)

from .noi_decisions.noi_components import (
    init_notice_of_intent_decision_components,
    clean_notice_of_intent_decision_components,
    update_notice_of_intent_decision_component_soil_details,
)

from .noi_decisions.noi_conditions import (
    init_notice_of_intent_conditions,
    clean_notice_of_intent_conditions,
    update_notice_of_intent_conditions,
)


def init_notice_of_intent(batch_size):
    init_notice_of_intents(batch_size=batch_size)


def clean_notice_of_intent():
    clean_noi_staff_journal()
    clean_primary_contacts()
    clean_parcel_owners()
    clean_owners()
    clean_parcels()
    clean_notice_of_intent_submission_statuses()
    clean_notice_of_intent_submissions()
    clean_notice_of_intent_decision()
    clean_notice_of_intents()


def process_notice_of_intent_soil(batch_size):
    process_alcs_notice_of_intent_soil_fields(batch_size)
    update_alcs_notice_of_intent_soil_fill_fields(batch_size)


def process_notice_of_intent_decisions(batch_size):
    init_notice_of_intent_decisions(batch_size)
    update_notice_of_intent_modifications(batch_size)
    init_notice_of_intent_modifications(batch_size)
    link_notice_of_intent_modifications(batch_size)
    init_notice_of_intent_decision_components(batch_size)
    update_notice_of_intent_decision_component_soil_details(batch_size)
    init_notice_of_intent_conditions(batch_size)
    update_notice_of_intent_conditions(batch_size)


def clean_notice_of_intent_decision():
    clean_notice_of_intent_conditions()
    clean_notice_of_intent_decision_components()
    unlink_etl_modifications()
    clean_notice_of_intent_modifications()
    clean_notice_of_intent_decisions()


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

    process_noi_staff_journal(batch_size)

    process_notice_of_intent_decisions(batch_size)

    # this script must be the last one
    process_notice_of_intent_submission_status_emails()
