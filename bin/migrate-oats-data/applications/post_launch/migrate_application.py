from .application_components.boundary_amendments import (
    insert_application_boundary_amendments,
)


def process_application_etl(batch_size):
    insert_application_boundary_amendments(batch_size)
