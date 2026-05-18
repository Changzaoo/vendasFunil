import { useState, useEffect } from 'react'
import { subscribeSellers } from '@/services/sellers'
import type { Seller } from '@/types'

export function useSellers() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeSellers((data) => {
      setSellers(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { sellers, loading }
}
