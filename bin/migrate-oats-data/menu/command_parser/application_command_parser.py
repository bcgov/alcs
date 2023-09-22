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
    # application_import_command.set_defaults(func=import_batch_size)


def app_prep_import_command_parser(import_batch_size, subparsers):
    app_prep_import_command = subparsers.add_parser(
        "app-prep-import",
        help=f"Import App prep into ALCS (update applications table) in specified batch size: (default: {import_batch_size})",
    )
    app_prep_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    # app_prep_import_command.set_defaults(func=import_batch_size)


def app_sub_import_command_parser(import_batch_size, subparsers):
    app_sub_import_command = subparsers.add_parser(
        "app-sub-import",
        help=f"Import App submission into ALCS (update application_submission table) in specified batch size: (default: {import_batch_size})",
    )
    app_sub_import_command.add_argument(
        "--batch-size",
        type=int,
        default=import_batch_size,
        metavar="",
        help=f"batch size (default: {import_batch_size})",
    )
    # app_sub_import_command.set_defaults(func=import_batch_size)
