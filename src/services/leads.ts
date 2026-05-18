import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Lead } from '@/types'

const col = () => collection(db, 'leads')

export type LeadInput = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>

export function subscribeLeads(
  cb: (leads: Lead[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(col(), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)))
  }, onError)
}

export async function createLead(data: LeadInput): Promise<string> {
  const ref = await addDoc(col(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateLead(id: string, data: Partial<LeadInput>): Promise<void> {
  await updateDoc(doc(db, 'leads', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, 'leads', id))
}
