import useAsync from "./useAsync"

const DEFAULT_OPTIONS = {
  headers: { "content-type": "application/json" },
}

export default function useFetch<T>(url: string, options = {}, dependencies = []) {
  return useAsync(() => {
    return fetch(url, { ...DEFAULT_OPTIONS, ...options }).then(res => {
      if (res.ok) return res.json() as T
      return res.json().then(json => Promise.reject(json)) as Promise<T>
    })
  }, dependencies)
}