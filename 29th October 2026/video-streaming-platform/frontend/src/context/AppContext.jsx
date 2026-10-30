
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  addWatchlistItem,
  clearAccessToken,
  getAccessToken,
  getAllMyProgress,
  getAllMyWatchlist,
  getProfile,
  removeWatchlistItem,
  saveMyProgress,
  setAccessToken,
} from "../services/api";

const AppContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    displayName: user.display_name ?? user.displayName ?? "",
  };
}

function toProgressMap(items) {
  const result = {};

  for (const item of items) {
    const videoId = item.video.id;

    result[videoId] = {
      videoId,
      positionSeconds: item.position_seconds,
      durationSeconds: item.duration_seconds_snapshot,
      completed: item.completed,
      updatedAt: item.last_watched_at,
    };
  }

  return result;
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [progressByVideo, setProgressByVideo] = useState({});
  const [authReady, setAuthReady] = useState(false);

  const refreshLibrary = useCallback(async () => {
    const [watchlist, progress] = await Promise.all([
      getAllMyWatchlist(),
      getAllMyProgress(),
    ]);

    setWatchlistIds(watchlist.map((video) => video.id));
    setProgressByVideo(toProgressMap(progress));
  }, []);

  const clearLocalSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setWatchlistIds([]);
    setProgressByVideo({});
  }, []);

  useEffect(() => {
    let active = true;

    function handleUnauthorized() {
      clearLocalSession();
      setAuthReady(true);
    }

    window.addEventListener(
      "cinestream:unauthorized",
      handleUnauthorized
    );

    async function restoreSession() {
      if (!getAccessToken()) {
        setAuthReady(true);
        return;
      }

      try {
        const profile = await getProfile();

        if (!active) return;

        setUser(normalizeUser(profile));

        try {
          await refreshLibrary();
        } catch {
          if (active) {
            setWatchlistIds([]);
            setProgressByVideo({});
          }
        }
      } catch {
        if (active) {
          clearLocalSession();
        }
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;

      window.removeEventListener(
        "cinestream:unauthorized",
        handleUnauthorized
      );
    };
  }, [clearLocalSession, refreshLibrary]);

  async function signIn(authResponse) {
    setAccessToken(authResponse.access_token);
    setUser(normalizeUser(authResponse.user));
    setAuthReady(true);

    try {
      await refreshLibrary();
    } catch {
      setWatchlistIds([]);
      setProgressByVideo({});
    }
  }

  function signOut() {
    clearLocalSession();
    setAuthReady(true);
  }

  async function addToWatchlist(videoId) {
    if (!user) {
      throw new Error("Please sign in to manage your watchlist.");
    }

    await addWatchlistItem(videoId);

    setWatchlistIds((current) =>
      current.includes(videoId)
        ? current
        : [...current, videoId]
    );
  }

  async function removeFromWatchlist(videoId) {
    if (!user) {
      throw new Error("Please sign in to manage your watchlist.");
    }

    await removeWatchlistItem(videoId);

    setWatchlistIds((current) =>
      current.filter((id) => id !== videoId)
    );
  }

  async function saveProgress(
    videoId,
    positionSeconds,
    durationSeconds,
    forceCompleted = false
  ) {
    if (!user) {
      throw new Error("Please sign in to save viewing progress.");
    }

    const duration = Math.floor(Number(durationSeconds));
    const rawPosition = Number(positionSeconds);

    if (
      !Number.isSafeInteger(duration) ||
      duration <= 0 ||
      !Number.isFinite(rawPosition)
    ) {
      throw new Error("Invalid playback progress.");
    }

    const position = forceCompleted
      ? duration
      : Math.min(
          duration,
          Math.max(0, Math.floor(rawPosition))
        );

    const result = await saveMyProgress(videoId, {
      position_seconds: position,
      duration_seconds_snapshot: duration,
      completed: forceCompleted,
    });

    const savedProgress = {
      videoId: result.video.id,
      positionSeconds: result.position_seconds,
      durationSeconds: result.duration_seconds_snapshot,
      completed: result.completed,
      updatedAt: result.last_watched_at,
    };

    setProgressByVideo((current) => ({
      ...current,
      [result.video.id]: savedProgress,
    }));

    return savedProgress;
  }

  return (
    <AppContext.Provider
      value={{
        user,
        authReady,
        watchlistIds,
        progressByVideo,
        signIn,
        signOut,
        addToWatchlist,
        removeFromWatchlist,
        saveProgress,
        refreshLibrary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used within AppProvider"
    );
  }

  return context;
}
