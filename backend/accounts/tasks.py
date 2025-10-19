from django.core.mail import BadHeaderError
from templated_mail.mail import BaseEmailMessage
from celery import shared_task

# from .account_activation import create_user_account_activation_link


@shared_task
def send_verification_mail(otp, username, email):
    # link = create_user_account_activation_link(otp) # Create a link with account's email verification link
    try:
        message = BaseEmailMessage(
            template_name='emails/send_otp.html',
            context={
                'username': username,
                'otp': otp
            }
        )
        message.send([email]) # Requires a list of recipiants
    except BadHeaderError as e:
        print(e)
