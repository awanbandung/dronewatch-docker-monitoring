import { useState, useEffect } from 'react'
import { api } from '@/lib/api.js'
import { normalizeDrone } from '@/lib/normalizeDrone.js'

export function useDrones() {
  const [drones, setDrones]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    api.drones()
      .then(data => { if (!cancelled) setDrones(data.map(normalizeDrone)) })
      .catch(e  => { if (!cancelled) setError(e.message) })
      .finally(()=> { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { drones, loading, error }
}
