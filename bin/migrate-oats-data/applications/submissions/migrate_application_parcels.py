from .parcels import (
    init_application_parcels,
    process_application_certificate_of_title,
    init_application_parcel_owners,
    link_application_owners_to_parcels,
)


def process_application_parcels(batch_size):
    init_application_parcels(batch_size)
    process_application_certificate_of_title(batch_size)
    init_application_parcel_owners(batch_size)
    link_application_owners_to_parcels(batch_size)
