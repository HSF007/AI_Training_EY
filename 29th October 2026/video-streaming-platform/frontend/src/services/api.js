
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const TOKEN_KEY = "cinestream_access_token";

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const { auth = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  headers.set("Accept", "application/json");

  if (fetchOptions.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = auth ? getAccessToken() : null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  let payload = null;

  if (response.status !== 204) {
    try {
      payload = await response.json();
    } catch {
      // Keep the HTTP status if the response has no JSON body.
    }
  }

  if (response.status === 401 && token && auth) {
    window.dispatchEvent(new Event("cinestream:unauthorized"));
  }

  if (!response.ok) {
    const error = new Error(
      payload?.error?.message ||
        payload?.detail ||
        `Request failed (${response.status})`
    );

    error.status = response.status;
    error.payload = payload;

    throw error;
  }

  return payload;
}

// Authentication and account

export function registerAccount(data) {
  return request("/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
}

export function loginAccount(data) {
  return request("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
}

export function getProfile() {
  return request("/me");
}

export function updateProfile(data) {
  return request("/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Catalogue

export async function listVideos({
  q,
  genre,
  year,
  content_rating,
  page = 1,
  page_size = 20,
  sort = "release_year_desc",
} = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({
    q,
    genre,
    year,
    content_rating,
    page,
    page_size,
    sort,
  })) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  return request(`/videos?${params.toString()}`);
}

export function getVideoBySlug(slug) {
  return request(`/videos/${encodeURIComponent(slug)}`);
}

async function getAllPages(path) {
  const pageSize = 100;
  const items = [];
  let page = 1;
  let total = Infinity;

  while (items.length < total) {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });

    const result = await request(`${path}?${params.toString()}`);

    items.push(...result.items);
    total = result.total;

    if (result.items.length === 0 || items.length >= total) {
      break;
    }

    page += 1;
  }

  return items;
}

export function listAllVideos() {
  return getAllPages("/videos");
}

// Watchlist

export function getAllMyWatchlist() {
  return getAllPages("/me/watchlist");
}

export function addWatchlistItem(videoId) {
  return request(
    `/me/watchlist/${encodeURIComponent(videoId)}`,
    { method: "POST" }
  );
}

export function removeWatchlistItem(videoId) {
  return request(
    `/me/watchlist/${encodeURIComponent(videoId)}`,
    { method: "DELETE" }
  );
}

// Viewing progress

export function getAllMyProgress() {
  return getAllPages("/me/progress");
}

export function saveMyProgress(videoId, data) {
  return request(
    `/me/progress/${encodeURIComponent(videoId)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}
