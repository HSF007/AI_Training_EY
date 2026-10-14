import re


with open("airport_operations_report.txt") as f:
    data = f.read()

print('Total words:', len(data.split()), 'Total lines:', len(data.split('\n\n')), 'Total characters:', len(data))

check = ['flight', 'runway', 'operations', 'reported']
count = {}
for item in check:
    count[item] = 0

clean_data = re.sub(r'[^\w\s]', '', data)
for words in clean_data.split():
    if words in count:
        count[words] += 1

for i in count:
    print(i, count[i])

for line in data.split('\n\n'):
    if 'runway' in line:
        print(line)

for line in data.split('\n\n'):
    if 'delay' in line or 'delayed' in line or 'delays' in line:
        print(line)

for line in data.split('\n\n'):
    if 'reported' in line:
        print(line)

check = ['emergency', 'inspection', 'weather', 'passengers', 'maintenance']
pres = {}
for item in check:
    pres[item] = 1

for word in clean_data.split():
    if word in pres and pres[word] > 0:
        pres[word] -= 1
    if sum(pres.values()) == 0:
        break

for item in pres:
    if pres[item] > 0:
        print(f'{item}: Not Found')
    else:
        print(f'{item}: Found')

dis = {'flight': 0, 'runaway': 0, 'operations': 0}
for word in clean_data.split():
    if word in dis:
        dis[word] += 1
print(dis)

long_line = ''
for line in data.split('\n\n'):
    if len(line) > len(long_line):
        long_line = line
print('Longest line in paragraph is:\n',long_line, '\nwith length of:',len(long_line))

useful_data = []
for line in data.split('\n\n'):
    if 'delay' in line or 'delayed' in line or 'delays' in line or 'weather' in line:
        useful_data.append(line)

with open('filtered_airport_report.txt', 'w') as f:
    f.write('\n'.join(useful_data))