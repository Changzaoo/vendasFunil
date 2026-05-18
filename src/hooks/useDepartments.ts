import { useState, useEffect } from 'react'
import { subscribeDepartments } from '@/services/departments'
import type { Department } from '@/types'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeDepartments((data) => {
      setDepartments(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { departments, loading }
}
