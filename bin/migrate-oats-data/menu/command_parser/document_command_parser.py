# Liam question which of the following document commands need to be deleted
def document_import_command_parser(import_batch_size, subparsers):
    document_import_command = subparsers.add_parser(
        "document-import",
        help=f"Import documents with specified batch size: (default: {import_batch_size})",
    )
    document_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    # document_import_command.set_defaults(func=process_documents)


def document_noi_import_command_parser(import_batch_size, subparsers):
    document_noi_import_command = subparsers.add_parser(
        "document-noi-import",
        help=f"Import documents_noi with specified batch size: (default: {import_batch_size})",
    )
    document_noi_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    # document_noi_import_command.set_defaults(func=process_documents_noi)


def application_document_import_command_parser(import_batch_size, subparsers):
    application_document_import_command = subparsers.add_parser(
        "app-document-import",
        help=f"Links imported documents with application documents  specified batch size: (default: {import_batch_size})",
    )
    application_document_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    # application_document_import_command.set_defaults(func=import_batch_size)


def noi_document_import_command_parser(import_batch_size, subparsers):
    noi_document_import_command = subparsers.add_parser(
        "noi-document-import",
        help=f"Links imported documents with noi documents  specified batch size: (default: {import_batch_size})",
    )
    noi_document_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    # noi_document_import_command.set_defaults(func=import_batch_size)
