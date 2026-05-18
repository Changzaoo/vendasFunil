import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Contact } from '@/types'

const col = () => collection(db, 'contacts')

export type ContactInput = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>

export function subscribeContacts(
  cb: (contacts: Contact[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(col(), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contact)))
  }, onError)
}

export async function createContact(data: ContactInput): Promise<string> {
  const ref = await addDoc(col(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateContact(id: string, data: Partial<ContactInput>): Promise<void> {
  await updateDoc(doc(db, 'contacts', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id))
}
