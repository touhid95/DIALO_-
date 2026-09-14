import requests

q = """[out:json][timeout:25];
(
  node["amenity"="dentist"](30.1,-97.9,30.5,-97.6);
  node["healthcare"="dentist"](30.1,-97.9,30.5,-97.6);
  node["amenity"="clinic"](30.1,-97.9,30.5,-97.6);
);
out body 25;
"""

try:
    headers = {"User-Agent": "LeadIntel/1.0 (contact@leadintel.app)"}
    res = requests.post("https://overpass-api.de/api/interpreter", data={"data": q}, headers=headers, timeout=25)
    print("Status:", res.status_code)
    elements = res.json().get("elements", [])
    print(f"Total elements found: {len(elements)}")
    for el in elements[:10]:
        tags = el.get("tags", {})
        name = tags.get("name")
        website = tags.get("website") or tags.get("contact:website")
        phone = tags.get("phone") or tags.get("contact:phone")
        if name:
            print(f"Name: {name} | Website: {website} | Phone: {phone}")
except Exception as e:
    print("Error:", e)
