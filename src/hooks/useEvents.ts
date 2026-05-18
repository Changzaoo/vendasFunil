import { useState, useEffect } from 'react'
import { subscribeEvents } from '@/services/events'
import type { CalendarEvent } from '@/types'

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeEvents((data) => {
      setEvents(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { events, loading }
}
