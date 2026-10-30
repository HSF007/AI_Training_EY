
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CirclePlay, RotateCw } from "lucide-react";

import { getVideoBySlug } from "../services/api";
import { mapApiVideo } from "../services/videoAdapter";
import { useAppContext } from "../context/AppContext";

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function PlayerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    user,
    progressByVideo,
    saveProgress,
  } = useAppContext();

  const [video, setVideo] = useState(null);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      setLoading(true);
      setError(null);
      setVideo(null);

      try {
        const response = await getVideoBySlug(slug);
        const adapted = mapApiVideo(response);

        if (!cancelled) {
          setVideo(adapted);

          const saved =
            progressByVideo[adapted.id] ||
            (adapted.legacyId
              ? progressByVideo[adapted.legacyId]
              : null);

          setPosition(
            Math.min(
              adapted.durationSeconds,
              Math.max(0, saved?.positionSeconds ?? 0)
            )
          );
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

    loadVideo();

    return () => {
      cancelled = true;
    };
  }, [slug, retryKey]); // Load saved progress when the title changes.

  if (loading) {
    return (
      <main className="page-container catalogue-message" role="status">
        Loading title...
      </main>
    );
  }

  if (error || !video) {
    return (
      <main className="page-container empty-state">
        <h1>
          {error?.status === 404
            ? "Title not found"
            : "Unable to load title"}
        </h1>
        <p>{error?.message || "Please try again."}</p>

        {error?.status !== 404 && (
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

  
  async function handleSaveProgress(completed = false) {
    if (!user) {
      navigate("/auth", {
        state: {
          from: { pathname: `/watch/${video.slug}` },
        },
      });
      return;
    }

    const nextPosition = completed
      ? video.durationSeconds
      : position;

    setSaveError("");

    try {
      await saveProgress(
        video.id,
        nextPosition,
        video.durationSeconds,
        completed
      );

      setPosition(nextPosition);
    } catch (err) {
      setSaveError(
        err.message || "Unable to save viewing progress."
      );
    }
  }


  if (!video.playable) {
    return (
      <main className="player-page page-container">
        <Link to={`/title/${video.slug}`} className="back-link">
          <ArrowLeft size={17} />
          Back to details
        </Link>

        <div className="player-surface">
          <CirclePlay size={64} strokeWidth={1.2} />
          <h1>{video.title}</h1>
          <p>
            This title is published, but the API has not confirmed a
            ready streaming asset. Playback is unavailable until an
            asset is processed and marked ready.
          </p>
          <Link
            to={`/title/${video.slug}`}
            className="button button-secondary"
          >
            Return to details
          </Link>
        </div>
      </main>
    );
  }

  const percentage = Math.round(
    (position / video.durationSeconds) * 100
  );

  return (
    <main className="player-page page-container">
      <Link to={`/title/${video.slug}`} className="back-link">
        <ArrowLeft size={17} />
        Back to details
      </Link>

      <div className="player-surface">
        <CirclePlay size={64} strokeWidth={1.2} />
        <h1>{video.title}</h1>

        <p>
          Demo timeline only. The actual video transport and
          playback-session API have not been connected yet.
        </p>

        <div className="demo-player-controls">
          <label className="timeline-label" htmlFor="demo-timeline">
            Demo playback position
          </label>

          <input
            id="demo-timeline"
            type="range"
            min="0"
            max={video.durationSeconds}
            step="1"
            value={position}
            onChange={(event) =>
              setPosition(Number(event.target.value))
            }
          />

          <div className="timeline-times">
            <span>{formatTime(position)}</span>
            <span>{formatTime(video.durationSeconds)}</span>
          </div>

          <p className="timeline-percent">{percentage}% selected</p>
          {saveError && (
            <p className="auth-error" role="alert">
              {saveError}
            </p>
          )}

          {user ? (
            <div className="hero-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => handleSaveProgress(false)}
              >
                Save progress
              </button>

              <button
                type="button"
                className="button button-secondary"
                onClick={() => handleSaveProgress(true)}
              >
                Mark as completed
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              state={{
                from: { pathname: `/watch/${video.slug}` },
              }}
              className="button button-primary"
            >
              Sign in to save progress
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
