with open("./wildlife_report.txt") as f:
    text = f.read()

print("number of words are:", len(text.split()))

if "elephant" in text:
    print("elephant present in report")

print("Number of times elephant appeared in report:", text.count("elephant"))

with open("./wildlife_report.txt") as f:
    text1 = f.readlines()

lines = text.split("\n")
print("Lines in which 'trail' is present:")
for line in lines:
    if "trail" in line:
        print(line)

print("Lines in which 'animal' is present:")
for line in lines:
    if "animal" in line:
        print(line)