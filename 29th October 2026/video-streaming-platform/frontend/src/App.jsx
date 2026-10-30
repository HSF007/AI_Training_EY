import {
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import TitleDetailsPage from "./pages/TitleDetailsPage";
import PlayerPage from "./pages/PlayerPage";
import AuthPage from "./pages/AuthPage";
import WatchlistPage from "./pages/WatchlistPage";
import ContinueWatchingPage from "./pages/ContinueWatchingPage";

import { useAppContext } from "./context/AppContext";


function RequireAuth({ children }) {
  const { user, authReady } = useAppContext();
  const location = useLocation();

  if (!authReady) {
    return (
      <main className="page-container catalogue-message" role="status">
        Restoring your session...
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}


function NotFoundPage() {
  return (
    <main className="page-container empty-state">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>

      <Link to="/" className="button button-primary">
        Return home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/title/:slug"
          element={<TitleDetailsPage />}
        />

        <Route
          path="/watch/:slug"
          element={<PlayerPage />}
        />

        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/watchlist"
          element={
            <RequireAuth>
              <WatchlistPage />
            </RequireAuth>
          }
        />

        <Route
          path="/continue-watching"
          element={
            <RequireAuth>
              <ContinueWatchingPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <footer className="site-footer">
        <p>CINESTREAM</p>
        <span>
          On-demand entertainment · Frontend prototype
        </span>
      </footer>
    </>
  );
}
