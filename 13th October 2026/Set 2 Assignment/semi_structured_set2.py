import json
import pdb

with open('./smart_home_devices.json') as f:
    data = json.load(f)

for device in data:
    print('Device Id:', device['device_id'], 'Device type:', device['device_type'], 'Room:', device['room'])

for device in data:
    if device['status'] == 'Active':
        print(device)

for device in data:
    if device['metrics']['battery'] < 60:
        print(device)

for device in data:
    if 'temperature' in device['metrics']:
        print('device id:', device['device_id'], 'temperature:', device['metrics']['temperature'])

for device in data:
    if 'alerts' in device:
        print('device id:', device['device_id'], 'alerts:', device['alerts'])

count = {}
for device in data:
    if device['device_type'] not in count:
        count[device['device_type']] = 0
    count[device['device_type']] += 1

for device in count:
    print(f'{device}: {count[device]}')

for device in data:
    if device['metrics']['battery'] >= 70:
        device['health'] = "Good"
    elif 50 < device['metrics']['battery'] < 69:
        device['health'] = "Moderate"
    else:
        device['health'] = "Low"


with open('device_health_report.json', 'w', encoding='utf-8') as f:
    json.dump(data, f)

import pandas as pd
df = pd.json_normalize(data)
print(df[['device_id', 'device_type', 'room', 'status', 'metrics.battery', 'health']])

print(df[df['metrics.battery'] < 70])