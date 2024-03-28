def planning_review_import_command_parser(import_batch_size, subparsers):
    srw_import_command = subparsers.add_parser(
        "pr-import",
        help=f"Import Planning Reviews with specified batch size: (default: {import_batch_size})",
    )
    srw_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )


def planning_review_clean_command_parser(subparsers):
    subparsers.add_parser(
        "pr-clean",
        help="Clean Planning Reviews imported data:",
    )
