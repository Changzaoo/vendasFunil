import { useMemo } from 'react'
import { useLocation } from 'wouter'
import { Shell } from '@/components/Shell'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, Users, MessageSquare, Percent, ArrowUpRight, Plus, Loader2 } from 'lucide-react'
import { cn, formatCurrency, timeAgo } from '@/lib/utils'
import { useContacts } from '@/hooks/useContacts'
import { useConversations } from '@/hooks/useConversations'
import { useLeads } from '@/hooks/useLeads'

type KpiCardProps = {
  title: string
  value: string
  sub: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
}

function KpiCard({ title, value, sub, icon: Icon, iconColor, iconBg }: KpiCardProps) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-apple-text-3 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-apple-text tracking-tight">{value}</p>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-apple-text-4">
          <ArrowUpRight size={12} />
          <span>{sub}</span>
        </div>
      </div>
      <div className={cn('w-10 h-10 rounded-apple-sm flex items-center justify-center', iconBg)}>
        <Icon size={18} className={iconColor} strokeWidth={1.8} />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="font-medium text-apple-text mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-apple-text-3">
            {p.name}: <span className="text-apple-text font-medium">
              {p.value > 1000 ? formatCurrency(p.value) : p.value}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const channelIcon: Record<string, string> = {
  whatsapp: '💬', email: '✉️', phone: '📞', chat: '💭',
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function Dashboard() {
  const [, navigate] = useLocation()
  const { contacts, loading: lc } = useContacts()
  const { conversations, loading: lv } = useConversations()
  const { leads, loading: ll } = useLeads()

  const loading = lc || lv || ll

  const metrics = useMemo(() => {
    const activeContacts = contacts.filter((c) => c.status === 'active').length
    const totalSales = leads.filter((l) => l.stage === 'closed_won').reduce((s, l) => s + l.value, 0)
    const won = leads.filter((l) => l.stage === 'closed_won').length
    const lost = leads.filter((l) => l.stage === 'closed_lost').length
    const convRate = won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(1) : '0,0'
    return { activeContacts, totalSales, convRate, totalConversations: conversations.length }
  }, [contacts, conversations, leads])

  const monthlyData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const label = MONTHS[d.getMonth()]
      const won = leads.filter((l) => {
        if (l.stage !== 'closed_won' || !l.updatedAt) return false
        const ld = l.updatedAt.toDate()
        return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth()
      })
      const sales = won.reduce((s, l) => s + l.value, 0)
      const contactsCount = contacts.filter((c) => {
        if (!c.createdAt) return false
        const cd = c.createdAt.toDate()
        return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth()
      }).length
      return { month: label, vendas: sales, contatos: contactsCount }
    })
  }, [leads, contacts])

  return (
    <Shell
      title="Dashboard"
      subtitle="Visão geral do seu negócio"
      actions={
        <button onClick={() => navigate('/conversations')} className="btn-primary flex items-center gap-2">
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
        <div className="space-y-6 animate-fade-in">
          {/* KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard title="Total em Vendas" value={formatCurrency(metrics.totalSales)} sub="leads ganhos" icon={TrendingUp} iconColor="text-apple-blue" iconBg="bg-apple-blue/10" />
            <KpiCard title="Contatos Ativos" value={String(metrics.activeContacts)} sub={`de ${contacts.length} total`} icon={Users} iconColor="text-apple-green" iconBg="bg-apple-green/10" />
            <KpiCard title="Conversas" value={String(metrics.totalConversations)} sub={`${conversations.filter((c) => c.unread > 0).length} não lidas`} icon={MessageSquare} iconColor="text-apple-purple" iconBg="bg-apple-purple/10" />
            <KpiCard title="Taxa de Conversão" value={`${metrics.convRate}%`} sub="ganhos vs perdidos" icon={Percent} iconColor="text-apple-orange" iconBg="bg-apple-orange/10" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-sm font-semibold text-apple-text mb-0.5">Vendas Mensais</p>
              <p className="text-xs text-apple-text-4 mb-4">Últimos 6 meses</p>
              {monthlyData.every((d) => d.vendas === 0) ? (
                <div className="flex items-center justify-center h-40 text-sm text-apple-text-4">
                  Sem dados de vendas ainda
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8ED" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="vendas" name="Vendas" fill="#0071E3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card p-5">
              <p className="text-sm font-semibold text-apple-text mb-0.5">Novos Contatos</p>
              <p className="text-xs text-apple-text-4 mb-4">Últimos 6 meses</p>
              {monthlyData.every((d) => d.contatos === 0) ? (
                <div className="flex items-center justify-center h-40 text-sm text-apple-text-4">
                  Sem dados de contatos ainda
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8ED" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="contatos" name="Contatos" stroke="#34C759" strokeWidth={2} dot={{ fill: '#34C759', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent conversations */}
          <div className="card">
            <div className="px-5 py-4 border-b border-apple-gray-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-apple-text">Conversas Recentes</p>
                <p className="text-xs text-apple-text-4">Últimas interações</p>
              </div>
              <button onClick={() => navigate('/conversations')} className="btn-ghost text-xs">Ver todas →</button>
            </div>
            {conversations.length === 0 ? (
              <div className="py-12 text-center text-sm text-apple-text-4">
                Nenhuma conversa ainda.{' '}
                <button onClick={() => navigate('/conversations')} className="text-apple-blue">Criar primeira</button>
              </div>
            ) : (
              <div className="divide-y divide-apple-gray-3">
                {conversations.slice(0, 5).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/conversations/${conv.id}`)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-apple-gray transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-apple-blue/10 flex items-center justify-center text-sm font-semibold text-apple-blue flex-shrink-0">
                      {conv.contactName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-apple-text truncate">{conv.contactName}</span>
                        <span className="text-xs">{channelIcon[conv.channel]}</span>
                      </div>
                      <p className="text-xs text-apple-text-3 truncate">{conv.lastMessage || 'Sem mensagens'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-apple-text-4">
                        {conv.lastMessageAt ? timeAgo(conv.lastMessageAt.toDate()) : ''}
                      </span>
                      {conv.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-apple-blue text-white text-[10px] font-semibold flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  )
}
