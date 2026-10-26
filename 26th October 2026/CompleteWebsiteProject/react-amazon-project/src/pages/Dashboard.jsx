import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  return <main className="container page-content"><h1>Dashboard</h1><p>Welcome, {user?.email}.</p></main>;
}
