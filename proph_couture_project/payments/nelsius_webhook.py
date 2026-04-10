# payments/nelsius_webhook.py
import json
import hmac
import hashlib
import logging
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class NelsiusWebhookView(View):
    """
    Endpoint POST appelé par Nelsius après chaque événement de paiement.
    URL à configurer sur le dashboard Nelsius :
        https://backend-1-7oti.onrender.com/api/payments/webhook/nelsius/
    """

    def post(self, request, *args, **kwargs):
        # 1. Vérifier la signature Nelsius
        signature = request.headers.get('X-Nelsius-Signature', '')
        webhook_secret = getattr(settings, 'NELSIUS_WEBHOOK_SECRET', '')

        if webhook_secret and not self._verify_signature(request.body, signature, webhook_secret):
            logger.warning("Webhook Nelsius: signature invalide.")
            return HttpResponse(status=401)

        # 2. Décoder le payload
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return HttpResponse(status=400)

        event_type = payload.get('event') or payload.get('type', '')
        data = payload.get('data', {})
        reference = data.get('reference') or data.get('merchant_reference', '')
        status_value = data.get('status', '')

        logger.info(f"Webhook Nelsius reçu | event={event_type} | ref={reference} | status={status_value}")

        # 3. Traiter uniquement les paiements réussis
        if status_value in ('completed', 'success') or event_type in ('payment.success', 'checkout.completed'):
            self._mark_order_paid(reference)

        return JsonResponse({'received': True}, status=200)

    def _verify_signature(self, payload_bytes, signature, secret):
        """Vérifie la signature HMAC-SHA256 envoyée par Nelsius."""
        expected = hmac.new(
            secret.encode('utf-8'),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    def _mark_order_paid(self, order_number):
        """Marque la commande comme payée après confirmation Nelsius."""
        if not order_number:
            return
        try:
            from orders.models import Order
            order = Order.objects.get(order_number=order_number)

            if order.payment_status == 'paid':
                logger.info(f"Commande {order_number} déjà marquée payée.")
                return

            order.payment_status = 'paid'
            order.status = 'paid'
            order.paid_at = timezone.now()
            order.save()
            logger.info(f"✅ Commande {order_number} marquée PAYÉE via webhook Nelsius.")

            # Décrémenter le stock
            for item in order.items.all():
                if item.product and hasattr(item.product, 'stock_quantity'):
                    if item.product.stock_quantity >= item.quantity:
                        item.product.stock_quantity -= item.quantity
                        item.product.save()

            # Notification in-app
            try:
                from communications.models import Notification
                Notification.objects.create(
                    user=order.user,
                    title=f"Paiement confirmé — Commande {order_number}",
                    message="Votre paiement a été validé. Votre commande est en cours de traitement.",
                    type='INFO'
                )
            except Exception as e:
                logger.warning(f"Notification non créée: {e}")

        except Exception as e:
            logger.error(f"Erreur webhook _mark_order_paid ({order_number}): {e}")
