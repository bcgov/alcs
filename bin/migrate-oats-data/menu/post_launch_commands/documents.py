from documents.post_launch import (
    import_documents,
    clean_documents,
    import_documents_pr_inq,
    clean_documents_pr_inq,
)
from srw.post_launch.srw_migration import srw_survey_plan_update


def document_import(console, args):
    console.log("Beginning OATS -> ALCS document import process")
    with console.status(
        "[bold green]document import (Document related table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing documents import in batch size = {import_batch_size}")

        import_documents(batch_size=import_batch_size)
        # update SRW submissions based on data imported to alcs
        srw_survey_plan_update(batch_size=import_batch_size)


def document_clean(console):
    console.log("Beginning ALCS Document clean")
    with console.status("[bold green]Cleaning ALCS Documents...\n") as status:
        clean_documents()


def document_import_pr_inq(console, args):
    console.log("Beginning OATS -> ALCS document import process")
    with console.status(
        "[bold green]document import (Document related table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing documents import in batch size = {import_batch_size}")

        import_documents_pr_inq(batch_size=import_batch_size)


def document_clean_pr_inq(console):
    console.log("Beginning ALCS Document clean")
    with console.status("[bold green]Cleaning ALCS Documents...\n") as status:
        clean_documents_pr_inq()
