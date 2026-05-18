import { useState, useEffect } from 'react'
import { subscribeContacts } from '@/services/contacts'
import type { Contact } from '@/types'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeContacts((data) => {
      setContacts(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { contacts, loading, error }
}
