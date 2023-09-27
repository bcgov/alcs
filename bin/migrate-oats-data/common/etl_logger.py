import json
from datetime import datetime


def log_start(etl_name):
    data = {
        "etl_name": etl_name,
        "start_time": datetime.now().isoformat(),
    }

    with open(f"{etl_name}.log.txt", "a") as f:
        json.dump(data, f)
        f.write("\n")


def log(etl_name, error_msg=None, error_log=None, extra_data=None):
    data = {
        "etl_name": etl_name,
        "time": datetime.now().isoformat(),
        "error_msg": error_msg,
        "error_log": error_log,
        "extra_data": extra_data,
    }

    with open(f"{etl_name}.log.txt", "a") as f:
        json.dump(data, f)
        f.write("\n")
