import os


def log_last_imported_file(last_document_id, log_file_name):
    with open(log_file_name, "w") as file:
        file.write(str(last_document_id))


def get_last_successfully_uploaded_file_from_log(file_name, entity_type):
    # Determine job resume status: retrieves last successfully uploaded document from log file
    document_id = 0

    if os.path.isfile(file_name):
        with open(file_name, "r") as file:
            document_id = file.read().strip()
        print(f"Starting {entity_type} from: {document_id}")

    return int(document_id)
