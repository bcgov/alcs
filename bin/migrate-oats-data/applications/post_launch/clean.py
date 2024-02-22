from .application_components.boundary_amendments import (
    clean_boundary_amendments,
    clean_linked_boundary_amendments,
)


def clean_alcs_applications():
    clean_linked_boundary_amendments()
    clean_boundary_amendments()
