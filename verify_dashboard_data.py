import requests
import json
import os
import sys

# Configuration
BASE_URL = "http://localhost:8000/api"
EMAIL = "client@test.com"
PASSWORD = "TestPassword123!"

def print_section(title):
    print("\n" + "="*50)
    print(f" {title}")
    print("="*50)

def verify_dashboard_data():
    session = requests.Session()
    session.verify = False 

    # 1. Login
    print_section("1. LOGIN")
    login_url = f"{BASE_URL}/users/login/"
    payload = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    try:
        response = session.post(login_url, json=payload)
        if response.status_code == 200:
            print("✅ Login Successful")
            data = response.json()
            token = data.get('token')
            user = data.get('user')
            print(f"User: {user.get('prenom')} {user.get('nom')} ({user.get('email')})")
            print(f"Role: {user.get('role')}")
            
            headers = {
                'Authorization': f'Bearer {token}'
            }
        else:
            print(f"❌ Login Failed: {response.status_code}")
            print(response.text)
            
            # Try to register if login failed
            print("\nAttempting Registration...")
            register_url = f"{BASE_URL}/users/register/"
            reg_payload = {
                "email": EMAIL,
                "password": PASSWORD,
                "confirm_password": PASSWORD,
                "nom": "Test",
                "prenom": "Client",
                "role": "CLIENT",
                "telephone": "+237600000000"
            }
            reg_response = session.post(register_url, json=reg_payload)
            if reg_response.status_code == 201:
                 print("✅ Registration Successful")
                 headers = {'Authorization': f"Bearer {reg_response.json().get('token')}"}
            else:
                 print(f"❌ Registration Failed: {reg_response.status_code}")
                 print(reg_response.text)
                 return

    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return

    # 2. Fetch Orders
    print_section("2. FETCH ORDERS")
    orders_url = f"{BASE_URL}/orders/" # Assuming the URL structure, might be /orders/my-orders/ depending on urls.py
    
    # Try multiple common endpoints just in case
    endpoints = [
        f"{BASE_URL}/orders/my-orders/",
        f"{BASE_URL}/orders/"
    ]
    
    orders_found = False
    for url in endpoints:
        print(f"Trying {url}...")
        resp = session.get(url, headers=headers)
        if resp.status_code == 200:
            orders = resp.json()
            # Handle pagination
            if isinstance(orders, dict) and 'results' in orders:
                orders = orders['results']
            
            print(f"✅ Orders Fetched: {len(orders)} orders found")
            if len(orders) > 0:
                print(f"Sample Order: {orders[0].get('order_number')} - {orders[0].get('status')}")
            orders_found = True
            break
        elif resp.status_code == 404:
             print("Endpoint not found (404)")
        else:
            print(f"❌ Failed: {resp.status_code}")
            print(resp.text)

    # 3. Fetch Announcements
    print_section("3. FETCH ANNOUNCEMENTS")
    ann_url = f"{BASE_URL}/communications/announcements/"
    resp = session.get(ann_url, headers=headers)
    
    if resp.status_code == 200:
        anns = resp.json()
        if isinstance(anns, dict) and 'results' in anns:
            anns = anns['results']
        print(f"✅ Announcements Fetched: {len(anns)} found")
        for ann in anns[:3]:
            print(f"- {ann.get('title')} (Public: {ann.get('is_public')}, Target: {ann.get('target_role')})")
    else:
        print(f"❌ Failed to fetch announcements: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    verify_dashboard_data()
