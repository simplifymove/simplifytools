"""Shared delimiter validation for CSV input and output engines."""

from typing import Any


SEMANTIC_DELIMITERS = {
    "comma": ",",
    "semicolon": ";",
    "tab": "\t",
    "pipe": "|",
}


def normalize_delimiter(value: Any) -> str:
    """Return a valid one-character CSV delimiter or raise a clear error."""
    if not isinstance(value, str):
        raise ValueError("Delimiter must be a string")

    semantic_value = value.strip().lower()
    if semantic_value in SEMANTIC_DELIMITERS:
        return SEMANTIC_DELIMITERS[semantic_value]

    if len(value) == 1 and value not in {"\r", "\n", "\0"}:
        return value

    if not value:
        raise ValueError("Delimiter cannot be empty")

    raise ValueError(
        "Unsupported delimiter. Use comma, semicolon, tab, pipe, or a single character"
    )
