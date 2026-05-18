import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { useEvents } from '@/hooks/useEvents'
import { createEvent, deleteEvent } from '@/services/events'
import { Calendar, Clock, Plus, Video, Phone, Users, X, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Timestamp } from 'firebase/firestore'
import type { CalendarEvent } from '@/types'

type EventType = CalendarEvent['type']

const typeConfig: Record<EventType, { label: string; color: string; icon: React.ElementType }> = {
  call: { label: 'Ligação', color: 'bg-apple-green/10 text-apple-green', icon: Phone },
  meeting: { label: 'Reunião', color: 'bg-apple-blue/10 text-apple-blue', icon: Users },
  demo: { label: 'Demo', color: 'bg-apple-purple/10 text-apple-purple', icon: Video },
  internal: { label: 'Interno', color: 'bg-apple-orange/10 text-apple-orange', icon: Users },
}

type FormState = { title: string; company: string; datetime: string; duration: string; type: EventType; attendees: string }
const emptyForm: FormState = { title: '', company: '', datetime: '', duration: '30min', type: 'meeting', attendees: '' }

function EventCard({ event, onDelete }: { event: CalendarEvent; onDelete: (id: string) => void }) {
  const cfg = typeConfig[event.type]
  const Icon = cfg.icon
  const dt = event.datetime?.toDate()
  const timeStr = dt ? dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
  const dateStr = dt ? dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : ''

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-apple-gray transition-colors rounded-apple-sm group">
      <div className={cn('w-9 h-9 rounded-apple-sm flex items-center justify-center flex-shrink-0', cfg.color)}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-apple-text">{event.title}</p>
        <p className="text-xs text-apple-text-3 mt-0.5">{event.company}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] text-apple-text-4">
            <Clock size={10} />
            {dateStr} {timeStr} · {event.duration}
          </span>
          <span className={cn('badge text-[10px]', cfg.color)}>{cfg.label}</span>
        </div>
      </div>
      <button onClick={() => onDelete(event.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-apple-sm hover:bg-apple-red/10 text-apple-red transition-opacity">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export default function Schedule() {
  const { events, loading } = useEvents()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const today = events.filter((e) => {
    if (!e.datetime) return false
    const d = e.datetime.toDate()
    return d.toDateString() === now.toDateString()
  })
  const upcoming = events.filter((e) => {
    if (!e.datetime) return false
    const d = e.datetime.toDate()
    return d > now && d.toDateString() !== now.toDateString()
  })

  async function handleCreate() {
    if (!form.title || !form.datetime) return
    setSaving(true)
    try {
      await createEvent({
        title: form.title,
        company: form.company,
        datetime: Timestamp.fromDate(new Date(form.datetime)),
        duration: form.duration,
        type: form.type,
        attendees: form.attendees.split(',').map((s) => s.trim()).filter(Boolean),
      })
      toast.success('Evento criado.')
      setShowForm(false)
      setForm(emptyForm)
    } catch { toast.error('Erro ao criar evento.') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este evento?')) return
    try { await deleteEvent(id); toast.success('Evento removido.') }
    catch { toast.error('Erro ao remover.') }
  }

  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Shell
      title="Agenda"
      subtitle={dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Novo Evento
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : (
        <div className="animate-fade-in grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="card">
              <div className="px-5 py-4 border-b border-apple-gray-3 flex items-center gap-2">
                <Calendar size={16} className="text-apple-blue" />
                <p className="text-sm font-semibold text-apple-text">Hoje</p>
                <span className="badge badge-blue ml-auto text-[10px]">{today.length} eventos</span>
              </div>
              <div className="px-1">
                {today.length === 0 ? (
                  <p className="text-sm text-apple-text-4 text-center py-8">Nenhum evento hoje.</p>
                ) : today.map((e) => <EventCard key={e.id} event={e} onDelete={handleDelete} />)}
              </div>
            </div>

            {upcoming.length > 0 && (
              <div className="card">
                <div className="px-5 py-4 border-b border-apple-gray-3">
                  <p className="text-sm font-semibold text-apple-text">Próximos</p>
                </div>
                <div className="px-1">
                  {upcoming.map((e) => <EventCard key={e.id} event={e} onDelete={handleDelete} />)}
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <p className="text-xs text-apple-text-3 mb-3">Resumo da Semana</p>
            <div className="space-y-3">
              {Object.entries(typeConfig).map(([type, cfg]) => {
                const Icon = cfg.icon
                const count = events.filter((e) => e.type === type).length
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-apple-sm flex items-center justify-center', cfg.color)}>
                      <Icon size={14} strokeWidth={1.8} />
                    </div>
                    <p className="flex-1 text-xs font-medium text-apple-text">{cfg.label}</p>
                    <span className="text-sm font-semibold text-apple-text">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Novo Evento</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="form-label">Título *</label><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Nome do evento" /></div>
              <div><label className="form-label">Empresa/Cliente</label><input className="input" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Empresa" /></div>
              <div><label className="form-label">Data e Hora *</label><input type="datetime-local" className="input" value={form.datetime} onChange={(e) => setForm((f) => ({ ...f, datetime: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Duração</label><input className="input" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="30min" /></div>
                <div>
                  <label className="form-label">Tipo</label>
                  <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EventType }))}>
                    {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="form-label">Participantes (separados por vírgula)</label><input className="input" value={form.attendees} onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))} placeholder="João, Maria, Pedro" /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleCreate} disabled={!form.title || !form.datetime || saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <Loader2 size={13} className="animate-spin" />}
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
