#!/bin/bash
set -e # (exit immediately if any command fails)
python manage.py migrate
python -m gunicorn app.asgi:application -k uvicorn.workers.UvicornWorker -w 1 --bind 0.0.0.0:8000 --access-logfile '-' --error-logfile '-' --timeout 600 --log-level info
exec "$@"
