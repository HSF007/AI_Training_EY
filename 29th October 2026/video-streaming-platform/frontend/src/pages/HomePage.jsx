
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Play,
  RotateCw,
} from "lucide-react";

import { listVideos } from "../services/api";
import { mapApiVideo } from "../services/videoAdapter";
import VideoCard from "../components/VideoCard";

const PAGE_SIZE = 8;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const rating = searchParams.get("content_rating") || "";

  const rawPage = Number(searchParams.get("page") || 1);
  const page =
    Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const [result, setResult] = useState({
    items: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogue() {
      setLoading(true);
      setError("");

      try {
        const response = await listVideos({
          q: query || undefined,
          genre: genre || undefined,
          year: year || undefined,
          content_rating: rating || undefined,
          page,
          page_size: PAGE_SIZE,
          sort: "release_year_desc",
        });

        if (!cancelled) {
          setResult({
            items: response.items.map(mapApiVideo),
            total: response.total,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load the catalogue. Check the API server."
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
  }, [query, genre, year, rating, page, retryKey]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.delete("page");
    setSearchParams(next);
  }

  function clearFilters() {
    const next = new URLSearchParams();

    if (query) {
      next.set("q", query);
    }

    setSearchParams(next);
  }

  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);

    document.getElementById("catalogue")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const hasFilters = Boolean(query || genre || year || rating);
  const featured = result.items.find((video) => video.featured)
    || result.items[0];

  const showHero =
    !loading &&
    !error &&
    !hasFilters &&
    page === 1 &&
    Boolean(featured);

  const totalPages = Math.max(
    1,
    Math.ceil(result.total / PAGE_SIZE)
  );

  return (
    <main>
      {showHero && (
        <section
          className="hero"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(9,11,17,.98) 0%, rgba(9,11,17,.78) 48%, rgba(9,11,17,.2) 100%), url("${featured.backdrop}")`,
          }}
        >
          <div className="hero-content">
            <span className="eyebrow">FEATURED TITLE</span>

            <h1>{featured.title}</h1>

            <div className="hero-meta">
              <span>{featured.releaseYear}</span>
              <span>{featured.duration}</span>
              <span>{featured.rating}</span>
            </div>

            <p className="hero-description">
              {featured.synopsis}
            </p>

            <div className="hero-actions">
              {featured.playable ? (
                <Link
                  to={`/watch/${featured.slug}`}
                  className="button button-primary"
                >
                  <Play size={18} fill="currentColor" />
                  Play
                </Link>
              ) : (
                <span className="availability-chip">
                  Playback not ready
                </span>
              )}

              <Link
                to={`/title/${featured.slug}`}
                className="button button-secondary"
              >
                <Info size={18} />
                More Info
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="catalogue page-container" id="catalogue">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {query ? "SEARCH RESULTS" : "YOUR NEXT FAVORITE"}
            </span>

            <h2>
              {query
                ? `Results for "${query}"`
                : "Explore the catalogue"}
            </h2>

            <p>
              {loading
                ? "Loading titles..."
                : `${result.total} ${
                    result.total === 1 ? "title" : "titles"
                  } found`}
            </p>
          </div>
        </div>

        <div className="catalogue-filters">
          <label>
            Genre
            <select
              value={genre}
              onChange={(event) =>
                updateFilter("genre", event.target.value)
              }
            >
              <option value="">All genres</option>
              <option value="adventure">Adventure</option>
              <option value="drama">Drama</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="documentary">Documentary</option>
              <option value="nature">Nature</option>
              <option value="thriller">Thriller</option>
              <option value="mystery">Mystery</option>
            </select>
          </label>

          <label>
            Release year
            <select
              value={year}
              onChange={(event) =>
                updateFilter("year", event.target.value)
              }
            >
              <option value="">All years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </label>

          <label>
            Content rating
            <select
              value={rating}
              onChange={(event) =>
                updateFilter("content_rating", event.target.value)
              }
            >
              <option value="">All ratings</option>
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
            </select>
          </label>

          {hasFilters && (
            <button
              type="button"
              className="filter-clear"
              onClick={clearFilters}
            >
              <ArrowLeft size={15} />
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div className="catalogue-message" role="status">
            Loading the catalogue from CineStream API...
          </div>
        )}

        {!loading && error && (
          <div className="catalogue-message catalogue-error" role="alert">
            <h3>We couldn't load the catalogue</h3>
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

        {!loading && !error && result.items.length > 0 && (
          <>
            <div className="video-grid">
              {result.items.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            <div className="catalogue-pagination">
              <button
                type="button"
                className="button button-secondary"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                className="button button-secondary"
                disabled={page >= totalPages}
                onClick={() => changePage(page + 1)}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {!loading && !error && result.items.length === 0 && (
          <div className="empty-state">
            <h3>No titles found</h3>
            <p>
              Try changing your search or clearing your filters.
            </p>
            <button
              type="button"
              className="button button-secondary"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
