def inquiry_import_command_parser(import_batch_size, subparsers):
    inquiry_import_command = subparsers.add_parser(
        "inquiry-import",
        help=f"Import Inquiry with specified batch size: (default: {import_batch_size})",
    )
    inquiry_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )


def inquiry_clean_command_parser(subparsers):
    subparsers.add_parser(
        "inquiry-clean",
        help="Clean Inquiry imported data:",
    )
