
# Event Enrollment Manager

## Project Description
Event Enrollment Manager using React.js web application that allows users to browse upcoming events, register for events, view registrations and cancel registrations.

## Technologies Used
- React.js
- Vite
- React Router DOM
- Context API
- useState and useEffect Hooks
- localStorage
- CSS

## Project Structure
```text
src/
    component/
        Navbar.jsx
        EventCard.jsx
        EventList.jsx
        RegistrationForm.jsx
        RegistrationList.jsx
    contex/
        RegistrationContext.jsx
    App.jsx
    App.css
    main.jsx
    events.js
```

## Installation and Setup

### 1. Install npm if not installed
```bash
npm install
```

### 2. Install React Router
```bash
npm install react-router-dom
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Open the application
Open the local URL displayed in the terminal.
Usually it's ```http://localhost:5174/```

## How the Application Works

### Events Page
Users can view all available events, search by event title, filter by category and register for events.

### Registrations Page
Users can view their existing registrations and cancel a registration when required.

### Available Seats
Available seats are calculated by subtracting the number of active registrations from the total event capacity.

## Validation
- Name and email are required.
- Email format is validated.
- Duplicate registrations for the same event are not allowed.
- Fully booked events cannot accept new registrations.

## Testing
The application can be tested by:
1. Browsing all six events.
2. Searching and filtering events.
3. Registering with valid details.
4. Testing empty and invalid form inputs.
5. Trying duplicate registrations.
6. Checking fully booked events.
7. Viewing and cancelling registrations.
8. Refreshing the browser to check data persistence.

## Limitations
- No backend or database is used.
- Data is stored in browser localStorage.
- Event information is fixed.
