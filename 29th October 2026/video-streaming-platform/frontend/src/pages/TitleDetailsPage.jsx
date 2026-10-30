
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Play, RotateCw } from "lucide-react";

import { getVideoBySlug } from "../services/api";
import { mapApiVideo } from "../services/videoAdapter";
import { useAppContext } from "../context/AppContext";

export default function TitleDetailsPage() {
  const { slug } = useParams();

  const {
    user,
    watchlistIds,
    addToWatchlist,
    removeFromWatchlist,
  } = useAppContext();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTitle() {
      setLoading(true);
      setError(null);
      setVideo(null);

      try {
        const response = await getVideoBySlug(slug);

        if (!cancelled) {
          setVideo(mapApiVideo(response));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTitle();

    return () => {
      cancelled = true;
    };
  }, [slug, retryKey]);

  if (loading) {
    return (
      <main className="page-container catalogue-message" role="status">
        Loading title details...
      </main>
    );
  }

  if (error || !video) {
    const notFound = error?.status === 404;

    return (
      <main className="page-container empty-state">
        <h1>{notFound ? "Title not found" : "Unable to load title"}</h1>

        <p>
          {notFound
            ? "This title is unavailable or is no longer published."
            : error?.message || "The API could not load this title."}
        </p>

        {!notFound && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setRetryKey((value) => value + 1)}
          >
            <RotateCw size={16} />
            Try again
          </button>
        )}

        <Link to="/" className="button button-primary">
          Back to browse
        </Link>
      </main>
    );
  }

  const isInWatchlist =
    watchlistIds.includes(video.id) ||
    (video.legacyId && watchlistIds.includes(video.legacyId));

  
  async function handleWatchlistAction() {
    setWatchlistBusy(true);
    setWatchlistError("");

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(video.id);
      } else {
        await addToWatchlist(video.id);
      }
    } catch (err) {
      setWatchlistError(
        err.message || "Unable to update your watchlist."
      );
    } finally {
      setWatchlistBusy(false);
    }
  }


  return (
    <main className="details-page">
      <div
        className="details-backdrop"
        style={{ backgroundImage: `url("${video.backdrop}")` }}
      />

      <section className="details-content page-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={17} />
          Back to browse
        </Link>

        <div className="details-layout">
          <img
            className="details-poster"
            src={video.poster}
            alt={`${video.title} poster`}
          />

          <div className="details-copy">
            <span className="eyebrow">TITLE DETAILS</span>
            <h1>{video.title}</h1>

            <div className="hero-meta">
              <span>{video.releaseYear}</span>
              <span>{video.duration}</span>
              <span>{video.rating}</span>
            </div>

            <div className="genre-list">
              {video.genres.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <p className="details-synopsis">{video.synopsis}</p>

            <div className="hero-actions">
              {video.playable ? (
                <Link
                  to={`/watch/${video.slug}`}
                  className="button button-primary"
                >
                  <Play size={18} fill="currentColor" />
                  Play
                </Link>
              ) : (
                <span className="availability-chip">
                  Streaming asset not ready
                </span>
              )}

              {user ? (
                
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleWatchlistAction}
                  disabled={watchlistBusy}
                >
                  <Bookmark size={18} />
                  {watchlistBusy
                    ? "Saving..."
                    : isInWatchlist
                      ? "Remove from Watchlist"
                      : "Add to Watchlist"}
                </button>

              ) : (
                <Link
                  to="/auth"
                  state={{
                    from: {
                      pathname: `/title/${video.slug}`,
                    },
                  }}
                  className="button button-secondary"
                >
                  <Bookmark size={18} />
                  Sign in to save
                </Link>
              )}
            </div>
            {watchlistError && (
              <p className="auth-error" role="alert">
                {watchlistError}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
