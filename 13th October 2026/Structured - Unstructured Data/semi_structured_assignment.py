import json
import pandas as pd

with open('./semi_structured_data.json') as f:
    data = json.load(f)

print("\nAll incident Id's")
for inc in data:
    print(inc['incident_id'])

print('\nLocation of each incident')
for inc in data:
    print('Incident Id:', inc['incident_id'], 'Location:', inc['location']['city'])

print('\nIncident where severity is high')
for inc in data:
    if inc['severity'].lower() == 'high':
        print(inc['incident_id'])

print('\nIncident where category is safety')
for inc in data:
    if inc['category'].lower() == 'safety':
        print(inc['incident_id'])

print('\n action in incident')
for inc in data:
    print(inc.get('actions', 'No actions recorded'))

temp_count = {}
for inc in data:
    if inc['severity'].lower() not in temp_count:
        temp_count[inc['severity'].lower()] = 0
    temp_count[inc['severity'].lower()] += 1
print('\nCount of each severity')
for sere in temp_count:
    print(sere, temp_count[sere])

# adding new field status open to all incidents
for inc in data:
    inc['status'] = "Open"

with open('./updated_incidents.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

df = pd.json_normalize(data)

print()
print(df[["incident_id", "severity", "category", "location.city", "location.site"]])