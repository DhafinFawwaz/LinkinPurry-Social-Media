import useAsync from "./useAsync"

const DEFAULT_OPTIONS = {
  headers: { "Content-Type": "application/json" },
}

function getApiUrl() {
    if(!window.location.port) return import.meta.env.VITE_API_URL;
    const hostName = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostName}:4000`
}

export default function useFetchApi<T>(path: string, minimumWaitDuration: number = 0, options: RequestInit = {}, dependencies = []) {
  const url = getApiUrl() + path;
  // TODO: read cookie and add to headers
  return useAsync<T>(async () => {
    const startTime = Date.now();
    const res = await fetch(url, { ...DEFAULT_OPTIONS, ...options });
    
    let elapsedTime = undefined;
    if(minimumWaitDuration !== 0) {
        elapsedTime = Date.now() - startTime;
    }
    if (res.ok) {
      if (!elapsedTime) return res.json() as T;
      const remainingWaitTime = Math.max(minimumWaitDuration - elapsedTime, 0);
      await new Promise((resolve) => setTimeout(resolve, remainingWaitTime));
      return res.json() as T;
    }

    const errorJson = await res.json();
    return Promise.reject(errorJson);
  }, dependencies);

}