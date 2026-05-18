import { useState, useRef, useEffect } from 'react'
import { Shell } from '@/components/Shell'
import { Send, Bot, RotateCcw, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLeads } from '@/hooks/useLeads'
import { useContacts } from '@/hooks/useContacts'
import { useConversations } from '@/hooks/useConversations'

type Message = { id: string; role: 'user' | 'assistant'; content: string }

const suggestions = [
  'Como está meu pipeline de vendas?',
  'Quais leads devo priorizar hoje?',
  'Dicas para melhorar minha taxa de conversão',
  'Como abordar um lead que parou de responder?',
  'Estratégia de follow-up eficiente',
]

export default function AIAssistant() {
  const { leads } = useLeads()
  const { contacts } = useContacts()
  const { conversations } = useConversations()

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Olá! Sou seu assistente de vendas com IA real. Posso analisar seus dados do CRM e ajudar com estratégias, análise de pipeline, follow-ups e muito mais. Como posso ajudar?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Build real context from Firestore data
  const context = {
    contacts: contacts.length,
    leads: leads.filter((l) => !['closed_won', 'closed_lost'].includes(l.stage)).length,
    conversations: conversations.filter((c) => c.status === 'open').length,
    totalSales: leads.filter((l) => l.stage === 'closed_won').reduce((s, l) => s + l.value, 0),
    pipeline: leads.filter((l) => !['closed_won', 'closed_lost'].includes(l.stage)).reduce((s, l) => s + l.value, 0),
  }

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    setApiError(null)

    const userMsg: Message = { id: String(Date.now()), role: 'user', content }
    const history = [...messages, userMsg].filter((m) => m.id !== '0').map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: 'assistant', content: data.content }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao contatar o servidor.'
      setApiError(msg)
      setMessages((prev) => prev.filter((m) => m !== userMsg))
      setInput(content)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([{ id: '0', role: 'assistant', content: 'Conversa reiniciada. Como posso ajudar?' }])
    setApiError(null)
  }

  return (
    <Shell
      title="Assistente IA"
      subtitle="Powered by Claude AI · Dados em tempo real do seu CRM"
      actions={
        <button onClick={reset} className="btn-secondary flex items-center gap-2 text-xs">
          <RotateCcw size={13} /> Nova conversa
        </button>
      }
    >
      <div className="animate-fade-in flex flex-col gap-4" style={{ height: 'calc(100vh - var(--header-height) - 4rem)' }}>
        {/* Context bar */}
        <div className="flex items-center gap-4 card px-4 py-2.5">
          <p className="text-xs text-apple-text-4 font-medium">Contexto atual:</p>
          {[
            { label: 'Contatos', value: context.contacts },
            { label: 'Leads ativos', value: context.leads },
            { label: 'Conversas abertas', value: context.conversations },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
              <span className="text-xs text-apple-text-3">{item.label}: <span className="font-semibold text-apple-text">{item.value}</span></span>
            </div>
          ))}
        </div>

        {/* Error */}
        {apiError && (
          <div className="flex items-start gap-2 px-4 py-3 bg-apple-red/8 border border-apple-red/20 rounded-apple-sm text-xs text-apple-red">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{apiError} — Verifique se o servidor está rodando e a <code>ANTHROPIC_API_KEY</code> está configurada no <code>.env</code>.</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div className={cn('max-w-xl rounded-apple-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap', msg.role === 'user' ? 'bg-apple-blue text-white' : 'bg-white shadow-apple text-apple-text')}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white shadow-apple rounded-apple-lg px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-apple-text-4 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-apple text-xs text-apple-text-2 hover:bg-apple-blue hover:text-white transition-all duration-150">
                <Sparkles size={11} />{s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="card p-3 flex items-center gap-3">
          <input
            className="input flex-1"
            placeholder="Pergunte sobre seus leads, pipeline, estratégias..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-apple-sm bg-apple-blue text-white flex items-center justify-center hover:bg-apple-blue-dark active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </Shell>
  )
}
