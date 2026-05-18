import { useState, useEffect } from 'react'
import { subscribeSellers } from '@/services/sellers'
import type { Seller } from '@/types'

export function useSellers() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeSellers(
      (data) => { setSellers(data); setLoading(false) },
      (err) => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  return { sellers, loading, error }
}
