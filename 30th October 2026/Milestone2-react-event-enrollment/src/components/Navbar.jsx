import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <Link to="/">Events</Link> |{" "}
            <Link to="/registrations">Registrations</Link>
        </nav>
    )
}

export default Navbar;