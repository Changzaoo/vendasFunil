import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Conversation, Message } from '@/types'

const col = () => collection(db, 'conversations')
const msgCol = (convId: string) => collection(db, 'conversations', convId, 'messages')

export type ConversationInput = Omit<Conversation, 'id' | 'createdAt' | 'lastMessageAt' | 'unread' | 'lastMessage'>

export function subscribeConversations(
  cb: (list: Conversation[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(col(), orderBy('lastMessageAt', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation)))
  }, onError)
}

export function subscribeMessages(
  convId: string,
  cb: (msgs: Message[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(msgCol(convId), orderBy('timestamp', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)))
  }, onError)
}

export async function createConversation(data: ConversationInput): Promise<string> {
  const ref = await addDoc(col(), {
    ...data,
    unread: 0,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function sendMessage(convId: string, content: string, role: 'user' | 'contact'): Promise<void> {
  await addDoc(msgCol(convId), { role, content, timestamp: serverTimestamp() })
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
    ...(role === 'contact' ? { unread: 1 } : { unread: 0 }),
  })
}

export async function markRead(convId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', convId), { unread: 0 })
}

export async function updateConversationStatus(
  convId: string,
  status: Conversation['status'],
): Promise<void> {
  await updateDoc(doc(db, 'conversations', convId), { status })
}

export async function deleteConversation(id: string): Promise<void> {
  await deleteDoc(doc(db, 'conversations', id))
}
