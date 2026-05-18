import { useMemo } from 'react'
import { Shell } from '@/components/Shell'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useLeads } from '@/hooks/useLeads'
import { useContacts } from '@/hooks/useContacts'
import { useConversations } from '@/hooks/useConversations'
import { formatCurrency } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color?: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="font-medium text-apple-text mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-apple-text-3">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
            {p.name}: <span className="text-apple-text font-medium">{typeof p.value === 'number' && p.value > 500 ? formatCurrency(p.value) : p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Metrics() {
  const { leads, loading: ll } = useLeads()
  const { contacts, loading: lc } = useContacts()
  const { conversations, loading: lv } = useConversations()

  const loading = ll || lc || lv

  const { monthlyData, conversionData, stats } = useMemo(() => {
    const now = new Date()

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const label = MONTHS[d.getMonth()]
      const wonLeads = leads.filter((l) => {
        if (l.stage !== 'closed_won' || !l.updatedAt) return false
        const ld = l.updatedAt.toDate()
        return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth()
      })
      const sales = wonLeads.reduce((s, l) => s + l.value, 0)
      const newContacts = contacts.filter((c) => {
        if (!c.createdAt) return false
        const cd = c.createdAt.toDate()
        return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth()
      }).length
      return { month: label, vendas: sales, contatos: newContacts }
    })

    const won = leads.filter((l) => l.stage === 'closed_won').length
    const inProgress = leads.filter((l) => !['closed_won', 'closed_lost'].includes(l.stage)).length
    const lost = leads.filter((l) => l.stage === 'closed_lost').length
    const total = won + inProgress + lost || 1

    const conversionData = [
      { name: 'Convertidos', value: Math.round((won / total) * 100), color: '#34C759' },
      { name: 'Em progresso', value: Math.round((inProgress / total) * 100), color: '#0071E3' },
      { name: 'Perdidos', value: Math.round((lost / total) * 100), color: '#FF3B30' },
    ]

    const totalSales = leads.filter((l) => l.stage === 'closed_won').reduce((s, l) => s + l.value, 0)
    const wonCount = leads.filter((l) => l.stage === 'closed_won').length
    const avgTicket = wonCount > 0 ? totalSales / wonCount : 0
    const activeContacts = contacts.filter((c) => c.status === 'active').length
    const openConvs = conversations.filter((c) => c.status === 'open').length
    const unread = conversations.reduce((s, c) => s + (c.unread ?? 0), 0)

    const stats = [
      { label: 'Total em vendas', value: formatCurrency(totalSales) },
      { label: 'Ticket médio', value: formatCurrency(avgTicket) },
      { label: 'Leads no pipeline', value: String(inProgress) },
      { label: 'Contatos ativos', value: String(activeContacts) },
      { label: 'Conversas abertas', value: String(openConvs) },
      { label: 'Mensagens não lidas', value: String(unread) },
    ]

    return { monthlyData, conversionData, stats }
  }, [leads, contacts, conversations])

  return (
    <Shell title="Métricas" subtitle="Análise de desempenho de vendas">
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="card p-4">
                <p className="text-xs text-apple-text-3 mb-1">{s.label}</p>
                <p className="text-xl font-semibold text-apple-text">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="card p-5 xl:col-span-2">
              <p className="text-sm font-semibold text-apple-text mb-0.5">Vendas Mensais</p>
              <p className="text-xs text-apple-text-4 mb-4">Leads ganhos nos últimos 6 meses</p>
              {monthlyData.every((d) => d.vendas === 0) ? (
                <div className="flex items-center justify-center h-40 text-sm text-apple-text-4">Sem dados de vendas ainda</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
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
              <p className="text-sm font-semibold text-apple-text mb-0.5">Distribuição de Leads</p>
              <p className="text-xs text-apple-text-4 mb-4">Por status atual</p>
              {leads.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-apple-text-4">Sem leads</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={conversionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {conversionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {conversionData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-apple-text-3">{d.name}</span>
                        </div>
                        <span className="font-medium text-apple-text">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold text-apple-text mb-0.5">Novos Contatos por Mês</p>
            <p className="text-xs text-apple-text-4 mb-4">Últimos 6 meses</p>
            {monthlyData.every((d) => d.contatos === 0) ? (
              <div className="flex items-center justify-center h-32 text-sm text-apple-text-4">Sem dados ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8ED" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#86868B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="contatos" name="Contatos" stroke="#34C759" strokeWidth={2} dot={{ fill: '#34C759', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </Shell>
  )
}
