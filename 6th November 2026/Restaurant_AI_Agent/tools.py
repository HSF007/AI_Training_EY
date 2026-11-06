import json
from pathlib import Path
from langchain.tools import tool


FILE = Path(__file__).parent / "restaurants.json"


def get_restaurants():
    return json.loads(FILE.read_text(encoding="utf-8"))


@tool
def search_restaurants(keyword: str) -> str:
    """Search available restaurants using cuisine or restorant name."""
    matches = []
    for w in get_restaurants():
        if keyword.lower() in w['name'].lower() or keyword.lower() in w['cuisine'].lower():
            matches.append(w)
    return json.dumps(matches)


@tool
def calculate_dining_cost(
    restaurant_id: str,
    total_guests: int
) -> str:
    """Calculate the total fee for a restaurant and guests count"""

    if total_guests < 1 or total_guests > 20:
        return "Guest count must be between 1 and 20."
    
    for restaurant in get_restaurants():
        if restaurant["id"] == restaurant_id:
            if restaurant["available_seats"] < total_guests:
                return f"Only {restaurant["available_seats"]} seats available."
            
            total = restaurant["price_per_person"]*total_guests

            return json.dumps({
                "restaurant": restaurant["name"],
                "total_guests": total_guests,
                "total_cost": total
            })
        
    return "No such restaurant Fount in database."

if __name__ == "__main__":
    print(search_restaurants.invoke({"keyword": "Indian"}))

    print(calculate_dining_cost.invoke({
        "restaurant_id": "R107",
        "total_guests": 4
    }))