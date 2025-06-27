import re

def decamelize(obj):
    """Convert dictionary keys from camelCase to snake_case recursively."""
    if isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', k)
            snake = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
            new_obj[snake] = decamelize(v)
        return new_obj
    elif isinstance(obj, list):
        return [decamelize(i) for i in obj]
    else:
        return obj
