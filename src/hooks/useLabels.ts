import { useState, useEffect } from 'react'
import { subscribeLabels } from '@/services/labels'
import type { Label } from '@/types'

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeLabels(
      (data) => { setLabels(data); setLoading(false) },
      (err) => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  return { labels, loading, error }
}
