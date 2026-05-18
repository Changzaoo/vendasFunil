import { useState, useEffect } from 'react'
import { Shell } from '@/components/Shell'
import {
  Bell, Lock, Palette, Globe, MessageSquare, Zap,
  ChevronRight, Users, Plus, Eye, EyeOff, Check, Sun, Moon, Monitor,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { isAdmin, createFirebaseUser } from '@/services/adminUsers'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark' | 'system'
type SettingSection = 'notifications' | 'integrations' | 'appearance' | 'security' | 'language' | 'ai' | 'users'
type Toggle = { id: string; label: string; desc?: string; value: boolean }

// ─── Storage helpers ──────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Theme helper ─────────────────────────────────────────────────────────────

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? root.classList.add('dark')
      : root.classList.remove('dark')
  }
  save('app_theme', theme)
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultNotifs: Toggle[] = [
  { id: 'n1', label: 'Novas mensagens', desc: 'Receber alertas de conversas novas', value: true },
  { id: 'n2', label: 'Lembretes de follow-up', desc: 'Alertas para acompanhamento de leads', value: true },
  { id: 'n3', label: 'Relatórios semanais', desc: 'Resumo de desempenho por e-mail', value: false },
  { id: 'n4', label: 'Alertas de meta', desc: 'Notificação ao atingir ou perder meta', value: true },
]

const defaultIntegrations: Toggle[] = [
  { id: 'i1', label: 'WhatsApp Business', desc: 'Canal de mensagens principal', value: true },
  { id: 'i2', label: 'Gmail', desc: 'E-mail de vendas integrado', value: false },
  { id: 'i3', label: 'Slack', desc: 'Notificações para equipe', value: false },
  { id: 'i4', label: 'Google Calendar', desc: 'Sincronização de agenda', value: true },
]

const timezones = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Noronha',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Berlin',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
        value ? 'bg-apple-green' : 'bg-apple-gray-4',
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
          value ? 'translate-x-5' : 'translate-x-1',
        )}
      />
    </button>
  )
}

function SectionRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-apple-gray-3 dark:border-[#3A3A3C] last:border-0">
      <div>
        <p className="text-sm font-medium text-apple-text dark:text-[#F5F5F7]">{label}</p>
        {desc && <p className="text-xs text-apple-text-4 dark:text-[#636366] mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [toggles, setToggles] = useState<Toggle[]>(() =>
    load('app_notifications', defaultNotifs),
  )

  function toggle(id: string) {
    setToggles((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, value: !t.value } : t))
      save('app_notifications', next)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7] mb-1">Notificações</h2>
      <p className="text-xs text-apple-text-4 dark:text-[#636366] mb-5">Escolha quais alertas você deseja receber.</p>
      <div>
        {toggles.map((t) => (
          <SectionRow key={t.id} label={t.label} desc={t.desc}>
            <ToggleSwitch value={t.value} onChange={() => toggle(t.id)} />
          </SectionRow>
        ))}
      </div>
    </div>
  )
}

function IntegrationsSection() {
  const [toggles, setToggles] = useState<Toggle[]>(() =>
    load('app_integrations', defaultIntegrations),
  )

  function toggle(id: string) {
    setToggles((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, value: !t.value } : t))
      save('app_integrations', next)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7] mb-1">Integrações</h2>
      <p className="text-xs text-apple-text-4 dark:text-[#636366] mb-5">Conecte ferramentas externas ao Sales AI.</p>
      <div>
        {toggles.map((t) => (
          <SectionRow key={t.id} label={t.label} desc={t.desc}>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-xs font-medium',
                  t.value ? 'text-apple-green' : 'text-apple-text-4 dark:text-[#636366]',
                )}
              >
                {t.value ? 'Conectado' : 'Desconectado'}
              </span>
              <ToggleSwitch value={t.value} onChange={() => toggle(t.id)} />
            </div>
          </SectionRow>
        ))}
      </div>
    </div>
  )
}

