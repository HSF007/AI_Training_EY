import re

with open('./unstructured_data.txt', 'r') as f:
    data = f.read()

print(data)

print("\nTotal number of words are:", len(data.split()))

print("\nTotal number of lines are:", len(data.split('\n\n')))


print("\npresence of 'maintenance' in paragraph:")
if 'maintenance' in data:
    print("word 'maintenance' is present in paragraph")

count = 0
for word in data.split():
    if 'conveyor' == word.lower():
        count += 1
print("\nThe word 'conveyor' is present in paragraph total:", count, 'times.')

print("\nLines containing 'team':")
for line in data.split('\n\n'):
    if 'team' in line:
        print(line)

print("\nLines containing 'incident':")
for line in data.split('\n\n'):
    if 'incident' in line:
        print(line)

print("\nlines mentioning damaged components:")
for line in data.split('\n\n'):
    if 'damaged' in line:
        print(line)

with open('./lowercase_report.txt', 'w', encoding='utf-8') as f:
    f.write(data.lower())

print('\nShowing simple summary\n')
check = ['maintenance', 'injuries', 'inspection', 'replacement', 'operations']
found = {}
for i in check:
    found[i] = 0

clean_data = re.sub(r'[^\w\s]', '', data)
for word in clean_data.split():
    word = word
    if word in check and found[word] < 1:
        found[word] += 1
    if sum(found.values()) > 4:
        break

for i in found.keys():
    if found[i] == 1:
        print(f'{i} : Found')
    else:
        print(f'{i} : Not Found')