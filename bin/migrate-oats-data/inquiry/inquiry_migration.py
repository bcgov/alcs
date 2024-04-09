from .inquiry_base import init_inquiries, clean_inquiries
from .inquiry_inquirer_info import process_inquiry_inquirer_fields
from .inquiry_staff_journal import (
    process_inquiry_staff_journal,
    clean_inquiry_staff_journal,
)


def process_inquiry(batch_size):
    init_inquiries(batch_size)
    process_inquiry_inquirer_fields(batch_size)
    process_inquiry_staff_journal(batch_size)


def clean_inquiry():
    clean_inquiry_staff_journal()
    clean_inquiries()
