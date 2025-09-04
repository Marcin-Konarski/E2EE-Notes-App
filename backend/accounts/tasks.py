from django.core.mail import BadHeaderError

from templated_mail.mail import BaseEmailMessage
from celery import shared_task


@shared_task
def send_verification_mail(data):
    try:
        # send_mail('subject', 'message', 'info@arx.com', ['bob@arx.com'])
        message = BaseEmailMessage(
            template_name='emails/verify_account.html',
            context={'name': data.get('username')}
        )
        message.send([data.get('email')]) # Requires a list of recipiants
    except BadHeaderError as e:
        print(e)
