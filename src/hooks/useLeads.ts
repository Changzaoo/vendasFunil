import { useState, useEffect } from 'react'
import { subscribeLeads } from '@/services/leads'
import type { Lead } from '@/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeLeads((data) => {
      setLeads(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { leads, loading }
}
