#!/bin/bash
# Run Python tests for IDTAP server scripts
#
# Usage:
#   ./run_tests.sh          # Run all tests
#   ./run_tests.sh -k import  # Run only import tests
#   ./run_tests.sh -m slow   # Run only slow tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if .venv-test exists, create if not
if [ ! -d "$PROJECT_ROOT/.venv-test" ]; then
    echo "Creating test virtual environment..."
    uv venv "$PROJECT_ROOT/.venv-test" --python 3.11
    echo "Installing dependencies..."
    uv pip install -r "$PROJECT_ROOT/requirements.txt" --python "$PROJECT_ROOT/.venv-test/bin/python"
fi

# Run tests
cd "$SCRIPT_DIR"
"$PROJECT_ROOT/.venv-test/bin/python" -m pytest tests/ "$@"
