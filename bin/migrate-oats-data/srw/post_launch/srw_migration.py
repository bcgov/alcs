from ..srw_base import init_srw_base, clean_initial_srw
from ..srw_base_update import update_srw_base_fields
from ..submission.srw_submission_init import init_srw_submissions, clean_srw_submissions
from ..submission.srw_proposal_fields import (
    process_alcs_srw_proposal_fields,
)
from ..submission.srw_survey_update import srw_survey_plan_update
from ..submission.parcel.srw_parcel_init import init_srw_parcels, clean_parcels
from ..submission.transferee.srw_init_transferee import (
    init_srw_parcel_transferee,
    clean_transferees,
)
from ..applicant.srw_process_applicant import update_srw_base_applicant
from ..srw_staff_journal import process_srw_staff_journal, clean_srw_staff_journal
from ..submission.primary_contact.srw_process_primary_contact import (
    process_alcs_srw_primary_contact,
)
from ..submission.statuses import (
    init_srw_statuses,
    clean_srw_submission_statuses,
    process_alcs_srw_cancelled_status,
    process_alcs_srw_in_progress_status,
    process_alcs_srw_response_sent_status,
    process_alcs_srw_submitted_to_alc_status,
)


def process_srw(batch_size):
    init_srw(batch_size)


def init_srw(batch_size):
    init_srw_base(batch_size)
    update_srw_base_fields(batch_size)
    _process_srw_submission(batch_size)
    update_srw_base_applicant(batch_size)
    process_srw_staff_journal(batch_size)


def _process_srw_submission(batch_size):
    init_srw_submissions(batch_size)
    process_alcs_srw_proposal_fields(batch_size)
    init_srw_parcels(batch_size)
    init_srw_parcel_transferee(batch_size)
    process_alcs_srw_primary_contact(batch_size)
    _process_srw_submission_statuses(batch_size)


def _process_srw_submission_statuses(batch_size):
    init_srw_statuses()
    process_alcs_srw_cancelled_status(batch_size)
    process_alcs_srw_in_progress_status(batch_size)
    process_alcs_srw_response_sent_status(batch_size)
    process_alcs_srw_submitted_to_alc_status(batch_size)


def update_srw_survey_plan(batch_size):
    srw_survey_plan_update(batch_size)


def clean_srw():
    clean_srw_staff_journal()
    clean_transferees()
    clean_parcels()
    clean_srw_submission_statuses()
    clean_srw_submissions()
    clean_initial_srw()
