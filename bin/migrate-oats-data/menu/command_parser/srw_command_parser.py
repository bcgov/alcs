def srw_import_command_parser(import_batch_size, subparsers):
    srw_import_command = subparsers.add_parser(
        "srw-import",
        help=f"Import SRW with specified batch size: (default: {import_batch_size})",
    )
    srw_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )


def srw_clean_command_parser(subparsers):
    subparsers.add_parser(
        "srw-clean",
        help="Clean SRW imported data:",
    )
