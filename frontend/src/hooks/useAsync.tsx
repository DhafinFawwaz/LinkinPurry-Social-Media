import { useCallback, useEffect, useState } from "react"

export default function useAsync<T>(callback: () => Promise<any>, callOnMount: boolean = true, dependencies: any[] = []) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>()
  const [value, setValue] = useState<T>()

  const recall = useCallback(() => {
    setLoading(true)
    setError(undefined)
    setValue(undefined)
    callback()
      .then(setValue)
      .catch(setError)
      .finally(() => setLoading(false))
  }, dependencies)

  useEffect(() => {
    if(callOnMount) recall()
  }, [recall, callOnMount])

  return { loading, error, value, recall, setValue }
}