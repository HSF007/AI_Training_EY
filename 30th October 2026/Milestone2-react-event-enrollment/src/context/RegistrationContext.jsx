import { createContext, useContext, useState, useEffect } from "react";

const RegistrationContext = createContext();

export function RegistrationProvider({ children }) {
  const [registrations, setRegistrations] = useState(
    JSON.parse(localStorage.getItem("registrations")) || []
  );

  useEffect(() => {
    localStorage.setItem("registrations", JSON.stringify(registrations));
  }, [registrations]);

  return (
    <RegistrationContext.Provider value={{ registrations, setRegistrations }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  return useContext(RegistrationContext);
}