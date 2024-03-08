from .oats_documents_to_alcs_documents_srw import (
    import_oats_srw_documents,
    document_clean,
)
from .alcs_documents_to_notification_documents import (
    link_srw_documents,
    clean_notification_documents,
)


def import_documents(batch_size):
    import_oats_srw_documents(batch_size)
    link_srw_documents(batch_size)


def clean_documents():
    clean_notification_documents()
    document_clean()
