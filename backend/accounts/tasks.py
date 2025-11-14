import resend
from celery import shared_task
from django.conf import settings
from django.core.mail import BadHeaderError
from templated_mail.mail import BaseEmailMessage


@shared_task
def send_verification_mail(otp, username, email):
    # link = create_user_account_activation_link(otp) # Create a link with account's email verification link
#    try:
#        message = BaseEmailMessage(
#            template_name='emails/send_otp.html',
#            context={
#                'username': username,
#                'otp': otp
#            }
#        )
#        message.send([email]) # Requires a list of recipiants
#    except BadHeaderError as e:
#    print(e)


    resend.api_key = settings.RESEND_API_KEY

    r = resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": email,
        "subject": "Verification mail",
        "html": f"Hello {username}!\nHere is your verification code: {otp}"
    })

