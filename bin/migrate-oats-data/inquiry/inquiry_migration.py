from .inquiry_base import init_inquiries, clean_inquiries
from .inquiry_inquirer_info import process_inquiry_inquirer_fields


def process_inquiry(batch_size):
    init_inquiries(batch_size)
    process_inquiry_inquirer_fields(batch_size)


def clean_inquiry():
    clean_inquiries()
