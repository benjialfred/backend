import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from payments.services.nelsius_service import NelsiusService

print("Testing Nelsius SDK directly...")
ns = NelsiusService()
try:
    session = ns.client.checkout.create_session({
        'amount': 5000,
        'currency': 'XAF',
        'reference': 'CMD-TEST991',
        'return_url': 'http://localhost/success',
        'customer': {
            'email': 'test@test.com',
            'name': 'Test'
        }
    })
    print("RAW RESPONSE:", session)
except Exception as e:
    print("EXCEPTION:", str(e))
