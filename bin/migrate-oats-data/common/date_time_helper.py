from datetime import datetime
import pytz


def convert_timezone(date_str, timezone_str="America/Vancouver"):
    # Convert the string to a datetime object
    if isinstance(date_str, str):
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    else:  # assuming date_str is a datetime object
        dt = date_str

    # Adjust timezone
    timezone = pytz.timezone(timezone_str)
    dt = dt.replace(tzinfo=pytz.UTC)
    dt_aware = dt.astimezone(timezone)

    # Format the string with the desired output
    formatted = dt_aware.strftime("%Y-%m-%d %H:%M:%S.%f %z")

    return formatted


def set_time(date_str, hour=0, minute=0, second=0):
    # Replace the time of the given date
    if isinstance(date_str, str):
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f %z")
    else:  # assuming date_str is a datetime object
        dt = date_str

    dt = dt.replace(hour=hour, minute=minute, second=second, microsecond=0)
    return dt.strftime("%Y-%m-%d %H:%M:%S.%f %z")
