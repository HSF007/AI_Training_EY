import { useAuth } from "../context/AuthContext";

export default function About() {
    const { user } = useAuth();
    return (
        <div className="container">
            <h1>About Page</h1>

            <p>This is a protected About Page.</p>
            <p>Welcome, {user.email}</p>

            <p>Only logged-in user can see this page.</p>
        </div>
    )
}