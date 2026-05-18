import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { useLeads } from '@/hooks/useLeads'
import { createLead, updateLead, deleteLead } from '@/services/leads'
import { Search, Plus, Zap, TrendingUp, X, Loader2, Pencil, Trash2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { stageLabels, stageColors, stageOrder, type Lead } from '@/types'

type View = 'list' | 'kanban'

const stageBorderColors: Record<Lead['stage'], string> = {
  prospecting: 'border-apple-text-4',
  qualification: 'border-apple-blue',
  proposal: 'border-apple-orange',
  negotiation: 'border-apple-purple',
  closed_won: 'border-apple-green',
  closed_lost: 'border-apple-red',
}

type LeadFormState = { name: string; company: string; email: string; phone: string; value: string; stage: Lead['stage']; probability: string; assignedTo: string; notes: string }
const emptyForm: LeadFormState = { name: '', company: '', email: '', phone: '', value: '', stage: 'prospecting', probability: '20', assignedTo: '', notes: '' }

export default function Leads() {
  const { leads, loading } = useLeads()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<View>('list')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<LeadFormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = leads.filter((l) =>
    [l.name, l.company, l.email].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  )

  const totalValue = leads.filter((l) => l.stage !== 'closed_lost').reduce((s, l) => s + l.value, 0)
  const wonValue = leads.filter((l) => l.stage === 'closed_won').reduce((s, l) => s + l.value, 0)
  const won = leads.filter((l) => l.stage === 'closed_won').length
  const lost = leads.filter((l) => l.stage === 'closed_lost').length

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true) }
  function openEdit(l: Lead) {
    setForm({ name: l.name, company: l.company, email: l.email, phone: l.phone, value: String(l.value), stage: l.stage, probability: String(l.probability), assignedTo: l.assignedTo, notes: l.notes ?? '' })
    setEditing(l.id); setShowForm(true)
  }

  async function save() {
    setSaving(true)
    try {
      const data = { name: form.name, company: form.company, email: form.email, phone: form.phone, value: Number(form.value) || 0, stage: form.stage, probability: Number(form.probability) || 0, assignedTo: form.assignedTo, notes: form.notes }
      if (editing) {
        await updateLead(editing, data)
        toast.success('Lead atualizado.')
      } else {
        await createLead(data)
        toast.success('Lead criado.')
      }
      setShowForm(false)
    } catch {
      toast.error('Erro ao salvar lead.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir lead ${name}?`)) return
    try { await deleteLead(id); toast.success('Lead removido.') }
    catch { toast.error('Erro ao remover lead.') }
  }

  return (
    <Shell
      title="Leads"
      subtitle={loading ? 'Carregando...' : `${leads.length} oportunidades · Pipeline: ${formatCurrency(totalValue)}`}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex bg-apple-gray-3 p-1 rounded-apple-sm">
            {(['list', 'kanban'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1 rounded-[5px] text-xs font-medium transition-all', view === v ? 'bg-white text-apple-text shadow-apple' : 'text-apple-text-3')}>
                {v === 'list' ? 'Lista' : 'Kanban'}
              </button>
            ))}
          </div>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Novo Lead
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4"><p className="text-xs text-apple-text-3 mb-1">Total Pipeline</p><p className="text-xl font-semibold text-apple-text">{formatCurrency(totalValue)}</p></div>
            <div className="card p-4"><p className="text-xs text-apple-text-3 mb-1">Ganhos</p><p className="text-xl font-semibold text-apple-green">{formatCurrency(wonValue)}</p></div>
            <div className="card p-4"><p className="text-xs text-apple-text-3 mb-1">Taxa de Fechamento</p><p className="text-xl font-semibold text-apple-text">{won + lost > 0 ? Math.round((won / (won + lost)) * 100) + '%' : '—'}</p></div>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-text-4" />
            <input className="input pl-9 bg-white shadow-apple border-0" placeholder="Buscar leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {view === 'list' ? (
            <div className="card divide-y divide-apple-gray-3">
              {filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-apple-text-4">
                  <Zap size={32} strokeWidth={1.2} />
                  <p className="text-sm">{search ? 'Nenhum resultado' : 'Nenhum lead ainda'}</p>
                  {!search && <button onClick={openNew} className="btn-primary">Criar primeiro lead</button>}
                </div>
              ) : (
                filtered.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-4 px-5 py-4 hover:bg-apple-gray transition-colors group">
                    <div className={cn('w-1 h-10 rounded-full border-2', stageBorderColors[lead.stage])} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-apple-text">{lead.name}</span>
                        <span className={cn('badge text-[10px]', stageColors[lead.stage])}>{stageLabels[lead.stage]}</span>
                      </div>
                      <p className="text-xs text-apple-text-3">{lead.company}{lead.assignedTo ? ` · ${lead.assignedTo}` : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-apple-text">{formatCurrency(lead.value)}</p>
                      <p className="text-xs text-apple-text-4">{lead.probability}% prob.</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(lead)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><Pencil size={13} /></button>
                      <button onClick={() => remove(lead.id, lead.name)} className="p-1.5 rounded-apple-sm hover:bg-apple-red/10 text-apple-red"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stageOrder.map((stage) => {
                const stageLeads = leads.filter((l) => l.stage === stage)
                return (
                  <div key={stage} className="flex-shrink-0 w-64">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className={cn('badge text-[10px]', stageColors[stage])}>{stageLabels[stage]}</span>
                      <span className="text-xs text-apple-text-4">{stageLeads.length}</span>
                    </div>
                    <div className="space-y-2">
                      {stageLeads.length === 0 && <div className="text-xs text-apple-text-4 text-center py-4 bg-apple-gray rounded-apple-sm">Vazio</div>}
                      {stageLeads.map((lead) => (
                        <div key={lead.id} className="card p-4 group cursor-pointer" onClick={() => openEdit(lead)}>
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-apple-blue/10 flex items-center justify-center text-xs font-semibold text-apple-blue flex-shrink-0">
                              {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-apple-text truncate">{lead.name}</p>
                              <p className="text-[10px] text-apple-text-4 truncate">{lead.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-apple-text">{formatCurrency(lead.value)}</span>
                            <div className="flex items-center gap-1 text-[10px] text-apple-text-4">
                              <TrendingUp size={10} />{lead.probability}%
                            </div>
                          </div>
                          <div className="mt-2 h-1 bg-apple-gray-3 rounded-full overflow-hidden">
                            <div className="h-full bg-apple-blue rounded-full" style={{ width: `${lead.probability}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">{editing ? 'Editar Lead' : 'Novo Lead'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {([['Nome *', 'name'], ['Empresa *', 'company'], ['E-mail', 'email'], ['Telefone', 'phone'], ['Responsável', 'assignedTo']] as [string, keyof LeadFormState][]).map(([label, key]) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input className="input" placeholder={label.replace(' *', '')} value={String(form[key])} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Valor (R$)</label>
                  <input type="number" className="input" placeholder="0" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Probabilidade (%)</label>
                  <input type="number" min="0" max="100" className="input" placeholder="0" value={form.probability} onChange={(e) => setForm((f) => ({ ...f, probability: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Estágio</label>
                <select className="input" value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as Lead['stage'] }))}>
                  {stageOrder.map((s) => <option key={s} value={s}>{stageLabels[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Notas</label>
                <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Observações..." />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.name || !form.company || saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <Loader2 size={13} className="animate-spin" />}
                {editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
