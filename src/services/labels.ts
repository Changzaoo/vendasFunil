import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Label } from '@/types'

const col = () => collection(db, 'labels')

export type LabelInput = Omit<Label, 'id' | 'createdAt'>

export function subscribeLabels(cb: (list: Label[]) => void): Unsubscribe {
  const q = query(col(), orderBy('name', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Label)))
  })
}

export async function createLabel(data: LabelInput): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateLabel(id: string, data: Partial<LabelInput>): Promise<void> {
  await updateDoc(doc(db, 'labels', id), data)
}

export async function deleteLabel(id: string): Promise<void> {
  await deleteDoc(doc(db, 'labels', id))
}
