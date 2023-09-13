from tqdm import tqdm
from config import (
    ecs_bucket,
)


def upload_file_to_s3(
    s3, doc_upload_base_path, file_size, document_id, entity_id, filename, file
):
    with tqdm(
        total=file_size, unit="B", unit_scale=True, desc=filename
    ) as upload_progress_bar:
        s3.upload_fileobj(
            file,
            ecs_bucket,
            f"{doc_upload_base_path}/{entity_id}/{document_id}_{filename}",
            Callback=lambda bytes_transferred: upload_progress_bar.update(
                bytes_transferred
            ),
        )
