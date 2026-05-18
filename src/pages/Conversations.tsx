import { useState } from 'react'
import { useLocation } from 'wouter'
import { Shell } from '@/components/Shell'
import { useConversations } from '@/hooks/useConversations'
import { useContacts } from '@/hooks/useContacts'
import { createConversation } from '@/services/conversations'
import { Search, MessageSquare, Plus, Filter, Loader2, X } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import { toast } from 'sonner'
import type { Contact } from '@/types'

const channelIcon: Record<string, string> = { whatsapp: '💬', email: '✉️', phone: '📞', chat: '💭' }
const channelLabel: Record<string, string> = { whatsapp: 'WhatsApp', email: 'E-mail', phone: 'Telefone', chat: 'Chat' }
const statusLabel: Record<string, string> = { open: 'Aberta', pending: 'Pendente', resolved: 'Resolvida' }
const statusClass: Record<string, string> = { open: 'badge-green', pending: 'badge-orange', resolved: 'badge-gray' }

type FilterTab = 'all' | 'open' | 'pending' | 'resolved'

export default function Conversations() {
  const [, navigate] = useLocation()
  const { conversations, loading } = useConversations()
  const { contacts } = useContacts()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [showNew, setShowNew] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'phone' | 'chat'>('whatsapp')
  const [creating, setCreating] = useState(false)

  const filtered = conversations.filter((c) => {
    const matchSearch = c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'open', label: 'Abertas' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'resolved', label: 'Resolvidas' },
  ]

  async function handleCreate() {
    if (!selectedContact) return
    setCreating(true)
    try {
      const id = await createConversation({
        contactId: selectedContact.id,
        contactName: selectedContact.name,
        channel,
        status: 'open',
      })
      setShowNew(false)
      setSelectedContact(null)
      navigate(`/conversations/${id}`)
      toast.success('Conversa criada!')
    } catch {
      toast.error('Erro ao criar conversa.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Shell
      title="Conversas"
      subtitle={`${conversations.filter((c) => c.unread > 0).length} não lidas`}
      actions={
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={14} />
          Nova Conversa
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-apple-text-4" />
        </div>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-text-4" />
              <input className="input pl-8" placeholder="Buscar conversas..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Filter size={14} />
              Filtros
            </button>
          </div>

          <div className="flex gap-1 bg-apple-gray-3 p-1 rounded-apple-sm w-fit">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)} className={cn('px-4 py-1.5 rounded-[6px] text-sm font-medium transition-all duration-150', filter === t.key ? 'bg-white text-apple-text shadow-apple' : 'text-apple-text-3 hover:text-apple-text')}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="card divide-y divide-apple-gray-3">
            {filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-apple-text-4">
                <MessageSquare size={32} strokeWidth={1.2} />
                <p className="text-sm">{search ? 'Nenhum resultado' : 'Nenhuma conversa ainda'}</p>
                {!search && <button onClick={() => setShowNew(true)} className="btn-primary">Criar conversa</button>}
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/conversations/${conv.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-apple-gray transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center text-sm font-semibold text-apple-blue">
                      {conv.contactName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    {conv.status === 'open' && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-apple-green border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('text-sm font-medium text-apple-text truncate', conv.unread > 0 && 'font-semibold')}>{conv.contactName}</span>
                      <span className="text-xs">{channelIcon[conv.channel]}</span>
                      <span className={cn('badge text-[10px]', statusClass[conv.status])}>{statusLabel[conv.status]}</span>
                    </div>
                    <p className={cn('text-xs truncate', conv.unread > 0 ? 'text-apple-text font-medium' : 'text-apple-text-3')}>
                      {conv.lastMessage || 'Sem mensagens'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs text-apple-text-4">{conv.lastMessageAt ? timeAgo(conv.lastMessageAt.toDate()) : ''}</span>
                    {conv.unread > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-apple-blue text-white text-[10px] font-semibold flex items-center justify-center">{conv.unread}</span>
                    ) : <span className="w-5 h-5" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* New conversation modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Nova Conversa</h2>
              <button onClick={() => setShowNew(false)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label">Contato *</label>
                <select className="input" value={selectedContact?.id ?? ''} onChange={(e) => {
                  const c = contacts.find((ct) => ct.id === e.target.value) ?? null
                  setSelectedContact(c)
                }}>
                  <option value="">Selecione um contato</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Canal</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['whatsapp', 'email', 'phone', 'chat'] as const).map((ch) => (
                    <button key={ch} onClick={() => setChannel(ch)} className={cn('flex items-center gap-2 px-3 py-2 rounded-apple-sm border text-xs font-medium transition-all', channel === ch ? 'border-apple-blue bg-apple-blue/10 text-apple-blue' : 'border-apple-gray-3 text-apple-text-2')}>
                      <span>{channelIcon[ch]}</span>
                      {channelLabel[ch]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleCreate} disabled={!selectedContact || creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {creating && <Loader2 size={13} className="animate-spin" />}
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
