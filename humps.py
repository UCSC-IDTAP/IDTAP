import re
from typing import Any

def _decamelize_key(name: str) -> str:
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1)
    return s2.lower()

def decamelize(obj: Any) -> Any:
    if isinstance(obj, dict):
        return { _decamelize_key(k): decamelize(v) for k, v in obj.items() }
    elif isinstance(obj, list):
        return [decamelize(v) for v in obj]
    else:
        return obj
