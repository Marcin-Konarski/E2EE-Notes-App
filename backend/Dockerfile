FROM python:3.13-slim

RUN apt-get update && apt-get install -y celery

RUN groupadd app && useradd -m -g app app
USER app

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

# RUN chmod 0755 /app/entrypoint.sh

EXPOSE 8000

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]