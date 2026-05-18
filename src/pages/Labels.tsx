import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { useLabels } from '@/hooks/useLabels'
import { createLabel, updateLabel, deleteLabel } from '@/services/labels'
import { Tag, Plus, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Label } from '@/types'

const colorOptions = ['#0071E3', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FF2D55', '#FFD60A', '#86868B']

type FormState = { name: string; color: string }

export default function Labels() {
  const { labels, loading } = useLabels()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', color: colorOptions[0] })
  const [saving, setSaving] = useState(false)

  function openNew() { setForm({ name: '', color: colorOptions[0] }); setEditing(null); setShowForm(true) }
  function openEdit(l: Label) { setForm({ name: l.name, color: l.color }); setEditing(l.id); setShowForm(true) }

  async function save() {
    setSaving(true)
    try {
      if (editing) { await updateLabel(editing, form); toast.success('Etiqueta atualizada.') }
      else { await createLabel(form); toast.success('Etiqueta criada.') }
      setShowForm(false)
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir etiqueta "${name}"?`)) return
    try { await deleteLabel(id); toast.success('Etiqueta removida.') }
    catch { toast.error('Erro ao remover.') }
  }

  return (
    <Shell
      title="Etiquetas"
      subtitle="Organize conversas e contatos"
      actions={
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Nova Etiqueta
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : (
        <div className="animate-fade-in">
          {labels.length === 0 ? (
            <div className="card py-20 flex flex-col items-center gap-3 text-apple-text-4">
              <Tag size={36} strokeWidth={1.2} />
              <p className="text-sm">Nenhuma etiqueta criada.</p>
              <button onClick={openNew} className="btn-primary">Criar primeira</button>
            </div>
          ) : (
            <div className="card divide-y divide-apple-gray-3">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-apple-gray transition-colors">
                  <div className="w-8 h-8 rounded-apple-sm flex items-center justify-center" style={{ backgroundColor: label.color + '20' }}>
                    <Tag size={15} style={{ color: label.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                      <span className="text-sm font-medium text-apple-text">{label.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(label)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><Pencil size={13} /></button>
                    <button onClick={() => remove(label.id, label.name)} className="p-1.5 rounded-apple-sm hover:bg-apple-red/10 text-apple-red"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{editing ? 'Editar Etiqueta' : 'Nova Etiqueta'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><X size={16} /></button>
            </div>
            <label className="form-label">Nome *</label>
            <input className="input mb-4" placeholder="Nome da etiqueta" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <label className="form-label">Cor</label>
            <div className="flex gap-2 flex-wrap mb-4">
              {colorOptions.map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))} className={cn('w-7 h-7 rounded-full transition-all', form.color === c ? 'ring-2 ring-offset-2 ring-apple-text scale-110' : '')} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.name.trim() || saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
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
