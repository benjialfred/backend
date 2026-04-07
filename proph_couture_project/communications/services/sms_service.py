import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class SMSService:
    """
    Service d'envoi de SMS générique. 
    À configurer plus tard avec les identifiants d'une API spécifique 
    (ex: LMT, Orange, Twilio, Infobip, etc.).
    """
    API_URL = getattr(settings, 'SMS_API_URL', 'https://api.example-sms.com/send')
    API_KEY = getattr(settings, 'SMS_API_KEY', '')
    SENDER_ID = getattr(settings, 'SMS_SENDER_ID', 'ProphCouture')

    @classmethod
    def send_sms(cls, phone_number, message):
        """Envoie un SMS à un numéro spécifique"""
        # Nettoyer le numéro pour enlever les espaces et ajouter l'indicatif si absent
        cleaned_phone = phone_number.replace(' ', '').replace('-', '')
        if len(cleaned_phone) == 9 and cleaned_phone.startswith(('6', '2')):
            cleaned_phone = f"+237{cleaned_phone}"
        elif cleaned_phone.startswith('237'):
            cleaned_phone = f"+{cleaned_phone}"
            
        payload = {
            "api_key": cls.API_KEY,
            "to": cleaned_phone,
            "from": cls.SENDER_ID,
            "text": message
        }

        if not cls.API_KEY or cls.API_KEY == 'votre_cle_api_ici':
            print(f"--- SIMULATION D'ENVOI SMS A {cleaned_phone} ---")
            print(f"Message: {message}")
            print("-------------------------------------------------")
            logger.info(f"SIMULATION SMS envoyé avec succès à {cleaned_phone}")
            return True
            
        try:
            response = requests.post(cls.API_URL, json=payload, timeout=10)
            if response.status_code in [200, 201]:
                logger.info(f"SMS envoyé avec succès à {cleaned_phone}")
                return True
            else:
                logger.error(f"Erreur d'envoi SMS: HTTP {response.status_code} - {response.text}")
                return False
        except requests.exceptions.Timeout:
            logger.error(f"Erreur d'envoi SMS: Délai d'attente dépassé (Timeout) pour {cleaned_phone}")
            return False
        except Exception as e:
            logger.error(f"Exception lors de l'envoi SMS: {e}")
            return False

    @classmethod
    def send_order_confirmation(cls, order):
        """Notifie le client par SMS que sa commande a été bien reçue"""
        phone = order.shipping_address.get('phone') if hasattr(order, 'shipping_address') and order.shipping_address else None
        
        # Si le téléphone n'est pas dans l'adresse, prendre celui de l'utilisateur
        if not phone and order.user and order.user.telephone:
            phone = order.user.telephone
            
        if phone:
            prenom = getattr(order.user, 'prenom', getattr(order.user, 'first_name', 'Client(e)'))
            # Limiter la longueur du nom si c'est vide
            if not prenom or str(prenom).strip() == "":
                prenom = "Client(e)"
                
            message = (
                f"Bonjour {prenom}, "
                f"Votre commande #{order.order_number} a été bien reçue par Prophétique Couture. "
                "Nous reviendrons vers vous très vite. Merci de votre confiance."
            )
            return cls.send_sms(phone, message)
        return False
