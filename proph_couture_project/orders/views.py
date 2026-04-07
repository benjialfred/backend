# orders/views.py
from rest_framework import generics, permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import json

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, 
    CreateOrderSerializer,
    UserMeasurementsSerializer
)
from users.permissions import IsAdmin
from django.db.models import Sum, Count, F, Value
from django.db.models.functions import TruncMonth, TruncDay
from django.db import models
import calendar

class MyOrdersView(generics.ListAPIView):
    """Liste toutes les commandes de l'utilisateur connecté"""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
            
        if user.role in ['ADMIN', 'SUPER_ADMIN']:
            return Order.objects.all().order_by('-created_at')
        elif user.role == 'WORKER':
            # Workers see all orders or assigned ones. Assuming all for now for production flow.
            return Order.objects.all().order_by('-created_at')
        elif user.role == 'APPRENTI':
            # Apprentices might see only non-critical or assigned orders. 
            # For now, let's allow read access to all but restriction is in updates.
            return Order.objects.all().order_by('-created_at')
        else:
            # Clients only see their own orders
            return Order.objects.filter(user=user).order_by('-created_at').prefetch_related('items')

class AdminOrderListView(generics.ListAPIView):
    """Liste toutes les commandes (Admin uniquement)"""
    
    serializer_class = OrderSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        return Order.objects.all().order_by('-created_at')

class OrderViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing order instances.
    This replaces the previous CreateOrderView and potentially others for a unified API.
    """
    serializer_class = OrderSerializer
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.all().order_by('-created_at')
        
        if not user.is_authenticated:
            return Order.objects.none()
            
        if user.role in ['ADMIN', 'SUPER_ADMIN', 'WORKER']:
            # Admin/Worker see all (or filter logic if needed)
            return queryset
        elif user.role == 'APPRENTI':
             # Apprentices see all for now (or assigned)
             return queryset
        else:
            # Clients ONLY see their own
            return queryset.filter(user=user)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'destroy':
            permission_classes = [IsWorker] 
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsApprentice] # Apprentices can modify some parts, strictness handled in serializer/perform_update
        elif self.action == 'list':
             permission_classes = [permissions.IsAuthenticated] # Filtering handled in get_queryset
        else: # retrieve
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        """Surcharge pour mieux gérer la création de commande avec l'utilisateur connecté"""
        try:
            with transaction.atomic():
                order = serializer.save(user=self.request.user)
        except Exception as e:
            raise e

    def perform_update(self, serializer):
        """Surcharge pour envoyer un email et une notification si le statut change"""
        instance = self.get_object()
        old_status = instance.status
        old_state = instance.production_state
        
        # Sauvegarder les modifications
        updated_order = serializer.save()
        
        # On notifie si le statut a changé
        if old_status != updated_order.status:
            self._send_status_update_notification(updated_order, old_status)
            
        # On notifie si l'état de production a changé
        if old_state != updated_order.production_state:
            self._send_state_update_notification(updated_order, old_state)

    def _send_status_update_notification(self, order, old_status):
        """Envoie un email et une notification in-app au client pour la mise à jour du statut global"""
        try:
            status_display = dict(Order.STATUS_CHOICES).get(order.status, order.status)
            subject = f"Mise à jour de votre commande #{order.order_number}"
            prenom = getattr(order.user, 'prenom', getattr(order.user, 'first_name', 'Client'))
            message = f"Bonjour {prenom},\n\n"
            
            message += f"Le statut de votre commande #{order.order_number} a évolué !\n"
            message += f"Son nouvel état d'avancement est : {status_display}\n\n"
                
            message += "Vous pouvez suivre l'évolution de votre commande sur votre application (espace client).\n\n"
            message += "Cordialement,\n"
            message += "L'équipe Prophétique Couture"
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [order.user.email],
                fail_silently=True,
            )
            print(f"DEBUG: Email 'Mise à jour statut' ({status_display}) envoyé à {order.user.email}")
            
            # Create in-app notification for Client
            from communications.models import Notification
            Notification.objects.create(
                user=order.user,
                title=f"Commande {order.order_number} : {status_display}",
                message=f"Le statut de votre commande a été mis à jour : {status_display}",
                type='INFO'
            )
        except Exception as e:
            print(f"Erreur envoi notification statut : {e}")
            
    def _send_state_update_notification(self, order, old_state):
        """Envoie un email et une notification in-app au client pour la mise à jour de l'état de production"""
        try:
            state_display = dict(Order.PRODUCTION_STATE_CHOICES).get(order.production_state, order.production_state)
            subject = f"Avancement de confection - Commande #{order.order_number}"
            prenom = getattr(order.user, 'prenom', getattr(order.user, 'first_name', 'Client'))
            message = f"Bonjour {prenom},\n\n"
            
            if order.production_state == 'fitting':
                message += f"Excellente nouvelle ! La confection de votre commande #{order.order_number} a atteint l'étape de l'essayage.\n"
                message += "Nous vous invitons à passer à la boutique dès que possible pour l'essayer.\n\n"
            elif order.production_state == 'ready':
                message += f"Félicitations ! Votre commande #{order.order_number} est terminée et prête à être récupérée ou livrée.\n\n"
            else:
                message += f"L'état de confection de votre commande #{order.order_number} a évolué !\n"
                message += f"Son nouvel état est : {state_display}\n\n"
                
            message += "Vous pouvez suivre tous les détails sur votre application (espace client).\n\n"
            message += "Cordialement,\n"
            message += "L'équipe Prophétique Couture"
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [order.user.email],
                fail_silently=True,
            )
            print(f"DEBUG: Email 'Mise à jour état production' ({state_display}) envoyé à {order.user.email}")
            
            from communications.models import Notification
            # Create in-app notification for Client
            Notification.objects.create(
                user=order.user,
                title=f"Confection {order.order_number} : {state_display}",
                message=f"L'état de confection a été mis à jour : {state_display}",
                type='INFO'
            )
            
            # BROADCAST TO STAFF WHEN SEWING IS FINISHED (State: ready)
            if order.production_state == 'ready':
                from django.contrib.auth import get_user_model
                User = get_user_model()
                staff_users = User.objects.filter(role__in=['ADMIN', 'SUPER_ADMIN', 'WORKER'])
                staff_emails = [u.email for u in staff_users if u.email]
                
                if staff_emails:
                    staff_subject = f"Couture Terminée - Commande #{order.order_number}"
                    staff_message = f"La commande #{order.order_number} du client {order.user.email} est prête (Couture terminée).\nVous pouvez procéder à la livraison."
                    send_mail(staff_subject, staff_message, settings.DEFAULT_FROM_EMAIL, staff_emails, fail_silently=True)
                
                # In-app notifications for staff
                for staff in staff_users:
                    Notification.objects.create(
                        user=staff,
                        title=f"Commande {order.order_number} prête",
                        message=f"La couture de la commande #{order.order_number} du client {order.user.email} est terminée.",
                        type='INFO'
                    )
        except Exception as e:
            print(f"ERREUR: Impossible d'envoyer la notification de mise à jour: {e}")

    def create(self, request, *args, **kwargs):
        """Surcharge pour mieux gérer la réponse de création"""
        print(f"DEBUG: Incoming Order Data: {json.dumps(request.data, indent=2, default=str)}")
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print(f"DEBUG: Validation Error: {e}")
            raise e
        
        try:
                order = serializer.save(user=self.request.user)
                
                # --- Envoi de la notification SMS ---
                try:
                    from communications.services.sms_service import SMSService
                    SMSService.send_order_confirmation(order)
                except Exception as sms_error:
                    # On ne bloque pas la réponse si le SMS échoue
                    print(f"Erreur tentative envoi SMS confirmation: {sms_error}")
                    
        except Exception as e:
            return Response(
                {'error': f'Erreur création commande: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retourner les données complètes
        response_serializer = OrderSerializer(order, context=self.get_serializer_context())
        headers = self.get_success_headers(response_serializer.data)
        
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class OrderDetailView(generics.RetrieveAPIView):
    """Détails d'une commande spécifique"""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Récupère la commande par order_number"""
        order_number = self.kwargs.get('order_number')
        order = get_object_or_404(
            Order.objects.prefetch_related('items'),
            order_number=order_number,
            user=self.request.user
        )
        return order

class CancelOrderView(APIView):
    """Annulation d'une commande"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_number):
        """Annule une commande si possible"""
        order = get_object_or_404(
            Order,
            order_number=order_number,
            user=request.user
        )
        
        if not order.can_be_cancelled:
            return Response(
                {'error': 'Cette commande ne peut pas être annulée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Annuler la commande
        order.status = 'cancelled'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)

class DownloadInvoiceView(APIView):
    """Téléchargement de la facture (placeholder)"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, order_number):
        """Génère et retourne la facture en JSON (placeholder)"""
        order = get_object_or_404(
            Order,
            order_number=order_number,
            user=request.user
        )
        
        # Vérifier que la commande est payée
        if not order.is_paid:
            return Response(
                {'error': 'Facture non disponible. La commande n\'est pas payée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Générer les données de facture (placeholder)
        invoice_data = {
            'invoice_number': f'INV-{order.order_number}',
            'order_number': order.order_number,
            'date': order.created_at.strftime('%d/%m/%Y'),
            'customer': {
                'name': request.user.get_full_name(),
                'email': request.user.email,
                'address': order.shipping_address.get('street', ''),
                'city': order.shipping_address.get('city', ''),
                'country': order.shipping_address.get('country', '')
            },
            'items': [
                {
                    'description': item.product_name,
                    'quantity': item.quantity,
                    'unit_price': float(item.product_price),
                    'total': float(item.total_price)
                }
                for item in order.items.all()
            ],
            'summary': {
                'subtotal': float(order.subtotal),
                'shipping': float(order.shipping_cost),
                'tax': float(order.tax),
                'total': float(order.total_amount)
            },
            'payment_method': order.payment_method,
            'payment_status': order.payment_status
        }
        
        return Response(invoice_data)

class MyMeasurementsView(APIView):
    """Gestion des mesures personnelles"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Récupère les mesures de l'utilisateur"""
        user = request.user
        
        # Initialiser les mesures si elles n'existent pas
        if not user.measurements:
            user.measurements = {}
            user.save()
        
        # Préparer les données pour le serializer
        measurements_data = {
            'height': user.measurements.get('height'),
            'bust': user.measurements.get('bust'),
            'waist': user.measurements.get('waist'),
            'hips': user.measurements.get('hips'),
            'shoulder_width': user.measurements.get('shoulder_width'),
            'arm_length': user.measurements.get('arm_length'),
            'leg_length': user.measurements.get('leg_length'),
            'back_length': user.measurements.get('back_length'),
            'chest_width': user.measurements.get('chest_width'),
            'notes': user.measurements.get('notes', ''),
            'last_updated': user.measurements.get('last_updated')
        }
        
        serializer = UserMeasurementsSerializer(measurements_data)
        return Response(serializer.data)
    
    def post(self, request):
        """Sauvegarde les mesures de l'utilisateur"""
        serializer = UserMeasurementsSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Mettre à jour les mesures
            user.measurements = {
                'height': serializer.validated_data.get('height'),
                'bust': serializer.validated_data.get('bust'),
                'waist': serializer.validated_data.get('waist'),
                'hips': serializer.validated_data.get('hips'),
                'shoulder_width': serializer.validated_data.get('shoulder_width'),
                'arm_length': serializer.validated_data.get('arm_length'),
                'leg_length': serializer.validated_data.get('leg_length'),
                'back_length': serializer.validated_data.get('back_length'),
                'chest_width': serializer.validated_data.get('chest_width'),
                'notes': serializer.validated_data.get('notes', ''),
                'last_updated': timezone.now().isoformat()
            }
            
            user.save()
            
            # Retourner les données mises à jour
            return Response({
                'success': True,
                'message': 'Mesures sauvegardées avec succès',
                'measurements': user.measurements
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserSpendView(APIView):
    """Calcule le montant total dépensé par l'utilisateur connecté"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Filtre les commandes payées/livrées
        spent_summary = Order.objects.filter(
            user=user,
            status__in=['paid', 'confirmed', 'shipped', 'delivered', 'ready']
        ).aggregate(total_spent=Sum('total_amount'))
        
        total_spent = spent_summary['total_spent'] or 0
        
        return Response({
            'user_id': user.id,
            'total_spent': float(total_spent)
        })

class InitiatePaymentView(APIView):
    """Initialise le paiement pour une commande"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_number):
        """Initialise le paiement pour une commande"""
        # Récupérer la commande
        order = get_object_or_404(
            Order,
            order_number=order_number,
            user=request.user,
            status='pending'  # Seulement pour les commandes en attente
        )
        
        # Vérifier que le montant est valide
        if order.total_amount <= 0:
            return Response(
                {'error': 'Montant de commande invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determine payment method
        payment_method = request.data.get('payment_method', 'mobile-money')

        # Handle Nelsius (Mobile Money)
        try:
            # Importer dynamiquement pour éviter les erreurs si Nelsius n'est pas configuré
            from payments.services.nelsius_service import NelsiusService
            
            # Initialiser le service Nelsius
            nelsius_service = NelsiusService()
            
            # Informations client
            customer_info = {
                'name': request.user.get_full_name() or request.user.email,
                'email': request.user.email,
                'phone': request.data.get('phone', request.user.telephone or '')
            }
            
            # URL de retour (Rediriger vers le Frontend, pas le Backend)
            frontend_url = request.headers.get('Origin', 'http://localhost:5173')
            return_url = f'{frontend_url}/payment/success/?order={order.order_number}'
            
            # Créer le paiement
            payment_result = nelsius_service.create_payment(
                order=order,
                customer_info=customer_info,
                return_url=return_url
            )
            
            if payment_result.get('success'):
                # Sauvegarder l'ID de transaction
                order.transaction_id = payment_result.get('transaction_id')
                order.payment_method = 'mobile-money'
                order.save()
                
                return Response({
                    'success': True,
                    'payment_url': payment_result.get('payment_url'),
                    'transaction_id': payment_result.get('transaction_id'),
                    'order_number': order.order_number,
                    'payment_method': 'mobile-money'
                })
            else:
                error_msg = payment_result.get('error', "Le paiement a échoué. Veuillez vérifier votre solde ou réessayer.")
                # Map common technical errors to user-friendly messages
                if "insufficient funds" in error_msg.lower():
                    error_msg = "Solde insuffisant pour effectuer la transaction."
                elif "timeout" in error_msg.lower():
                    error_msg = "Le délai de paiement est dépassé. Veuillez réessayer."
                
                return Response({
                    'success': False,
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ImportError:
            # Si Nelsius n'est pas configuré, simuler une réponse de test
            return Response({
                'success': True,
                'payment_url': f'/payment/test/?order={order.order_number}',
                'transaction_id': f'TEST-{order.order_number}',
                'order_number': order.order_number,
                'note': 'Mode test - Nelsius non configuré'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': "Une erreur technique est survenue lors de l'initialisation du paiement. Veuillez contacter le support."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    """Vérifie le statut d'un paiement Nelsius"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_number):
        order = get_object_or_404(
            Order,
            order_number=order_number,
            user=request.user
        )
        
        if order.payment_status == 'paid':
            return Response({'success': True, 'message': 'Paiement déjà validé'})
            
        if not order.transaction_id:
            return Response({'success': False, 'error': 'Aucune transaction en cours pour cette commande'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from payments.services.nelsius_service import NelsiusService
            nelsius_service = NelsiusService()
            
            result = nelsius_service.verify_payment(order.transaction_id)
            
            if result and (result.get('status') == 'success' or result.get('status') == 'completed') and result.get('data', {}).get('status') == 'completed':
                order.status = 'paid'
                order.payment_status = 'paid'
                order.paid_at = timezone.now()
                order.save()
                
                # Update inventory
                try:
                    for item in order.items.all():
                        if item.product and hasattr(item.product, 'stock_quantity'):
                            if item.product.stock_quantity >= item.quantity:
                                item.product.stock_quantity -= item.quantity
                                item.product.save()
                except Exception as e:
                    pass
                
                return Response({'success': True, 'message': 'Paiement validé avec succès'})
            elif result and result.get('data', {}).get('status') == 'failed':
                order.payment_status = 'failed'
                order.save()
                return Response({'success': False, 'error': 'Le paiement a échoué'}, status=status.HTTP_400_BAD_REQUEST)
            elif result and result.get('data', {}).get('status') == 'cancelled':
                order.status = 'cancelled'
                order.save()
                return Response({'success': False, 'error': 'Le paiement a été annulé'}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({'success': False, 'status': 'pending', 'message': 'Le paiement est toujours en attente'}, status=status.HTTP_200_OK)
            
        except ImportError:
            return Response({'error': 'Service Nelsius non disponible'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({'error': f'Erreur lors de la vérification: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardStatsView(APIView):
    """
    API pour les statistiques du dashboard (Admin uniquement)
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now()
        current_year = today.year
        current_month = today.month

        # 0. Statistiques Globales (Counts)
        from django.contrib.auth import get_user_model
        from products.models import Product
        User = get_user_model()
        
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        total_users = User.objects.count()
        active_apprentices = User.objects.filter(role='APPRENTI', is_active=True).count()
        total_products = Product.objects.count()

        # 1. Analyse des commandes (Mois en cours) - Groupé par jour
        monthly_orders_qs = Order.objects.filter(
            created_at__year=current_year,
            created_at__month=current_month
        ).annotate(
            day=TruncDay('created_at')
        ).values('day').annotate(
            count=Count('id'),
            total_revenue=Sum('total_amount')
        ).order_by('day')

        monthly_data = []
        # Pré-remplir tous les jours du mois
        _, num_days = calendar.monthrange(current_year, current_month)
        for day in range(1, num_days + 1):
             monthly_data.append({
                 'name': f"{day}",
                 'orders': 0,
                 'revenue': 0
             })
        
        for entry in monthly_orders_qs:
            day_index = entry['day'].day - 1
            if 0 <= day_index < len(monthly_data):
                monthly_data[day_index]['orders'] = entry['count']
                monthly_data[day_index]['revenue'] = float(entry['total_revenue'] or 0)


        # 2. Analyse Annuelle - Groupé par mois (TOUTES LES DONNÉES)
        try:
            yearly_orders_qs = Order.objects.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                count=Count('id'),
                total_revenue=Sum('total_amount')
            ).order_by('month') # Chronological

            yearly_data = []
            for entry in yearly_orders_qs:
                if entry['month']:
                    yearly_data.append({
                        'name': entry['month'].strftime('%b %Y'), # e.g. "Jan 2024"
                        'orders': entry['count'],
                        'revenue': float(entry['total_revenue'] or 0)
                    })
        except Exception as e:
            print(f"Error processing yearly stats: {e}")
            yearly_data = []


        # 3. Meilleurs Produits (TOUS)
        best_products_data = [] # Default
        try:
            best_products_qs = OrderItem.objects.filter(
                order__status__in=['paid', 'confirmed', 'delivered', 'shipped', 'ready']
            ).values('product_name').annotate(
                total_sold=Sum('quantity'),
                avg_rating=models.Value(4.5, output_field=models.FloatField())
            ).order_by('-total_sold')

            best_products_data = [
                {
                    'name': item['product_name'][:20] + '...' if len(item['product_name']) > 20 else item['product_name'],
                    'sales': item['total_sold'],
                    'rating': 4.5 * 20 
                }
                for item in best_products_qs
            ]
        except Exception as e:
            print(f"Error best products: {e}")

        # 4. Statistiques Évènements (Par Catégorie)
        events_data = []
        try:
            from communications.models import Event
            events_qs = Event.objects.values('category').annotate(count=Count('id'))
            
            # Map codes to readable names
            category_map = dict(Event.CATEGORY_CHOICES)
            
            events_data = [
                {
                    'name': category_map.get(item['category'], item['category']),
                    'value': item['count']
                }
                for item in events_qs
            ]
        except ImportError:
            pass # Event model might not exist in this context
        except Exception as e:
            print(f"Error events stats: {e}")

        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'total_users': total_users,
            'active_apprentices': active_apprentices,
            'total_products': total_products,
            'monthly_orders': monthly_data,
            'yearly_orders': yearly_data,
            'best_products': best_products_data,
            'events_distribution': events_data
        })

class DownloadInvoiceView(APIView):
    """Télécharger la facture PDF d'une commande (Client ou Admin)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number)
        
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN'] and order.user != request.user:
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        from .services.invoice_generator import InvoiceGenerator
        
        try:
            pdf_buffer = InvoiceGenerator.generate(order)
            response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Facture_{order.order_number}.pdf"'
            return response
        except Exception as e:
            return Response({'error': f'Erreur lors de la génération: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
