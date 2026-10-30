
import { videos as demoVideos } from "../data/videos";

export function formatDuration(totalSeconds) {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function mapApiVideo(video) {
  const fallback = demoVideos.find(
    (item) => item.slug === video.slug
  );

  return {
    id: video.id,
    legacyId: fallback?.id ?? null,
    slug: video.slug,
    title: video.title,
    synopsis: video.synopsis,
    releaseYear: video.release_year,
    durationSeconds: video.duration_seconds,
    duration: formatDuration(video.duration_seconds),
    genres: video.genres || [],
    rating: video.content_rating,
    poster:
      video.poster_url ||
      fallback?.poster ||
      demoVideos[0]?.poster ||
      "",
    backdrop:
      video.backdrop_url ||
      fallback?.backdrop ||
      fallback?.poster ||
      demoVideos[0]?.backdrop ||
      "",
    playable: Boolean(video.playable),
    featured: Boolean(fallback?.featured),
  };
}
