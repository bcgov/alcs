def application_import_command_parser(import_batch_size, subparsers):
    application_import_command = subparsers.add_parser(
        "application-import",
        help=f"Import application with specified batch size: (default: {import_batch_size})",
    )
    application_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )


def app_clean_command_parser(subparsers):
    subparsers.add_parser(
        "application-clean",
        help="Clean Application imported data:",
    )
