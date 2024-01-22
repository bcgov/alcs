def user_import_command_parser(import_batch_size, subparsers):
    user_import_command = subparsers.add_parser(
        "user-import",
        help=f"Import User with specified batch size: (default: {import_batch_size})",
    )
    user_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )


def user_clean_command_parser(subparsers):
    subparsers.add_parser(
        "user-clean",
        help="Clean User imported data:",
    )
