from ..srw_base import init_srw_base, clean_initial_srw
from ..srw_base_update import update_srw_base_fields
from ..submission.srw_submission_init import init_srw_submissions, clean_srw_submissions
from ..submission.srw_proposal_fields import process_alcs_srw_proposal_fields
from ..submission.parcel.srw_parcel_init import init_srw_parcels, clean_parcels
from ..submission.transferee.srw_init_transferee import (
    init_srw_parcel_transferee,
    clean_transferees,
)


def process_srw(batch_size):
    init_srw(batch_size)


def init_srw(batch_size):
    init_srw_base(batch_size)
    update_srw_base_fields(batch_size)
    _process_srw_submission(batch_size)


def _process_srw_submission(batch_size):
    init_srw_submissions(batch_size)
    process_alcs_srw_proposal_fields(batch_size)
    init_srw_parcels(batch_size)
    init_srw_parcel_transferee(batch_size)


def clean_srw():
    clean_transferees()
    clean_parcels()
    clean_srw_submissions()
    clean_initial_srw()
