import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Department } from '@/types'

const col = () => collection(db, 'departments')

export type DepartmentInput = Omit<Department, 'id' | 'createdAt'>

export function subscribeDepartments(
  cb: (list: Department[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(col(), orderBy('name', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Department)))
  }, onError)
}

export async function createDepartment(data: DepartmentInput): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateDepartment(id: string, data: Partial<DepartmentInput>): Promise<void> {
  await updateDoc(doc(db, 'departments', id), data)
}

export async function deleteDepartment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'departments', id))
}
