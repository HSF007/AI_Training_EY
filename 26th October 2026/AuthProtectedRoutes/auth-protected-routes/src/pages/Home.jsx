import { Link } from "react-router-dom";


export default function Home() {
    return (
        <div className="container">
            <h1>Authentication Demo</h1>
            <p>Learn How react protects private pages.</p>

            <nav>
                <Link to={"/login"}>Login</Link>
                { "|" }
                <Link to={"/dashboard"}>Open Dashboard</Link>
                { "|" }
                <Link to={"/about"}>About</Link>
            </nav>
        </div>
    );
}