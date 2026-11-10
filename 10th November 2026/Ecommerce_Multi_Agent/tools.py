import json
from pathlib import Path

from agent_framework import tool

DATA_FILE = Path(__file__).parent / "products.json"

def load_products():
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


@tool(approval_mode="never_require")
def search_products(keyword: str) -> str:
    """Find the product based on name or category"""

    print(f"[TOOL CALLED] search_products: {keyword}")
    matches  = []

    for product in load_products():
        if keyword.lower() in product["name"].lower() or keyword.lower() in product["category"].lower():
            matches.append(product)
        
    if len(matches) < 0:
        return f"No product found using {keyword}"
    
    return json.dumps(matches)

@tool(approval_mode="never_require")
def calculate_order_total(product_id:str, quantity: int) -> str:
    """Calculate total price of order."""
    print(f"[TOOL CALLED] calculate_order_total: {product_id}, {quantity}")

    if not 1 < quantity <= 20:
        return "Quantity must be between 1 and 20."
    
    for p in load_products():
        if p["id"].uppper() == product_id.upper():
            if quantity <= p["stock"]:
                return json.dumps({
                    "product": p["name"],
                    "stock": p["stock"],
                    "total_price": p["price_inr"]*quantity,
                    "product_price": p["price_inr"],
                    "currency": "INR",
                    "category": p["category"],
                    "rating": p["rating"]
                })
            else:
                return f"Total quantity of peoduct in stock is {p["stock"]}. Enter quantity grater than quantity in stock."
    
    return f"No such product with product id {product_id} found."
