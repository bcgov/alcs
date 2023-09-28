from .notice_of_intent_init import clean_notice_of_intents, init_notice_of_intents
from .notice_of_intent_submissions import (
    clean_notice_of_intent_submissions,
    init_notice_of_intent_submissions,
    process_notice_of_intent_adjacent_land_use,
    process_notice_of_intent_empty_adjacent_land_use,
    process_alcs_notice_of_intent_soil_fields
)
from .oats_to_alcs_notice_of_intent_table_etl.notice_of_intent_decision_date import (
    process_alcs_notice_of_intent_decision_date,
)
from .oats_to_alcs_notice_of_intent_table_etl.oats_to_alcs_notice_of_intent_table_etl import (
    process_alcs_notice_of_intent_base_fields,
)


def init_notice_of_intent(batch_size):
    init_notice_of_intents(batch_size=batch_size)


def clean_notice_of_intent():
    clean_notice_of_intent_submissions()
    clean_notice_of_intents()


def process_notice_of_intent(batch_size):
    # place the rest notice of intent processing functions here
    process_alcs_notice_of_intent_base_fields(batch_size=batch_size)

    process_alcs_notice_of_intent_decision_date(batch_size=batch_size)

    init_notice_of_intent_submissions(batch_size=batch_size)

    process_notice_of_intent_adjacent_land_use(batch_size=batch_size)

    process_notice_of_intent_empty_adjacent_land_use()

    process_alcs_notice_of_intent_soil_fields(batch_size=batch_size)
