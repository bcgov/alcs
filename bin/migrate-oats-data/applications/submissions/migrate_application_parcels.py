from .parcels import init_application_parcels, process_application_certificate_of_title


def process_application_parcels(batch_size):
    init_application_parcels(batch_size)
    process_application_certificate_of_title(batch_size)
