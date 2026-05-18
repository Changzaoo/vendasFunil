import { useState, useEffect } from 'react'
import { subscribeLabels } from '@/services/labels'
import type { Label } from '@/types'

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeLabels((data) => {
      setLabels(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { labels, loading }
}
