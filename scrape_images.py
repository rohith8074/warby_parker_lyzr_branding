import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

products = [
    ("Alston", "Violetwood"),
    ("Kemper", "Blue Marblewood"),
    ("Dex", "Marine Teal"),
    ("Werner", "Rose Water"),
    ("Matilda", "Smoky Mauve"),
    ("Scully", "Rose Water")
]

results = {}

for name, color in products:
    query = f"Warby Parker {name} {color} glasses site:warbyparker.com"
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        
        links = re.findall(r'href="([^"]+warbyparker\.com/eyeglasses/[^"]+)"', html)
        if links:
            prod_url = links[0]
            if 'uddg=' in prod_url:
                prod_url = urllib.parse.unquote(prod_url.split('uddg=')[1].split('&')[0])
                
            print(f"Found product URL for {name}: {prod_url}")
            
            req2 = urllib.request.Request(prod_url, headers=headers)
            prod_html = urllib.request.urlopen(req2, context=ctx).read().decode('utf-8')
            
            imgs = re.findall(r'https://img\.warbyparker\.com/[^"\s\?]+(?:\?[^"\s]+)?', prod_html)
            
            valid_imgs = [img for img in imgs if 'width=' in img or 'quality=' in img]
            if valid_imgs:
                results[name] = valid_imgs[0]
                print(f"  -> Image: {valid_imgs[0]}")
            else:
                print(f"  -> No valid images found in HTML")
        else:
            print(f"No product URL found for {name}")
            
    except Exception as e:
        print(f"Error on {name}: {e}")

print("\n--- JSON RESULTS ---")
import json
print(json.dumps(results, indent=2))
