from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
import pyotp

User = get_user_model()

class AuthenticationFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            nom='Test',
            prenom='User'
        )
        self.login_url = reverse('login')
        self.forgot_password_url = reverse('forgot-password')
        self.verify_otp_url = reverse('verify-otp')
        self.reset_password_url = reverse('reset-password')
        self.setup_2fa_url = reverse('2fa-setup')
        self.verify_2fa_url = reverse('2fa-verify')
        self.disable_2fa_url = reverse('2fa-disable')

    def test_forgot_password_flow(self):
        # 1. Request Password Reset
        response = self.client.post(self.forgot_password_url, {'email': 'test@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.verification_token)
        otp = self.user.verification_token
        
        # 2. Verify OTP
        response = self.client.post(self.verify_otp_url, {'email': 'test@example.com', 'otp': otp})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Reset Password
        new_password = 'newpassword123'
        response = self.client.post(self.reset_password_url, {
            'email': 'test@example.com',
            'otp': otp,
            'new_password': new_password,
            'confirm_password': new_password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Login with new password
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': new_password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_2fa_flow(self):
        # Login first
        self.client.force_authenticate(user=self.user)
        
        # 1. Setup 2FA
        response = self.client.post(self.setup_2fa_url, {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('secret', response.data)
        self.assertIn('qr_code', response.data)
        
        secret = response.data['secret']
        self.user.refresh_from_db()
        self.assertEqual(self.user.two_factor_secret, secret)
        
        # 2. Verify 2FA to enable
        totp = pyotp.TOTP(secret)
        otp = totp.now()
        
        response = self.client.post(self.verify_2fa_url, {'otp': otp})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.two_factor_enabled)
        
        # 3. Logout and Try Login
        self.client.logout()
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK) # In my implementation it returns 200 with 2fa_required=True
        self.assertTrue(response.data.get('2fa_required'))
        
        # 4. Login with 2FA OTP
        otp_login = totp.now()
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'password123',
            'otp': otp_login
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        
        # 5. Disable 2FA
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.disable_2fa_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertFalse(self.user.two_factor_enabled)

