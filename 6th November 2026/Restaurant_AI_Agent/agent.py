import os
from dotenv import load_dotenv

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, ToolMessage
from langgraph.checkpoint.memory import InMemorySaver

from guardrails import contains_pii, clean_output, validate_input
from tools import search_restaurants, calculate_dining_cost


load_dotenv()

model = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("BASE_URL"),
    model=os.getenv("OPENAI_MODEL", "nvidia/nemotron-3.5-super-vl:free"),
    temperature=0
)

agent = create_agent(
    model=model,
    tools=[search_restaurants, calculate_dining_cost],
    system_prompt="""
        You are a restaurant reservation assistant.

        DOMAIN RESTRICTIONS:
        - Only handle restaurant-related queries.
        - You can search restaurants, provide restaurant details,
        calculate dining costs, and answer reservation-related questions.
        - Politely reject unrelated questions about programming,
        politics, entertainment, general knowledge, etc.
        - Do not answer unrelated questions even if the user insists.

        CONVERSATION CONTEXT:
        - Understand follow-up messages using previous conversation history.
        - Messages such as "yes", "no", "6 people", and "that one"
        should be interpreted in the context of the previous conversation.
        - Do not reject short messages if they are relevant follow-ups.

        ACCURACY:
        - Never invent restaurant names, prices, locations, or seat availability.
        - Only use information returned by the available tools.
        - If information is unavailable, clearly say so.

        BOOKING RULES:
        - Guest count must be between 1 and 20.
        - Never claim a booking is confirmed unless a booking tool
        actually confirms it.

        PRIVACY:
        - Never expose personal email addresses or phone numbers.
    """,
    checkpointer=InMemorySaver()
)


if __name__ == "__main__":
    thread_number = 1
    previous_count = 0

    print("AI Restaurant Reservation Assistant")
    print("Type /new for a new conversation")
    print("Type exit to quit")

    while True:
        question = input("\nYou: ").strip()

        is_valid, error = validate_input(question)

        if not is_valid:
            print("Agent:", error)
            continue

        if contains_pii(question):
            print("PII detected. Please remove personal contact details.")
            continue

        if question.lower() in ["exit", "quit"]:
            print("\nAgent: Goodbye! Have a great day!")
            break
        
        if question.lower() == "/new":
            thread_number += 1
            previous_count = 0
            print("New conversation started.")
            continue
        
        if not question:
            continue
        
        config = {
            "configurable":{
                "thread_id": f"restaurant-{thread_number}"
            }
        }

        try:
            result = agent.invoke(
                {
                    "messages": [
                        {"role": "user", "content": question}
                    ]
                },
                config=config
            )

            messages = result["messages"]
            new_messages = messages[previous_count:]
            previous_count = len(messages)

            for message in new_messages:
                if isinstance(message, AIMessage):
                    for call in message.tool_calls:
                        print("[TOOL]:", call["name"])
                        print("Arguments:", call["args"])
                
                if isinstance(message, ToolMessage):
                    print("[TOOL RESULT]:", message.content)
            
            print("\nAgent:", clean_output(messages[-1].content))
        
        except Exception as error:
            print("Error:", clean_output(error))