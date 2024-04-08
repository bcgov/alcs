from applications.post_launch import (
    clean_alcs_applications,
)
from noi.post_launch import clean_notice_of_intent
from srw.post_launch import clean_srw
from documents.post_launch import clean_documents, clean_documents_pr_inq
from planning_review.migrate_planning_review import clean_planning_review
from inquiry.inquiry_migration import clean_inquiry


def clean_all(console, args):
    with console.status("[bold green]Cleaning previous ETL...\n") as status:
        console.log("Cleaning data:")
        clean_documents()
        clean_alcs_applications()
        clean_notice_of_intent()
        clean_srw()
        clean_planning_review()

        console.log("Done")


def clean_all_pr_inq(console, args):
    with console.status("[bold green]Cleaning previous ETL...\n") as status:
        console.log("Cleaning data:")
        clean_documents_pr_inq()
        clean_planning_review()
        clean_inquiry()

        console.log("Done")
