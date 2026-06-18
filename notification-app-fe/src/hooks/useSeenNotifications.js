import { useEffect, useState } from "react";

const STORAGE_KEY = "campus-notification-desk.seen";

function readSeenIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useSeenNotifications() {
  const [seenIds, setSeenIds] = useState(readSeenIds);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seenIds));
  }, [seenIds]);

  const markSeen = (notificationId) => {
    setSeenIds((currentIds) => {
      if (!notificationId || currentIds.includes(notificationId)) {
        return currentIds;
      }

      return [...currentIds, notificationId];
    });
  };

  const isSeen = (notificationId) => seenIds.includes(notificationId);

  return {
    seenIds,
    isSeen,
    markSeen,
  };
}
