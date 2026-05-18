import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const u = auth.currentUser
    if (!u?.email) throw new Error('Não autenticado.')
    const credential = EmailAuthProvider.credential(u.email, currentPassword)
    await reauthenticateWithCredential(u, credential)
    await updatePassword(u, newPassword)
  }

  return { user, loading, login, logout, changePassword }
}
