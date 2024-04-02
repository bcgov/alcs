from documents.post_launch import (
    import_documents,
    clean_documents,
    import_prs_documents,
    clean_prs_documents,
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


def document_import_pr(console, args):
    console.log("Beginning OATS -> ALCS document import process")
    with console.status(
        "[bold green]document import (Document related table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing documents import in batch size = {import_batch_size}")

        import_prs_documents(batch_size=import_batch_size)


def document_clean_pr(console):
    console.log("Beginning ALCS Document clean")
    with console.status("[bold green]Cleaning ALCS Documents...\n") as status:
        clean_prs_documents()
