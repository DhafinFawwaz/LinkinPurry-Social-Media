import useAsync from "./useAsync"

const DEFAULT_OPTIONS = {
  headers: { "content-type": "application/json" },
}

export function getApiUrl() {
    if(!window.location.port) return import.meta.env.VITE_API_URL;
    const hostName = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostName}:3000`
}

function getCookie(key: string) {
  const b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

export async function fetchApi(path: string, options: RequestInit = {}) {
    // const token = getCookie("token");
    if(options.headers && !("content-type" in options.headers)) (options.headers as any)["content-type"] = "application/json";
    if(options.headers && ((options.headers as any)["content-type"] == "multipart/form-data")) delete (options.headers as any)["content-type"]; // weird that multipart/form-data needs to be removed if we need to use it. for some reason we need to let it hanle FormData automatically
    // if(token) options.headers = { ...options.headers, "Authorization": `Bearer ${token}` };
    // else if(options.headers)  delete options.headers["Authorization" as keyof HeadersInit]; // Very weird that the authorization stays in the headers. so gotta delete it
    const url = getApiUrl() + path;
    options.credentials = "include";
    // console.log(options.headers)
    const res = await fetch(url, { ...DEFAULT_OPTIONS, ...options });
    // if(res.status === 401) {
    //     if(window.location.pathname !== "/login") window.location.href = "/login";
    // }
    return res;
}

async function wait(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}

export type UseFetchApiReturn<T> = {
  loading: boolean,
  error: boolean | undefined,
  value: T | undefined,
  recall: () => void,
  setValue: React.Dispatch<React.SetStateAction<T | undefined>>
}
export default function useFetchApi<T>(path: string, minimumWaitDuration: number = 0, callOnMount: boolean = true, options: RequestInit = {}, dependencies: any[] = []): UseFetchApiReturn<T> {
  return useAsync<T>(async () => {
    const startTime = Date.now();
    const res = await fetchApi(path, options);
    
    let elapsedTime = undefined;
    if(minimumWaitDuration !== 0) {
        elapsedTime = Date.now() - startTime;
    }

    const resJson = await res.json();
    if (res.ok) {
      if (!elapsedTime) return resJson;
      const remainingWaitTime = Math.max(minimumWaitDuration - elapsedTime, 0);
      await wait(remainingWaitTime);
      return resJson;
    }
    
    if(!elapsedTime) return Promise.reject(resJson);
    const remainingWaitTime = Math.max(minimumWaitDuration - elapsedTime, 0);
    await wait(remainingWaitTime);
    return Promise.reject(resJson);
  }, callOnMount, dependencies);

}