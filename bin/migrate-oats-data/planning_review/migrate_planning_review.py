from .planning_review_base import (
    init_planning_review_base,
    clean_initial_planning_review,
)
from .planning_review_base_update import update_planning_review_base_fields


def process_planning_review(batch_size):
    init_planning_review_base(batch_size)
    update_planning_review_base_fields(batch_size)


def clean_planning_review():
    clean_initial_planning_review()
