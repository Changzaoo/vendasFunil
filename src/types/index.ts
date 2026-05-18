import type { Timestamp } from 'firebase/firestore'

export type Contact = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  status: 'active' | 'inactive' | 'lead'
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Conversation = {
  id: string
  contactId: string
  contactName: string
  channel: 'whatsapp' | 'email' | 'phone' | 'chat'
  lastMessage: string
  lastMessageAt: Timestamp
  unread: number
  status: 'open' | 'resolved' | 'pending'
  createdAt: Timestamp
}

export type Message = {
  id: string
  role: 'user' | 'contact'
  content: string
  timestamp: Timestamp
}

export type Lead = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  value: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  assignedTo: string
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Seller = {
  id: string
  name: string
  email: string
  phone: string
  department: string
  role: string
  target: number
  createdAt: Timestamp
}

export type Department = {
  id: string
  name: string
  color: string
  createdAt: Timestamp
}

export type Label = {
  id: string
  name: string
  color: string
  createdAt: Timestamp
}

export type CalendarEvent = {
  id: string
  title: string
  company: string
  datetime: Timestamp
  duration: string
  type: 'call' | 'meeting' | 'demo' | 'internal'
  attendees: string[]
  createdAt: Timestamp
}

export const stageLabels: Record<Lead['stage'], string> = {
  prospecting: 'Prospecção',
  qualification: 'Qualificação',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed_won: 'Ganho',
  closed_lost: 'Perdido',
}

export const stageColors: Record<Lead['stage'], string> = {
  prospecting: 'badge-gray',
  qualification: 'badge-blue',
  proposal: 'badge-orange',
  negotiation: 'badge-blue',
  closed_won: 'badge-green',
  closed_lost: 'badge-red',
}

export const stageOrder: Lead['stage'][] = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]
