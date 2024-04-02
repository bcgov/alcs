from .oats_documents_to_alcs_documents_srw import (
    import_oats_srw_documents,
    document_clean,
)
from .alcs_documents_to_notification_documents import (
    link_srw_documents,
    clean_notification_documents,
)
from .alcs_documents_to_planning_review_documents import (
    link_pr_documents,
    clean_planning_review_documents,
)
from .oats_documents_to_alcs_documents_planning_review import (
    import_oats_pr_documents,
    document_pr_clean,
)


def import_documents(batch_size):
    import_oats_srw_documents(batch_size)
    link_srw_documents(batch_size)


def clean_documents():
    clean_notification_documents()
    document_clean()


def import_prs_documents(batch_size):
    import_oats_pr_documents(batch_size),
    link_pr_documents(batch_size)


def clean_prs_documents():
    clean_planning_review_documents()
    document_pr_clean()
