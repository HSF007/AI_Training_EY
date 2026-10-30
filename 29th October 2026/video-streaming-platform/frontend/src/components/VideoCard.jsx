
import { Link } from "react-router-dom";
import { Play, X } from "lucide-react";

export default function VideoCard({
  video,
  progress,
  onRemove,
  removeBusy = false,
}) {
  const isResuming = progress !== undefined;

  return (
    <article className="video-card">
      <Link
        to={
          isResuming
            ? `/watch/${video.slug}`
            : `/title/${video.slug}`
        }
        className="video-card-link"
        aria-label={
          isResuming
            ? `Continue watching ${video.title}`
            : `View details for ${video.title}`
        }
      >
        <div className="video-poster">
          <img
            src={video.poster}
            alt={`${video.title} poster`}
            loading="lazy"
          />

          <span className="poster-play" aria-hidden="true">
            <Play size={22} fill="currentColor" />
          </span>

          <span className="poster-rating">{video.rating}</span>

          {isResuming && (
            <div
              className="poster-progress-track"
              role="progressbar"
              aria-label={`${video.title} progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="video-card-info">
          <h3>{video.title}</h3>

          <p>
            {video.releaseYear} <span>·</span> {video.duration}
          </p>

          <div className="genre-list">
            {video.genres.slice(0, 2).map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        </div>
      </Link>

      {onRemove && (
        <button
          type="button"
          className="video-card-remove"
          disabled={removeBusy}
          onClick={() => onRemove(video)}
        >
          <X size={15} />
          {removeBusy ? "Removing..." : "Remove"}
        </button>
      )}
    </article>
  );
}
