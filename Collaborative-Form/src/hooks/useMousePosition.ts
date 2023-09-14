import { useEffect, useState } from "react";

const DURATION = 30;

const throttle = (function () {
  let timeout: number | undefined;
  return function throttle(callback: () => void) {
    if (timeout === undefined) {
      callback();
      timeout = setTimeout(() => {
        // allow another call to be throttled
        timeout = undefined;
      }, DURATION);
    }
  };
})();

/**
 * Wraps callback in a function and throttles it.
 * @returns Wrapper function
 */
function throttlify<T extends (...args: any[]) => void>(callback: T) {
  return function throttlified(...args: Parameters<T>) {
    throttle(() => {
      callback(...args);
    });
  };
}

function createMousePosition(x: number, y: number) {
  return { x, y };
}

export default function useMouse() {
  const [mousePosition, setMousePosition] = useState(createMousePosition(0, 0));

  // i absolutely don't want to rerun this hook at any other time
  // than initial mount and last unmount
  useEffect(() => {
    const saveMousePosition = throttlify((event: MouseEvent) => {
      setMousePosition(createMousePosition(event.clientX, event.clientY));
    });

    document.addEventListener("mousemove", saveMousePosition);
    return () => {
      document.removeEventListener("mousemove", saveMousePosition);
    };
  }, [setMousePosition]);

  return mousePosition;
}
