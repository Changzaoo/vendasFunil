export const ADMIN_EMAIL = 'vinicinhos324@gmail.com'

export function isAdmin(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}

export async function createFirebaseUser(email: string, password: string): Promise<void> {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    },
  )
  if (!res.ok) {
    const data = await res.json()
    const msg: string = data.error?.message ?? ''
    if (msg.includes('EMAIL_EXISTS')) throw new Error('Este e-mail já está cadastrado.')
    if (msg.includes('INVALID_EMAIL')) throw new Error('E-mail inválido.')
    if (msg.includes('WEAK_PASSWORD')) throw new Error('A senha deve ter pelo menos 6 caracteres.')
    throw new Error('Erro ao criar usuário. Tente novamente.')
  }
}
