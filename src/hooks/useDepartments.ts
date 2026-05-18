import { useState, useEffect } from 'react'
import { subscribeDepartments } from '@/services/departments'
import type { Department } from '@/types'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeDepartments(
      (data) => { setDepartments(data); setLoading(false) },
      (err) => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  return { departments, loading, error }
}
