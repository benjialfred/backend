# payments/services/nelsius_service.py
import logging
from django.conf import settings
try:
    from nelsius import Nelsius
except ImportError:
    Nelsius = None
import requests

logger = logging.getLogger(__name__)

class NelsiusService:
    """Service d'intégration avec l'API Nelsius utilisant le SDK officiel"""
    
    def __init__(self):
        # Utilisation de la clé fournie de manière robuste
        settings_key = getattr(settings, 'NELSIUS_SECRET_KEY', None)
        self.secret_key = settings_key if settings_key else ''
        
        # Initialisation du client Nelsius
        try:
            self.client = Nelsius(self.secret_key)
        except Exception as e:
            logger.error(f"Erreur d'initialisation du SDK Nelsius: {e}")
            self.client = None
    
    def create_payment(self, order, customer_info, return_url):
        """
        Crée un paiement sur Nelsius via l'instance checkout
        """
        try:
            logger.info(f"Création de paiement pour la commande {order.order_number}")
            
            if not self.client:
                return {
                    'success': False,
                    'error': "Le service de paiement Nelsius n'a pas pu être initialisé."
                }
            
            session = self.client.checkout.create_session({
                'amount': int(order.total_amount),
                'currency': 'XAF',
                'reference': order.order_number,
                'return_url': return_url,
                'customer': {
                    'email': customer_info.get('email') or 'contact@prophcouture.com',
                    'name': customer_info.get('name') or 'Client Proph Couture'
                }
            })
            
            logger.info(f"Réponse création session Nelsius: {session}")
            
            checkout_url = session.get('data', {}).get('checkout_url')
            transaction_id = session.get('data', {}).get('id') or order.order_number
            
            if checkout_url:
                return {
                    'success': True,
                    'payment_url': checkout_url,
                    'transaction_id': transaction_id,
                    'merchant_reference': order.order_number
                }
            else:
                return {
                    'success': False,
                    'error': "Erreur: URL de paiement non générée par Nelsius."
                }
                
        except Exception as e:
            logger.error(f"Erreur système Nelsius: {str(e)}")
            return {
                'success': False,
                'error': f"Erreur de paiement: {str(e)}"
            }
    
    def verify_payment(self, transaction_id):
        """
        Vérification du paiement
        (Fallback aux requêtes classiques si non documenté dans le SDK envoyé)
        """
        try:
            base_url = getattr(settings, 'NELSIUS_BASE_URL', 'https://api.nelsius.com/api/v1')
            response = requests.get(
                f"{base_url}/payments/{transaction_id}",
                headers={
                    'X-API-SECRET': self.secret_key, 
                    'Accept': 'application/json'
                },
                timeout=15
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Vérification Nelsius a échoué avec le statut: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Erreur vérification Nelsius: {e}")
            return None