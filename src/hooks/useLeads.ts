import { useState, useEffect } from 'react'
import { subscribeLeads } from '@/services/leads'
import type { Lead } from '@/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeLeads(
      (data) => { setLeads(data); setLoading(false) },
      (err) => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  return { leads, loading, error }
}
