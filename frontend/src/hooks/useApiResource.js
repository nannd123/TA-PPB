import { useCallback, useEffect, useState } from 'react'
import { getApiError } from '../utils/apiError.js'

export default function useApiResource(loader, resourceKey) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({
    key: null,
    revision: -1,
    data: null,
    error: null,
  })

  useEffect(() => {
    let active = true

    Promise.resolve()
      .then(loader)
      .then((data) => {
        if (active) {
          setState({ key: resourceKey, revision, data, error: null })
        }
      })
      .catch((error) => {
        if (active) {
          setState({ key: resourceKey, revision, data: null, error: getApiError(error) })
        }
      })

    return () => {
      active = false
    }
  }, [loader, resourceKey, revision])

  const retry = useCallback(() => {
    setRevision((value) => value + 1)
  }, [])

  const current = state.key === resourceKey && state.revision === revision

  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: !current,
    retry,
  }
}
