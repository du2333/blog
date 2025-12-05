import React, { useCallback, useRef } from "react";

interface UseLongPressOptions {
  delay?: number;
}

export const useLongPress = (
  onLongPress: (e: React.MouseEvent | React.TouchEvent) => void,
  onClick: (e: React.MouseEvent | React.TouchEvent) => void,
  { delay = 500 }: UseLongPressOptions = {}
) => {
  const timeout = useRef<number | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isLongPress.current = false;
      timeout.current = window.setTimeout(() => {
        isLongPress.current = true;
        onLongPress(e);
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (e: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }

      if (shouldTriggerClick && !isLongPress.current) {
        onClick(e);
      }
    },
    [onClick]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
    onTouchMove: (e: React.TouchEvent) => clear(e, false),
  };
};
