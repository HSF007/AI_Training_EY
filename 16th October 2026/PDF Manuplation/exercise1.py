import fitz


# 1. Open the PDF.
doc = fitz.open("EY_Digital_PDF_Practice.pdf")

# 2. Print the number of pages.
print("Pages:", len(doc))

# 3. Extract and print text from page 1.
page1_text = doc[0].get_text()
print(page1_text)

# 4. Extract text from all pages
all_page = []
for page in doc:
    all_page.append(page.get_text())
all_page_text = '\n'.join(all_page)

# 5. Search whether the word maintenance appears.
if 'maintenance' in all_page_text:
    print('Word "maintenance" is present')
else:
    print('Word "maintenance" is not present')

# 6. Count how many times V303 appears.
count = 0
for word in all_page_text.split():
    if word == 'V303':
        count += 1
print(count)

# 7. Extract only page 2 text.
page2_text = doc[1].get_text()

# 8. Save all extracted text into digital_pdf_text.txt .
with open('digital_pdf_text.txt', 'w', encoding='utf-8') as f:
    f.write(all_page_text)