function AppearanceSection() {
  const [theme, setTheme] = useState<Theme>(() => load<Theme>('app_theme', 'light'))

  function handleTheme(t: Theme) {
    setTheme(t)
    applyTheme(t)
    toast.success('Tema atualizado')
  }

  const options: { value: Theme; label: string; icon: React.ElementType; desc: string }[] = [
    { value: 'light', label: 'Claro', icon: Sun, desc: 'Fundo branco, ideal para ambientes iluminados' },
    { value: 'dark', label: 'Escuro', icon: Moon, desc: 'Fundo escuro, reduz cansaço visual' },
    { value: 'system', label: 'Sistema', icon: Monitor, desc: 'Segue a preferência do seu sistema operacional' },
  ]

  return (
    <div>
      <h2 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7] mb-1">Aparência</h2>
      <p className="text-xs text-apple-text-4 dark:text-[#636366] mb-5">Personalize o visual da plataforma.</p>
      <label className="form-label">Tema</label>
      <div className="grid grid-cols-3 gap-3 mt-2">
        {options.map((o) => {
          const Icon = o.icon
          const active = theme === o.value
          return (
            <button
              key={o.value}
              onClick={() => handleTheme(o.value)}
              className={cn(
                'p-4 rounded-apple border-2 text-left transition-all',
                active
                  ? 'border-apple-blue bg-apple-blue/5'
                  : 'border-apple-gray-3 dark:border-[#3A3A3C] hover:border-apple-gray-4',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={active ? 'text-apple-blue' : 'text-apple-text-3 dark:text-[#8E8E93]'} />
                {active && <Check size={14} className="text-apple-blue" />}
              </div>
              <p className={cn('text-sm font-medium', active ? 'text-apple-blue' : 'text-apple-text dark:text-[#F5F5F7]')}>
                {o.label}
              </p>
              <p className="text-xs text-apple-text-4 dark:text-[#636366] mt-0.5 leading-snug">{o.desc}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SecuritySection() {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) {
      toast.error('As senhas novas não coincidem.')
      return
    }
    if (next.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await changePassword(current, next)
      toast.success('Senha alterada com sucesso.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        toast.error('Senha atual incorreta.')
      } else {
        toast.error('Erro ao alterar senha. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7] mb-1">Segurança</h2>
      <p className="text-xs text-apple-text-4 dark:text-[#636366] mb-5">Mantenha sua conta protegida.</p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="form-label">Senha atual</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-text-4 hover:text-apple-text-2"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Nova senha</label>
          <div className="relative">
            <input
              type={showNext ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNext((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-text-4 hover:text-apple-text-2"
            >
              {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Confirmar nova senha</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !current || !next || !confirm}
          className="btn-primary flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  )
}

function LanguageSection() {
  const [timezone, setTimezone] = useState(() => load('app_timezone', 'America/Sao_Paulo'))
  const [dateFormat, setDateFormat] = useState(() => load('app_dateformat', 'DD/MM/YYYY'))
  const [language, setLanguage] = useState(() => load('app_language', 'pt'))

  function handleSave() {
    save('app_timezone', timezone)
    save('app_dateformat', dateFormat)
    save('app_language', language)
    toast.success('Preferências de idioma salvas.')
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7] mb-1">Idioma & Região</h2>
      <p className="text-xs text-apple-text-4 dark:text-[#636366] mb-5">Configure fuso horário, idioma e formato de data.</p>
      <div className="space-y-4 max-w-sm">
        <div>
          <label className="form-label">Idioma da interface</label>
          <select
            className="input"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="pt">Português (Brasil)</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="form-label">Fuso horário</label>
          <select
            className="input"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Formato de data</label>
          <select
            className="input"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/AAAA — ex: 18/05/2026</option>
            <option value="MM/DD/YYYY">MM/DD/AAAA — ex: 05/18/2026</option>
            <option value="YYYY-MM-DD">AAAA-MM-DD — ex: 2026-05-18</option>
          </select>
        </div>
        <button onClick={handleSave} className="btn-primary">Salvar preferências</button>
      </div>
    </div>
  )
}

function AISection() {
  const [personality, setPersonality] = useState(() => load('app_ai_personality', 'neutral'))
  const [detail, setDetail] = useState(() => load('app_ai_detail', 'medium'))
  const [aiLang, setAiLang] = useState(() => load('app_ai_language', 'pt'))
  const [suggestions, setSuggestions] = useState(() => load('app_ai_suggestions', true))

  function handleSave() {
    save('app_ai_personality', personality)
    save('app_ai_detail', detail)
    save('app_ai_language', aiLang)
    save('app_ai_suggestions', suggestions)
    toast.success('Configurações do assistente salvas.')
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7] mb-1">Assistente IA</h2>
      <p className="text-xs text-apple-text-4 dark:text-[#636366] mb-5">Personalize o comportamento do seu assistente de vendas.</p>
      <div className="space-y-4 max-w-sm">
        <div>
          <label className="form-label">Personalidade</label>
          <select
            className="input"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
          >
            <option value="formal">Formal — linguagem profissional e direta</option>
            <option value="neutral">Neutro — equilibrado e objetivo</option>
            <option value="casual">Casual — amigável e descontraído</option>
          </select>
        </div>
        <div>
          <label className="form-label">Nível de detalhe das respostas</label>
          <select
            className="input"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          >
            <option value="concise">Conciso — respostas curtas e diretas</option>
            <option value="medium">Médio — equilíbrio entre clareza e brevidade</option>
            <option value="detailed">Detalhado — respostas completas com contexto</option>
          </select>
        </div>
        <div>
          <label className="form-label">Idioma do assistente</label>
          <select
            className="input"
            value={aiLang}
            onChange={(e) => setAiLang(e.target.value)}
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </div>
        <SectionRow label="Sugestões automáticas" desc="O assistente sugere ações durante o atendimento">
          <ToggleSwitch value={suggestions} onChange={() => setSuggestions((v: boolean) => !v)} />
        </SectionRow>
        <button onClick={handleSave} className="btn-primary">Salvar configurações</button>
      </div>
    </div>
  )
}

function UsersSection() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<string[]>([])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await createFirebaseUser(email, password)
      toast.success(`Usuário ${email} criado com sucesso.`)
      setCreated((prev) => [...prev, email])
      setEmail('')
      setPassword('')
      setConfirm('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7] mb-1">Gerenciar Usuários</h2>
      <p className="text-xs text-apple-text-4 dark:text-[#636366] mb-5">
        Crie contas de acesso para a sua equipe. Apenas o administrador pode criar usuários.
      </p>
      <form onSubmit={handleCreate} className="space-y-4 max-w-sm">
        <div>
          <label className="form-label">E-mail do novo usuário</label>
          <input
            type="email"
            className="input"
            placeholder="vendedor@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label">Senha temporária</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className="input pr-10"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-text-4 hover:text-apple-text-2"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Confirmar senha</label>
          <input
            type="password"
            className="input"
            placeholder="Repetir senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email || !password || !confirm}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {loading ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>

      {created.length > 0 && (
        <div className="mt-6">
          <p className="form-label mb-2">Criados nesta sessão</p>
          <div className="space-y-1.5">
            {created.map((e) => (
              <div
                key={e}
                className="flex items-center gap-2 text-sm text-apple-text dark:text-[#F5F5F7] bg-apple-green/8 border border-apple-green/20 rounded-apple-sm px-3 py-2"
              >
                <Check size={13} className="text-apple-green flex-shrink-0" />
                {e}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Settings() {
  const { user } = useAuth()
  const admin = isAdmin(user?.email)

  const sections: { id: SettingSection; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'integrations', label: 'Integrações', icon: MessageSquare },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'language', label: 'Idioma & Região', icon: Globe },
    { id: 'ai', label: 'Assistente IA', icon: Zap },
    { id: 'users', label: 'Usuários', icon: Users, adminOnly: true },
  ]

  const visibleSections = sections.filter((s) => !s.adminOnly || admin)

  const [active, setActive] = useState<SettingSection>('notifications')

  useEffect(() => {
    if (!admin && active === 'users') setActive('notifications')
  }, [admin, active])

  return (
    <Shell title="Configurações">
      <div className="animate-fade-in grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="card p-2 h-fit">
          {visibleSections.map((s) => {
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
          {active === 'notifications' && <NotificationsSection />}
          {active === 'integrations' && <IntegrationsSection />}
          {active === 'appearance' && <AppearanceSection />}
          {active === 'security' && <SecuritySection />}
          {active === 'language' && <LanguageSection />}
          {active === 'ai' && <AISection />}
          {active === 'users' && admin && <UsersSection />}
        </div>
      </div>
    </Shell>
  )
}
