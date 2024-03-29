def noi_import_command_parser(import_batch_size, subparsers):
    noi_import_command = subparsers.add_parser(
        "noi-import",
        help=f"Import NOI with specified batch size: (default: {import_batch_size})",
    )
    noi_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )


def noi_clean_command_parser(subparsers):
    subparsers.add_parser(
        "noi-clean",
        help="Clean NOI imported data:",
    )
