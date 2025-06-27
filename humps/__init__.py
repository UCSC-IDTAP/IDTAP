import re
from typing import Any

def decamelize(obj: Any) -> Any:
    """Convert camelCase keys in a dict to snake_case recursively."""
    if isinstance(obj, dict):
        new = {}
        for k, v in obj.items():
            s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", k)
            s2 = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1).lower()
            new[s2] = decamelize(v)
        return new
    elif isinstance(obj, list):
        return [decamelize(i) for i in obj]
    else:
        return obj
