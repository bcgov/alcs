from tqdm import tqdm
from config import (
    ecs_bucket,
)
import io


def record_file_into_new_file_obj(file):
    """This is required since s3.upload_fileobj cannot always correctly identify the file size of cx.Oracle file"""
    try:
        file_size = file.size()
        bytes_data = file.read()
        new_file_object = io.BytesIO(bytes_data)  # create file object from bytes
        if file_size != len(new_file_object.getvalue()):
            print("File sizes do not match")

        return new_file_object
    except Exception as err:
        print("Error in record_file_into_variable")
        raise


def upload_file_to_s3(
    s3, doc_upload_base_path, file_size, document_id, entity_id, filename, file
):
    file_to_upload = record_file_into_new_file_obj(file)

    with tqdm(
        total=file_size, unit="B", unit_scale=True, desc=filename
    ) as upload_progress_bar:
        s3.upload_fileobj(
            file_to_upload,
            ecs_bucket,
            f"{doc_upload_base_path}/{entity_id}/{document_id}_{filename}",
            Callback=lambda bytes_transferred: upload_progress_bar.update(
                bytes_transferred
            ),
        )

