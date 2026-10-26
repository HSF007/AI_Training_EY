import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();


    return (
        <div className="container">
            <h1>Private Dashboard</h1>

            <p>Welcome, {user.email}!</p>
            <p>You can see this page because you logged in.</p>

            <button onClick={logout}>Logout</button>
        </div>
    );
}