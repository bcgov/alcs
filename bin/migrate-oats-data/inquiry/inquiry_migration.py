from .inquiry_base import init_inquiries, clean_inquiries


def process_inquiry(batch_size):
    init_inquiries(batch_size)


def clean_inquiry():
    clean_inquiries()
