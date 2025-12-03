#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coverfolio_backend.settings')

    try:
        from django.core.management import execute_from_command_line
        from django.core.management import call_command
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # -----------------------------------------------------------
    # RUN TESTS BEFORE STARTING THE DEVELOPMENT SERVER
    # -----------------------------------------------------------
    # We check for 'runserver' AND ensure we are NOT in the reloader (child) process.
    # RUN_MAIN is set to 'true' only in the child process.
    if "runserver" in sys.argv and os.environ.get('RUN_MAIN') != 'true':
        print("🔍 Running test suite before starting server...\n")
        result = call_command("test", keepdb=True, verbosity=1)

        if result:
            print("\n❌ Tests FAILED — server will not start.")
            sys.exit(result)

        print("✅ All tests PASSED — starting server...\n")

    # Continue normal execution
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()