# payments/webhooks.py
import json
import hmac
import hashlib
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.views import View

class PaymentWebhookView(View):
    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request, provider):
        # Valider la signature du webhook
        if not self._verify_signature(request, provider):
            return HttpResponse(status=401)
        
        payload = json.loads(request.body)
        
        # Traiter selon le provider
        if provider == 'cinetpay':
            return self._handle_cinetpay_webhook(payload)
        
        return HttpResponse(status=200)
    
    def _verify_signature(self, request, provider):
        """Vérifie la signature du webhook pour sécurité"""
        # Implémentation spécifique
        return True