from duckduckgo_search import DDGS
import json

products = [
    ("Alston", "Violetwood"),
    ("Kemper", "Blue Marblewood"),
    ("Dex", "Marine Teal"),
    ("Werner", "Rose Water"),
    ("Matilda", "Smoky Mauve"),
    ("Scully", "Rose Water")
]

results = {}

with DDGS() as ddgs:
    for name, color in products:
        query = f"Warby Parker {name} {color} glasses"
        print(f"Searching for {query}")
        images = list(ddgs.images(query, max_results=3))
        if images:
            results[name] = images[0]['image']
            print(f"  Found: {images[0]['image']}")
        else:
            print("  No image found.")

print("\n--- RESULTS ---")
print(json.dumps(results, indent=2))
