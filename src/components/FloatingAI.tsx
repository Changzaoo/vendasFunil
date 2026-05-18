import { useState } from 'react'
import { useLocation } from 'wouter'
import { Bot, X, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const quickPrompts = [
  'Analisar pipeline',
  'Leads prioritários',
  'Dica de follow-up',
]

export function FloatingAI() {
  const [open, setOpen] = useState(false)
  const [, navigate] = useLocation()
  const [location] = useLocation()

  if (location === '/ai-assistant') return null

  function go(prompt?: string) {
    setOpen(false)
    navigate('/ai-assistant')
    if (prompt) {
      sessionStorage.setItem('ai_prompt', prompt)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="card w-60 p-4 animate-slide-up shadow-apple-lg">
          <p className="text-xs font-semibold text-apple-text mb-3 flex items-center gap-1.5">
            <Sparkles size={12} className="text-apple-blue" />
            Sugestões rápidas
          </p>
          <div className="space-y-1.5 mb-3">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => go(p)}
                className="w-full text-left text-xs text-apple-text-2 hover:text-apple-blue hover:bg-apple-blue/10 px-3 py-2 rounded-apple-sm transition-colors flex items-center justify-between group"
              >
                <span>{p}</span>
                <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          <button onClick={() => go()} className="btn-primary w-full text-xs flex items-center justify-center gap-1.5">
            <Bot size={13} />
            Abrir Assistente
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-12 h-12 rounded-full shadow-apple-lg flex items-center justify-center transition-all duration-200 active:scale-95',
          open ? 'bg-apple-text-2 text-white rotate-0' : 'bg-apple-blue text-white hover:bg-apple-blue-dark'
        )}
      >
        {open ? <X size={18} /> : <Bot size={20} />}
      </button>
    </div>
  )
}
