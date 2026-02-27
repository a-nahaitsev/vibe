import { type RefObject, useEffect } from "react";

/**
 * Calls `onClickOutside` when a mousedown or pointerdown happens outside `ref.current`.
 * @param ref - Ref to the element (e.g. container of trigger + popover).
 * @param onClickOutside - Callback when click is outside the ref element.
 * @param enabled - When false, the listener is not attached. Use to avoid listening when popover is closed.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: () => void,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) return;

    const handle = (e: MouseEvent | PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handle, true);
    document.addEventListener("pointerdown", handle, true);
    return () => {
      document.removeEventListener("mousedown", handle, true);
      document.removeEventListener("pointerdown", handle, true);
    };
  }, [ref, onClickOutside, enabled]);
}
