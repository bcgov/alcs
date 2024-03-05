from documents.post_launch import import_documents, clean_documents


def document_import(console, args):
    console.log("Beginning OATS -> ALCS document import process")
    with console.status(
        "[bold green]document import (Document related table update in ALCS)...\n"
    ) as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing documents import in batch size = {import_batch_size}")

        import_documents(batch_size=import_batch_size)


def document_clean(console):
    console.log("Beginning ALCS Document clean")
    with console.status("[bold green]Cleaning ALCS Documents...\n") as status:
        clean_documents()
