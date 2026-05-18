import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CalendarEvent } from '@/types'

const col = () => collection(db, 'events')

export type EventInput = Omit<CalendarEvent, 'id' | 'createdAt'>

export function subscribeEvents(
  cb: (list: CalendarEvent[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(col(), orderBy('datetime', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent)))
  }, onError)
}

export async function createEvent(data: EventInput): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateEvent(id: string, data: Partial<EventInput>): Promise<void> {
  await updateDoc(doc(db, 'events', id), data)
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id))
}
