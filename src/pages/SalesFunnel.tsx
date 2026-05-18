import { useMemo } from 'react'
import { Shell } from '@/components/Shell'
import { useLeads } from '@/hooks/useLeads'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { TrendingUp, Loader2 } from 'lucide-react'
import { stageLabels, stageColors, stageOrder, type Lead } from '@/types'

const stageBarColors: Record<Lead['stage'], string> = {
  prospecting: 'bg-apple-text-4',
  qualification: 'bg-apple-blue',
  proposal: 'bg-apple-orange',
  negotiation: 'bg-apple-purple',
  closed_won: 'bg-apple-green',
  closed_lost: 'bg-apple-red',
}

export default function SalesFunnel() {
  const { leads, loading } = useLeads()

  const stages = useMemo(() => {
    return stageOrder.map((stage) => {
      const stageLeads = leads.filter((l) => l.stage === stage)
      const total = stageLeads.reduce((s, l) => s + l.value, 0)
      const avgProb = stageLeads.length > 0 ? Math.round(stageLeads.reduce((s, l) => s + l.probability, 0) / stageLeads.length) : 0
      return { stage, leads: stageLeads, total, avgProb, count: stageLeads.length }
    })
  }, [leads])

  const maxCount = Math.max(...stages.map((s) => s.count), 1)

  return (
    <Shell title="Funil de Vendas" subtitle="Distribuição de oportunidades por etapa">
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : leads.length === 0 ? (
        <div className="card py-20 flex flex-col items-center gap-3 text-apple-text-4">
          <TrendingUp size={36} strokeWidth={1.2} />
          <p className="text-sm">Nenhum lead no funil ainda.</p>
          <a href="/leads" className="btn-primary">Criar primeiro lead</a>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          {/* Funnel bars */}
          <div className="card p-6">
            <p className="text-sm font-semibold text-apple-text mb-5">Visualização do Funil</p>
            <div className="space-y-3">
              {stages.map(({ stage, count, total, avgProb }) => {
                const width = Math.max((count / maxCount) * 100, count > 0 ? 8 : 0)
                return (
                  <div key={stage} className="flex items-center gap-4">
                    <div className="w-28 text-right">
                      <span className={cn('badge text-[10px]', stageColors[stage])}>{stageLabels[stage]}</span>
                    </div>
                    <div className="flex-1 h-10 bg-apple-gray-3 rounded-apple-sm overflow-hidden">
                      {count > 0 && (
                        <div className={cn('h-full rounded-apple-sm flex items-center px-3 transition-all duration-500', stageBarColors[stage])} style={{ width: `${width}%` }}>
                          <span className="text-white text-xs font-semibold">{count}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-36 text-right">
                      <p className="text-sm font-semibold text-apple-text">{formatCurrency(total)}</p>
                      {avgProb > 0 && <p className="text-[10px] text-apple-text-4">{avgProb}% prob. média</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stage cards */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {stages.filter((s) => s.count > 0).map(({ stage, leads: stageLeads, total, avgProb }) => (
              <div key={stage} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('badge text-[10px]', stageColors[stage])}>{stageLabels[stage]}</span>
                  <span className="text-xs text-apple-text-4">{stageLeads.length} leads</span>
                </div>
                <p className="text-lg font-semibold text-apple-text mb-0.5">{formatCurrency(total)}</p>
                {avgProb > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-apple-text-4">
                    <TrendingUp size={10} />{avgProb}% probabilidade média
                  </div>
                )}
                <div className="mt-3 space-y-1">
                  {stageLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="text-[11px] text-apple-text-3 truncate bg-apple-gray rounded px-2 py-1">{lead.name}</div>
                  ))}
                  {stageLeads.length > 3 && <p className="text-[10px] text-apple-text-4 pl-1">+{stageLeads.length - 3} mais</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Full table */}
          <div className="card">
            <div className="px-5 py-4 border-b border-apple-gray-3">
              <p className="text-sm font-semibold text-apple-text">Todas as Oportunidades</p>
            </div>
            <div className="divide-y divide-apple-gray-3">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-apple-gray transition-colors">
                  <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center text-xs font-semibold text-apple-blue flex-shrink-0">
                    {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-apple-text truncate">{lead.name}</p>
                    <p className="text-xs text-apple-text-3">{lead.company}</p>
                  </div>
                  <span className={cn('badge text-[10px]', stageColors[lead.stage])}>{stageLabels[lead.stage]}</span>
                  <div className="text-right w-28 flex-shrink-0">
                    <p className="text-sm font-semibold text-apple-text">{formatCurrency(lead.value)}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-apple-text-4">
                      <TrendingUp size={9} />{lead.probability}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
