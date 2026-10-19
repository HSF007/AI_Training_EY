from email import message
from functools import total_ordering

from pydantic import BaseModel, ValidationError, Field
from typing import Literal
import json
import logging


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler('registrations.log', encoding='utf-8')
    ]
)

# 1. Create a Pydantic model called Registration.
# 2. Add field:
# 3. Validate that age must be at least 18.
# 4. Validate that amount must be greater than 0.
# 5. Restrict ticket_type:
class Registration(BaseModel):
    registration_id: str
    name: str
    email: str
    age: int = Field(gt=18)
    ticket_type: Literal["Standard", "Premium", "VIP"]
    amount: float = Field(gt=0)

# 6. Load registrations.json and validate each record using the Pydantic model.
try:
    with open('./registrations.json') as f:
        regi_data = json.load(f)
except FileNotFoundError:
    print("File registrations.json not found")
    logging.error("File registrations.json not found")
except json.JSONDecodeError as error:
    print("Invalid JSON")

valid_registrations = []
invalid_records = 0
total_records = len(regi_data)

for data in regi_data:
    try:
        registration = Registration(**data)
        valid_registrations.append(registration)
        logging.info(f'Registration {registration.registration_id} validated successfully')
        if registration.ticket_type == "VIP":
            logging.warning(f'Registration Id: {registration.registration_id} ticket type is VIP')
    except ValidationError as error:
        invalid_records += 1
        logging.error(f'Registration {data['registration_id']} failed validation')
        if data['ticket_type'] == "VIP":
            logging.warning(f'Registration {data['registration_id']} failed validation with ticket type is VIP')
        # print(error)
print("Valid registration recorded")

# 7. Print only the valid registrations.
print('\nValid registration records:')
for registration in valid_registrations:
    print(registration)

# 8. Catch Pydantic validation errors and print a simple message showing:
# registration ID
# field with error
# error message
for data in regi_data:
    try:
        registration = Registration(**data)
        print(f'Registration: {registration.registration_id} is valid')
    except ValidationError as error:
        reg_id = data['registration_id']
        for detail in error.errors():
            field = '.'.join(str(x) for x in detail['loc'])
            message = detail['msg']
            print(f'Registration: {reg_id}')
            print(f'field with error: {field}')
            print(f'error message: {message}')

# 9. Serialize one valid Pydantic object into a Python dictionary.
registration_dict = valid_registrations[0].model_dump()
print(registration_dict)

# 10. Serialize one valid object into JSON.
registration_json = valid_registrations[0].model_dump_json()
print(registration_json)

# 11. Save all valid registrations into: valid_registrations.json
with open('valid_registrations.json', 'w', encoding='utf-8') as f:
    json.dump([r.model_dump(mode='json') for r in valid_registrations], f, indent=4)

# 20. At the end, print a summary:
print('\nTotal records:', total_records)
print('Valid records:', total_records - invalid_records)
print('Invalid records:', invalid_records)