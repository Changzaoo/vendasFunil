import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'wouter'
import { Shell } from '@/components/Shell'
import { useConversations, useMessages } from '@/hooks/useConversations'
import { sendMessage, markRead, updateConversationStatus } from '@/services/conversations'
import { Send, ArrowLeft, Phone, Video, MoreHorizontal, Loader2, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Conversation } from '@/types'

const channelLabel: Record<string, string> = { whatsapp: 'WhatsApp', email: 'E-mail', phone: 'Telefone', chat: 'Chat' }

const statusLabels: { value: Conversation['status']; label: string }[] = [
  { value: 'open', label: 'Aberta' },
  { value: 'pending', label: 'Pendente' },
  { value: 'resolved', label: 'Resolvida' },
]

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>()
  const [, navigate] = useLocation()
  const { conversations } = useConversations()
  const { messages, loading } = useMessages(id ?? '')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const conv = conversations.find((c) => c.id === id)

  useEffect(() => {
    if (id) markRead(id).catch(() => {})
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending || !id) return
    setSending(true)
    setInput('')
    try {
      await sendMessage(id, text, 'user')
    } catch {
      toast.error('Erro ao enviar mensagem.')
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  async function handleStatusChange(status: Conversation['status']) {
    if (!id) return
    try {
      await updateConversationStatus(id, status)
      setShowStatusMenu(false)
      toast.success('Status atualizado.')
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }

  if (!conv && !loading) {
    return (
      <Shell title="Conversa não encontrada">
        <button onClick={() => navigate('/conversations')} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={14} /> Voltar
        </button>
      </Shell>
    )
  }

  return (
    <Shell
      title={conv?.contactName ?? '...'}
      subtitle={conv ? channelLabel[conv.channel] : ''}
      actions={
        <div className="flex items-center gap-1 relative">
          <button onClick={() => navigate('/conversations')} className="btn-ghost p-2">
            <ArrowLeft size={16} />
          </button>
          <button className="btn-ghost p-2"><Phone size={16} /></button>
          <button className="btn-ghost p-2"><Video size={16} /></button>
          <div className="relative">
            <button onClick={() => setShowStatusMenu((v) => !v)} className="btn-ghost p-2">
              <MoreHorizontal size={16} />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 card w-40 py-1 z-50 shadow-apple-md animate-scale-in">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-apple-text-4 uppercase tracking-wide">Status</p>
                {statusLabels.map((s) => (
                  <button key={s.value} onClick={() => handleStatusChange(s.value)} className={cn('w-full text-left px-3 py-2 text-sm hover:bg-apple-gray flex items-center justify-between', conv?.status === s.value && 'text-apple-blue font-medium')}>
                    {s.label}
                    {conv?.status === s.value && <CheckCheck size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col animate-fade-in" style={{ height: 'calc(100vh - var(--header-height) - 4rem)' }}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-apple-text-4" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-sm text-apple-text-4">
                Nenhuma mensagem ainda. Envie a primeira!
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'contact' && (
                  <div className="w-7 h-7 rounded-full bg-apple-blue/10 flex items-center justify-center text-xs font-semibold text-apple-blue mr-2 flex-shrink-0 mt-0.5">
                    {conv?.contactName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                )}
                <div className={cn('max-w-sm rounded-apple-lg px-4 py-2.5', msg.role === 'user' ? 'bg-apple-blue text-white' : 'bg-white shadow-apple')}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={cn('text-[10px] mt-1', msg.role === 'user' ? 'text-white/60' : 'text-apple-text-4')}>
                    {msg.timestamp?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="card p-3 flex items-center gap-3">
          <input
            className="input flex-1"
            placeholder="Digite uma mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-apple-sm bg-apple-blue text-white flex items-center justify-center hover:bg-apple-blue-dark active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </Shell>
  )
}
