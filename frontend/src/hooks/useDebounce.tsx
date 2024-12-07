import { useEffect } from "react"
import useTimeout from "./useTimeout"

export default function useDebounce(callback: () => void, delay: number, dependencies: []) {
  const { reset, clear } = useTimeout(callback, delay)
  useEffect(reset, [...dependencies, reset])
  useEffect(clear, [])
}

// primitive version
export function debounce(callback: any, wait: number = 1000) {
  let timeoutId: any = null;
  return (...args: any) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
    callback(...args);
    }, wait);
  };
}

export function throttle(callback: any, delay = 1000) {
  let shouldWait = false;
  return (...args: any) => {
    if (shouldWait) return;
    callback(...args);
    shouldWait = true;
    setTimeout(() => {
          shouldWait = false;
    }, delay);
  };
}