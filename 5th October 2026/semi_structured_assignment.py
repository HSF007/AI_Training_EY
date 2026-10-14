import json

# Load JSON
with open('./festival_events.json') as json_file:
    events = json.load(json_file)

print("Name of every event:")
for event in events:
    print(event["name"])

print("\nCity of each event:")
for event in events:
    print(event["location"]["city"])

print("\nEvent with more than 700 visitors:")
for event in events:
    if event["visitors"] > 700:
        print(event["name"])

print("\nDisplay features:")
for event in events:
    print(event.get("features", "No features listed"))

import pandas as pd
print("\nPandas DataFrame:")
df = pd.json_normalize(events)
print(df)