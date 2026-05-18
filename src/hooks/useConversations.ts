import { useState, useEffect } from 'react'
import { subscribeConversations, subscribeMessages } from '@/services/conversations'
import type { Conversation, Message } from '@/types'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeConversations((data) => {
      setConversations(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { conversations, loading }
}

export function useMessages(convId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!convId) return
    const unsub = subscribeMessages(convId, (data) => {
      setMessages(data)
      setLoading(false)
    })
    return unsub
  }, [convId])

  return { messages, loading }
}
