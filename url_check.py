import urllib.request
import re

url = "https://prophetiecouture.vercel.app/assets/index-B9gSexai.js"
print("Downloading JS...")
try:
    content = urllib.request.urlopen(url).read().decode('utf-8')
    print("127.0.0.1:8000 in JS?", "127.0.0.1:8000" in content)
    print("onrender.com in JS?", "onrender.com" in content)
    
    # Try finding typical API URLs
    urls = re.findall(r'https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?::\d+)?(?:/[a-zA-Z0-9./_-]+)?', content)
    backend_urls = [u for u in urls if 'w3.org' not in u and 'react.dev' not in u]
    print("Found potential URLs:", list(set(backend_urls[:50])))
except Exception as e:
    print("Error:", e)
