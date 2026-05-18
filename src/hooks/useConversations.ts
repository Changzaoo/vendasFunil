import { useState, useEffect } from 'react'
import { subscribeConversations, subscribeMessages } from '@/services/conversations'
import type { Conversation, Message } from '@/types'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeConversations(
      (data) => { setConversations(data); setLoading(false) },
      (err) => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  return { conversations, loading, error }
}

export function useMessages(convId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!convId) return
    const unsub = subscribeMessages(
      convId,
      (data) => { setMessages(data); setLoading(false) },
      (err) => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [convId])

  return { messages, loading, error }
}
