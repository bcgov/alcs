import json
import datetime


class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, set):
            return list(obj)
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)


def to_json(obj):
    try:
        obj = json.dumps(obj)
    except TypeError:
        try:
            obj = str(obj)
        except Exception:
            obj = repr(obj)
    return obj
