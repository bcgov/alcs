import functools


def log_process(logger, proc_name):
    def decorator_log_process(func):
        @functools.wraps(func)
        def wrapper_log_process(*args, **kwargs):
            logger.info(f"Start '{proc_name}'")
            result = func(*args, **kwargs)
            logger.info(f"Finished '{proc_name}'")
            return result

        return wrapper_log_process

    return decorator_log_process
