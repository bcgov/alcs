from ..srw_base import init_srw_base, clean_initial_srw
from ..srw_base_update import update_srw_base_fields


def init_srw(batch_size):
    init_srw_base(batch_size)
    update_srw_base_fields(batch_size)


def clean_srw():
    clean_initial_srw()
