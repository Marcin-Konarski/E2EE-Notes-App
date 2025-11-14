from django.conf import settings
from django.core.signing import dumps, loads, BadSignature, SignatureExpired


def generate_activation_key(user_id):
    """Create signed activation key for email verification"""
    x = dumps(user_id)
    return x

def verify_activation_key(activation_key):
    """Verify activation key"""
    try:
        user_id = loads(activation_key, max_age=settings.ACCOUNT_ACTIVATION_TIME)
        return user_id
    except (BadSignature, SignatureExpired):
        return None

def create_user_account_activation_link(user_id):
    """Create a link with signed activation key that redirects to frontend"""
    activation_key = generate_activation_key(user_id)
    return f'{settings.FRONTEND_URL}/verify/{activation_key}'

