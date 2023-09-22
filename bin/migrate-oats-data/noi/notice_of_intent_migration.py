from .oats_to_alcs_notice_of_intent_table_etl.oats_to_alcs_notice_of_intent_table_etl import (
    process_alcs_notice_of_intent_base_fields,
)
from .notice_of_intent_init import init_notice_of_intents, clean_notice_of_intents


def init_notice_of_intent(batch_size):
    init_notice_of_intents(batch_size=batch_size)


def clean_notice_of_intent():
    clean_notice_of_intents()


def process_notice_of_intent(batch_size):
    process_alcs_notice_of_intent_base_fields(batch_size=batch_size)
    # place the rest notice of intent processing function here
