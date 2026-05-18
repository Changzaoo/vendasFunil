import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Seller } from '@/types'

const col = () => collection(db, 'sellers')

export type SellerInput = Omit<Seller, 'id' | 'createdAt'>

export function subscribeSellers(
  cb: (sellers: Seller[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(col(), orderBy('name', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Seller)))
  }, onError)
}

export async function createSeller(data: SellerInput): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateSeller(id: string, data: Partial<SellerInput>): Promise<void> {
  await updateDoc(doc(db, 'sellers', id), data)
}

export async function deleteSeller(id: string): Promise<void> {
  await deleteDoc(doc(db, 'sellers', id))
}
