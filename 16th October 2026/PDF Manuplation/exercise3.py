# Use EY_Scanned_PDF_OCR_Practice.pdf
# python -m pip install pymupdf pytesseract pillow


import fitz
import pytesseract
from PIL import Image

# 1. Open the scanned PDF using PyMuPDF.
doc = fitz.open("EY_Scanned_PDF_OCR_Practice.pdf")

# 2. Convert the PDF page into an image
page = doc[0]
pix = page.get_pixmap()
pix.save("scanned_page.png")

# 3. Run Tesseract OCR on the image.
image = Image.open("scanned_page.png")
text = pytesseract.image_to_string(image)

# 4. Print the extracted text.
print(text)

# 5. Check whether Forklift FL-17 was detected.
if 'Forklift FL-17' in text:
    print('"Forklift FL-17" was detected')
else:
    print('"Forklift FL-17" was not detected')

# 6. Search for the word injuries.
if 'injuries' in text:
    print('"injuries" was found in PDF')
else:
    print('"injuries" was not found in PDF')

# 7. Extract lines mentioning inspection.
print('\nExtract lines mentioning inspection:')
for line in text.split('\n'):
    if 'inspection' in line:
        print(line)

# 8. Save the OCR output into ocr_result.txt
with open('ocr_result.txt', 'w', encoding='utf-8') as f:
    f.write(text)

# 9. Count the number of times inspection appears.
count = 0
for word in text.split():
    if 'inspection' == word.lower():
        count += 1
print('\nNumber of times word "inspection" was found in PDF:', count)

# 10. Print all lines containing Loading Bay.
print('\nExtract lines containing "Loading Bay":')
for line in text.split('\n'):
    if 'Loading Bay' in line:
        print(line)