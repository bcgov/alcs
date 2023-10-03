from documents import (
    process_documents,
    process_documents_noi,
    process_application_documents,
    process_noi_documents,
)


def document_import(console, args):
    console.log("Beginning OATS -> ALCS document-import process")
    with console.status("[bold green]Import OATS into ALCS...\n") as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing documents in batch size = {import_batch_size}")

        process_documents(batch_size=import_batch_size)
        process_documents_noi(batch_size=import_batch_size)


def app_document_import(console, args):
    console.log("Beginning OATS -> ALCS app-document-import process")
    with console.status("[bold green]Link application documents in ALCS...\n") as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(
            f"Processing application documents in batch size = {import_batch_size}"
        )

        process_application_documents(batch_size=import_batch_size)


def noi_document_import(console, args):
    console.log("Beginning OATS -> ALCS noi-document-import process")
    with console.status("[bold green]Link application documents in ALCS...\n") as status:
        if args.batch_size:
            import_batch_size = args.batch_size

        console.log(f"Processing NOI documents in batch size = {import_batch_size}")

        process_noi_documents(batch_size=import_batch_size)
