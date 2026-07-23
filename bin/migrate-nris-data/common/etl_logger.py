import logging
import os
from logging.handlers import RotatingFileHandler
from rich.logging import RichHandler


def _create_logs_folder():
    curr_dir = os.getcwd()
    logs_folder = os.path.join(curr_dir, "logs")
    os.makedirs(logs_folder, exist_ok=True)
    return logs_folder


def setup_and_get_logger(logger_name):
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)  # Lowest level to control overall

    # Handler for console which accepts DEBUG level and above
    console_handler = RichHandler()
    console_handler.setLevel(logging.DEBUG)

    # Define Log file path - current working directory + filename
    logs_folder = _create_logs_folder()
    log_file = os.path.join(logs_folder, f"{logger_name}.log.txt")

    file_handler = RotatingFileHandler(log_file, maxBytes=20000, backupCount=5)
    file_formatter = logging.Formatter(
        "%(asctime)s - %(levelname)s - [%(name)s] - %(message)s"
    )
    file_handler.setFormatter(file_formatter)
    # Handler for the file which accepts INFO level and above

    file_handler.setLevel(logging.INFO)

    # Add handlers to the logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logging.getLogger(logger_name)
