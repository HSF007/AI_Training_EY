import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import EventList from "./components/EventList";
import RegistrationList from "./components/RegistrationList";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Event Enrollment Manager</h1>

      <Navbar />

      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/registrations" element={<RegistrationList />} />
      </Routes>
    </div>
  );
}

export default App;