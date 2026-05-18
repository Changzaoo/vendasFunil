import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { Bell, Lock, Palette, Globe, MessageSquare, Zap, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingSection = 'notifications' | 'integrations' | 'appearance' | 'security' | 'language' | 'ai'

const sections: { id: SettingSection; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'notifications', label: 'Notificações', icon: Bell, desc: 'Alertas e preferências de aviso' },
  { id: 'integrations', label: 'Integrações', icon: MessageSquare, desc: 'WhatsApp, Gmail, Slack e mais' },
  { id: 'appearance', label: 'Aparência', icon: Palette, desc: 'Tema, cores e layout' },
  { id: 'security', label: 'Segurança', icon: Lock, desc: 'Senha, 2FA e sessões ativas' },
  { id: 'language', label: 'Idioma & Região', icon: Globe, desc: 'Fuso horário e formato de data' },
  { id: 'ai', label: 'Assistente IA', icon: Zap, desc: 'Personalidade e comportamento da IA' },
]

type Toggle = { id: string; label: string; desc?: string; value: boolean }

const notificationToggles: Toggle[] = [
  { id: 'n1', label: 'Novas mensagens', desc: 'Receber alertas de conversas novas', value: true },
  { id: 'n2', label: 'Lembretes de follow-up', desc: 'Alertas para acompanhamento de leads', value: true },
  { id: 'n3', label: 'Relatórios semanais', desc: 'Resumo de desempenho por e-mail', value: false },
  { id: 'n4', label: 'Alertas de meta', desc: 'Notificação ao atingir ou perder meta', value: true },
]

const integrationToggles: Toggle[] = [
  { id: 'i1', label: 'WhatsApp Business', value: true },
  { id: 'i2', label: 'Gmail', value: false },
  { id: 'i3', label: 'Slack', value: false },
  { id: 'i4', label: 'Google Calendar', value: true },
]

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
        value ? 'bg-apple-green' : 'bg-apple-gray-4'
      )}
    >
      <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', value ? 'translate-x-5' : 'translate-x-1')} />
    </button>
  )
}

export default function Settings() {
  const [active, setActive] = useState<SettingSection>('notifications')
  const [nToggles, setNToggles] = useState(notificationToggles)
  const [iToggles, setIToggles] = useState(integrationToggles)

  function toggleN(id: string) {
    setNToggles((prev) => prev.map((t) => t.id === id ? { ...t, value: !t.value } : t))
  }
  function toggleI(id: string) {
    setIToggles((prev) => prev.map((t) => t.id === id ? { ...t, value: !t.value } : t))
  }

  return (
    <Shell title="Configurações">
      <div className="animate-fade-in grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="card p-2 h-fit">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn('nav-item w-full', active === s.id && 'active')}
              >
                <Icon size={16} strokeWidth={1.8} />
                <div className="flex-1 text-left">
                  <p className="text-sm">{s.label}</p>
                </div>
                <ChevronRight size={12} className="opacity-40" />
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="xl:col-span-3 card p-6">
          {active === 'notifications' && (
            <div>
              <h2 className="text-base font-semibold text-apple-text mb-1">Notificações</h2>
              <p className="text-xs text-apple-text-4 mb-5">Escolha quais alertas você deseja receber.</p>
              <div className="space-y-1">
                {nToggles.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-apple-gray-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-apple-text">{t.label}</p>
                      {t.desc && <p className="text-xs text-apple-text-4 mt-0.5">{t.desc}</p>}
                    </div>
                    <ToggleSwitch value={t.value} onChange={() => toggleN(t.id)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'integrations' && (
            <div>
              <h2 className="text-base font-semibold text-apple-text mb-1">Integrações</h2>
              <p className="text-xs text-apple-text-4 mb-5">Conecte ferramentas externas ao Sales AI.</p>
              <div className="space-y-1">
                {iToggles.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-apple-gray-3 last:border-0">
                    <p className="text-sm font-medium text-apple-text">{t.label}</p>
                    <ToggleSwitch value={t.value} onChange={() => toggleI(t.id)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'appearance' && (
            <div>
              <h2 className="text-base font-semibold text-apple-text mb-1">Aparência</h2>
              <p className="text-xs text-apple-text-4 mb-5">Personalize o visual da plataforma.</p>
              <div>
                <label className="form-label">Tema</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {['Claro', 'Escuro', 'Sistema'].map((t) => (
                    <button key={t} className={cn('p-3 rounded-apple border-2 text-sm font-medium transition-all', t === 'Claro' ? 'border-apple-blue text-apple-blue' : 'border-apple-gray-3 text-apple-text-3')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === 'security' && (
            <div>
              <h2 className="text-base font-semibold text-apple-text mb-1">Segurança</h2>
              <p className="text-xs text-apple-text-4 mb-5">Mantenha sua conta protegida.</p>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Senha atual</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div>
                  <label className="form-label">Nova senha</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <button className="btn-primary">Alterar Senha</button>
              </div>
            </div>
          )}

          {(active === 'language' || active === 'ai') && (
            <div>
              <h2 className="text-base font-semibold text-apple-text mb-1">{sections.find((s) => s.id === active)?.label}</h2>
              <p className="text-xs text-apple-text-4 mt-1">Em breve disponível.</p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
