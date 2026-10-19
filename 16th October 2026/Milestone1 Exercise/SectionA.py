import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json


# A1. Load urban_mobility.csv into a Pandas DataFrame and display the first five rows.
df = pd.read_csv('./urban_mobility.csv')
print(df.head(5))

# A2. Create a new column Energy_Per_Km = Energy_Used_kWh / Distance_Km.
df['Energy_Per_Km'] = df['Energy_Used_kWh']/df['Distance_Km']

# A3. Display only Electric Van records where Maintenance_Flag is Yes.
print(df[df['Maintenance_Flag'] == 'Yes'])

# A4. Group by Vehicle_Type and display average Distance_Km and total Trips_Count.
vehicle_type_group = df.groupby('Vehicle_Type')
print('Average Distance_Km:', vehicle_type_group['Distance_Km'].mean())
print('Total Trips_Count:', vehicle_type_group['Trips_Count'].sum())

# A5. Use NumPy to calculate the mean, maximum and minimum of Energy_Used_kWh.
print('Energy_Used_kWh mean:', np.mean(df['Energy_Used_kWh']))
print('Energy_Used_kWh Maximum:', np.max(df['Energy_Used_kWh']))
print('Energy_Used_kWh Minimum:', np.min(df['Energy_Used_kWh']))

# A6. Create one bar chart showing average Energy_Used_kWh by Vehicle_Type using Matplotlib or Seaborn.
plt.figure(figsize=(5, 6))
average_energy = vehicle_type_group['Energy_Used_kWh'].mean()
average_energy.plot(kind='bar')
plt.title('Average Energy Used by Vehicle Type')
plt.xlabel('Vehicle Type')
plt.ylabel('Energy Used (kWh)')
plt.show()

# A7. Load equipment_events.json and print event_id, asset type, site and severity for every event.
with open('./equipment_events.json') as f:
    events = json.load(f)

for event in events:
    print('event_id:', event['event_id'],
          ', asset type:', event['asset']['type'],
          ', asset side:', event['asset']['site'],
          ', severity:', event['severity']
          )

# A8. Display JSON records with temperature above 70. If actions is missing, display 'No actions recorded'.
for event in events:
    event_temp = event.get('temperature', "No actions recorded")
    if event_temp == "No actions recorded":
        print(f'Event Id: {event['event_id']},', event_temp)
    elif event_temp > 70:
        print(f'Event Id: {event["event_id"]}, Temperature: ', event_temp)
    else:
        continue

# A9. Read coastal_monitoring_log.txt and count total words and the number of times the word 'inspection' appears.
with open('./coastal_monitoring_log.txt') as f:
    monitoring_logs = f.read()

words = monitoring_logs.split()
print("Total word count in text data:", len(words))
inspect_count = 0
for word in words:
    if word == 'inspection':
        inspect_count += 1
print("The number of times the word 'inspection' appears is:", inspect_count)

# A10. Print only the lines containing either 'boardwalk', 'maintenance', or 'wind'.
print("Lines containing either 'boardwalk', 'maintenance', or 'wind' are:")
for line in monitoring_logs:
    if 'boardwalk' or 'maintenance' or 'wind' in line:
        print(line)









