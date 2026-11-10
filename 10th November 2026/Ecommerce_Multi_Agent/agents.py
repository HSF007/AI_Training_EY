import os

from agent_framework import Agent
from agent_framework.openai import OpenAIChatCompletionClient

from tools import search_products, calculate_order_total


def create_agents():

    client = OpenAIChatCompletionClient(
        model=os.getenv("OPENAI_CHAT_MODEL"),
        api_key=os.getenv('OPENAI_API_KEY'),
        base_url=os.getenv('BASE_URL')
    )

    # Agent 1: Inventory Agent
    inventory_agent = Agent(
        client = client,
        name="InventoryAgent",
        instructions=(
            "You are a product search specialist. "
            "Use search_products to find products "
            "matching the user's requested keyword. "
            "List the matching product IDs, prices, stocks and rating. "
            "Do not calculate total product price."
        ),
        tools=[search_products]
    )

    # Agent 2: Pricing Agent
    pricing_agent = Agent(
        client=client,
        name="PricingAgent",
        instructions=(
            "You are a product pricing specialist. "
            "Read the previous search results and user request. "
            "Use calculate_order_total for each matching workshop "
            "using the requested number of quantity. "
            "Compare calculated total with the customer's budget"
            "Report the verified totals. "
            "Never invent prices."
        ),
        tools=[calculate_order_total]
    )

    # Agetn 3: Recommendation Agent
    recommendation_agent = Agent(
        client=client,
        name="RecommendationAgent",
        instructions=(
            "You are a product recommendation specialist. "
            "Read the search and price results. "
            "Review the inventory and pricing results. "
            "Recommend the highest-rated product that meets "
            "the customer's budget and quantity requirements. "
            "If ratings are equal, prefer the lower-cost option. "
            "Provide a short explanation for the recommendation. "
            "Do not recommend unavailable products. "
            "Use only verified workshop data and totals."
        )
    )

    return inventory_agent, pricing_agent, recommendation_agent