# python -m pip install pypdf

from pypdf import PdfReader

# 1. Open the PDF using PdfReader .
reader = PdfReader("EY_Digital_PDF_Practice.pdf")

# 2. Print the number of pages.
print("Pages:", len(reader.pages))

# 3. Extract text from the first page.
page1_text = reader.pages[0].extract_text()
print(page1_text)

# 4. Extract text from the second page.
page2_text = reader.pages[1].extract_text()
print(page2_text)

# 5. Combine text from both pages into one string.
both_page_text = page1_text + page2_text
print(both_page_text)

# 6. Check whether NorthStar Maintenance exists in the PDF.
if 'NorthStar Maintenance' in both_page_text:
    print('Word "NorthStar Maintenance" is present')
else:
    print('Word "NorthStar Maintenance" is not present')

# 7. Find the number of occurrences of the word vendor.
count = 0
for word in both_page_text.split():
    if word.lower() == 'vendor':
        count += 1
print('Number of times word "vendor" present in PDF:', count)

# 8. Save the extracted content into pypdf_output.txt
with open('pypdf_output.txt', 'w', encoding='utf-8') as f:
    f.write(both_page_text)