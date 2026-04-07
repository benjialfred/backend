# orders/urls.py
from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # Commandes utilisateur
    path('', views.MyOrdersView.as_view(), name='orders-list'), # FIX: Map root to MyOrders
    path('admin/all/', views.AdminOrderListView.as_view(), name='admin-all-orders'),
    path('my-orders/', views.MyOrdersView.as_view(), name='my-orders'),
    path('create/', views.OrderViewSet.as_view({'post': 'create'}), name='create-order'),
    
    # Détails et actions sur une commande
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_number>/cancel/', views.CancelOrderView.as_view(), name='cancel-order'),
    path('<str:order_number>/invoice/', views.DownloadInvoiceView.as_view(), name='download-invoice'),
    
    # Paiement
    path('<str:order_number>/initiate-payment/', 
         views.InitiatePaymentView.as_view(), 
         name='initiate-payment'),
    path('<str:order_number>/verify-payment/', 
         views.VerifyPaymentView.as_view(), 
         name='verify-payment'),
    
    # Mesures personnelles
    path('my-measurements/', views.MyMeasurementsView.as_view(), name='my-measurements'),
    
    # Dépenses utilisateur
    path('my-spend/', views.UserSpendView.as_view(), name='my-spend'),

    # Dashboard Stats
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
]