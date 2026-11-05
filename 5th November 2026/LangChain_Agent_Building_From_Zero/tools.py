
import json
from pathlib import Path
from langchain.tools import tool

FILE = Path(__file__).parent / "workshops.json"
COUPON_CODES = Path(__file__).parent / "coupons.json"


def get_workshops():
    return json.loads(FILE.read_text(encoding="utf-8"))


@tool
def search_workshops(keyword: str) -> str:
    """Search available workshops by title."""

    matches = [
        w for w in get_workshops()
        if keyword.lower() in w["title"].lower()
    ]

    return json.dumps(matches)


@tool
def calculate_workshop_fee(
    workshop_id: str,
    participants: int
) -> str:
    """Calculate the total fee for a workshop and participant count."""
    if participants < 1 or participants > 30:
        return "Participant count must be between 1 and 30."

    for workshop in get_workshops():

        if workshop["id"] == workshop_id:
            total = workshop["fee"] * participants

            return json.dumps({
                "workshop": workshop["title"],
                "participants": participants,
                "total_fee": total
            })

    return "Workshop not found."

@tool
def list_all_workshops(keyword: str) -> str:
    """Return the all wrokshops available."""
    return json.dumps(get_workshops())

@tool
def find_cheapest_workshop(keyword: str) -> str:
    """Find the chepest workshop currently available."""
    cheapest_fee = float('inf')
    result = None

    for workshop in get_workshops():
        if workshop['fee'] < cheapest_fee:
            result = workshop
            cheapest_fee = workshop['fee']
    
    if cheapest_fee == float('inf'):
        return "Workshop not found."
    
    return json.dumps({
        "workshop": result
    })

@tool
def apply_coupon(
    coupon: str,
    total_fee: int
) -> str:
    """Calculates the cost of course after applying coupon"""
    coupons = json.loads(COUPON_CODES.read_text(encoding="utf-8"))

    for code in coupons:
        if code['code'] == coupon:
            return json.dumps({
                "total_fee": total_fee - (total_fee * code['discount']/100),
                "discount": code['discount']
            })
    
    return "No such coupon code found or wrong coupon code."


if __name__ == "__main__":
    print(search_workshops.invoke({"keyword": "Python"}))

    print(calculate_workshop_fee.invoke({
        "workshop_id": "W101",
        "participants": 4
    }))

    print(list_all_workshops.invoke({"keyword": "All"}))

    print(find_cheapest_workshop.invoke({"keyword": "cheapest"}))

    print(apply_coupon.invoke({
        "coupon": "HSF007",
        "total_fee": 15000
    }))
