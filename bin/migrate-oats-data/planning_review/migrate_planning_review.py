from .planning_review_base import (
    init_planning_review_base,
    clean_initial_planning_review,
)
from .planning_review_base_update import update_planning_review_base_fields
from .planning_review_staff_journal import (
    process_planning_review_staff_journal,
    clean_planning_review_staff_journal,
)
from .referrals import (
    process_planning_review_referral,
    clean_planning_referrals,
    init_planning_review_cards,
    clean_planning_review_cards,
    update_planning_review_cards,
)


def process_planning_review(batch_size):
    init_planning_review_base(batch_size)
    process_planning_review_staff_journal(batch_size)
    update_planning_review_base_fields(batch_size)
    init_planning_review_cards(batch_size)
    process_planning_review_referral(batch_size)
    update_planning_review_cards(batch_size)


def clean_planning_review():
    clean_planning_review_staff_journal()
    clean_planning_referrals()
    clean_planning_review_cards()
    clean_initial_planning_review()
