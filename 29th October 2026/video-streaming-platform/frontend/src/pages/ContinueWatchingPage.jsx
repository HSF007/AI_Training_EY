
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, RotateCw } from "lucide-react";

import { listAllVideos } from "../services/api";
import { mapApiVideo } from "../services/videoAdapter";
import { useAppContext } from "../context/AppContext";
import VideoCard from "../components/VideoCard";

export default function ContinueWatchingPage() {
  const { progressByVideo } = useAppContext();

  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogue() {
      setLoading(true);
      setError("");

      try {
        const videos = await listAllVideos();

        if (!cancelled) {
          setCatalogue(videos.map(mapApiVideo));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load viewing history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalogue();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const items = Object.values(progressByVideo)
    .filter((progress) => !progress.completed)
    .map((progress) => {
      const video = catalogue.find(
        (item) => item.id === progress.videoId
      );

      if (!video) return null;

      const percent =
        progress.durationSeconds > 0
          ? Math.min(
              100,
              Math.round(
                (progress.positionSeconds /
                  progress.durationSeconds) *
                  100
              )
            )
          : 0;

      return {
        video,
        percent,
        updatedAt: progress.updatedAt,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );

  return (
    <main className="page-container library-page">
      <div className="library-heading">
        <div>
          <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
          <h1>Continue Watching</h1>
          <p>Your saved, unfinished titles.</p>
        </div>

        <Play size={34} />
      </div>

      {loading && (
        <div className="catalogue-message" role="status">
          Loading catalogue...
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
            Try again
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="video-grid">
          {items.map(({ video, percent }) => (
            <VideoCard
              key={video.id}
              video={video}
              progress={percent}
            />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state library-empty">
          <Play size={42} />
          <h2>Nothing to continue yet</h2>
          <p>
            Save viewing progress on a title to see it here.
          </p>

          <Link to="/" className="button button-primary">
            Explore catalogue
          </Link>
        </div>
      )}
    </main>
  );
}
