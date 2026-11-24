import { useEffect, useRef } from "react";

export const REALTIME_WS_EVENT = "lw:ws-event";

export interface RealtimeEventDetail {
  event: string;
  payload?: unknown;
}

export function emitRealtimeEvent(event: string, payload?: unknown): void {
  if (typeof window === "undefined" || !event) return;
  window.dispatchEvent(
    new CustomEvent<RealtimeEventDetail>(REALTIME_WS_EVENT, {
      detail: { event, payload },
    })
  );
}

export function useRealtimeEvents(
  events: string[],
  handler: (detail: RealtimeEventDetail) => void,
  options?: { syncOnVisible?: boolean }
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const eventsKey = events.join("|");
  const syncOnVisible = options?.syncOnVisible !== false;

  useEffect(() => {
    const allowed = new Set(eventsKey ? eventsKey.split("|") : []);

    const onWsEvent = (ev: Event) => {
      const custom = ev as CustomEvent<RealtimeEventDetail>;
      const detail = custom.detail;
      if (!detail || !detail.event) return;
      if (allowed.has(detail.event) || allowed.has("*")) {
        handlerRef.current(detail);
      }
    };

    const onVisibilityChange = () => {
      if (syncOnVisible && document.visibilityState === "visible") {
        handlerRef.current({ event: "tab:visible" });
      }
    };

    window.addEventListener(REALTIME_WS_EVENT, onWsEvent as EventListener);
    if (syncOnVisible) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      window.removeEventListener(REALTIME_WS_EVENT, onWsEvent as EventListener);
      if (syncOnVisible) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [eventsKey, syncOnVisible]);
}
