import json
from datetime import datetime

etl_log_file_name = "etl_log.txt"


def log_start(etl_name="Not specified", etl_log_file_name=etl_log_file_name):
    data = {
        "etl_name": etl_name,
        "start_time": datetime.now().isoformat(),
    }

    with open(etl_log_file_name, "a") as f:
        json.dump(data, f)
        f.write("\n")


def log_end(
    etl_name="Not specified",
    error_msg=None,
    error_log=None,
    etl_log_file_name=etl_log_file_name,
):
    data = {
        "etl_name": etl_name,
        "end_time": datetime.now().isoformat(),
        "error_msg": error_msg,
        "error_log": error_log,
    }

    with open(etl_log_file_name, "a") as f:
        json.dump(data, f)
        f.write("\n")
