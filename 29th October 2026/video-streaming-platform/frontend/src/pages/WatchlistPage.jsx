
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, RotateCw } from "lucide-react";

import { getAllMyWatchlist } from "../services/api";
import { mapApiVideo } from "../services/videoAdapter";
import { useAppContext } from "../context/AppContext";
import VideoCard from "../components/VideoCard";

export default function WatchlistPage() {
  const { removeFromWatchlist } = useAppContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadWatchlist() {
      setLoading(true);
      setError("");

      try {
        const videos = await getAllMyWatchlist();

        if (!cancelled) {
          setItems(videos.map(mapApiVideo));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your watchlist.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWatchlist();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  async function handleRemove(video) {
    setError("");
    setRemovingId(video.id);

    try {
      await removeFromWatchlist(video.id);

      setItems((current) =>
        current.filter((item) => item.id !== video.id)
      );
    } catch (err) {
      setError(err.message || "Unable to remove this title.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="page-container library-page">
      <div className="library-heading">
        <div>
          <span className="eyebrow">YOUR PERSONAL LIBRARY</span>
          <h1>My Watchlist</h1>
          <p>Your saved titles, loaded from your account.</p>
        </div>

        <Bookmark size={34} />
      </div>

      {loading && (
        <div className="catalogue-message" role="status">
          Loading your watchlist...
        </div>
      )}

      {!loading && error && (
        <div className="catalogue-message catalogue-error" role="alert">
          <p>{error}</p>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setRetryKey((value) => value + 1)}
          >
            <RotateCw size={16} />
            Reload watchlist
          </button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="video-grid">
          {items.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onRemove={handleRemove}
              removeBusy={removingId === video.id}
            />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state library-empty">
          <Bookmark size={42} />
          <h2>Your watchlist is empty</h2>
          <p>
            Open a title and add it to your watchlist to save it here.
          </p>

          <Link to="/" className="button button-primary">
            Explore catalogue
          </Link>
        </div>
      )}
    </main>
  );
}
