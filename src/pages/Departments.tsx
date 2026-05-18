import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { useDepartments } from '@/hooks/useDepartments'
import { createDepartment, updateDepartment, deleteDepartment } from '@/services/departments'
import { Building2, Plus, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Department } from '@/types'

const colorOptions = ['#0071E3', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FF2D55', '#86868B']

type FormState = { name: string; color: string }

export default function Departments() {
  const { departments, loading } = useDepartments()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', color: colorOptions[0] })
  const [saving, setSaving] = useState(false)

  function openNew() { setForm({ name: '', color: colorOptions[0] }); setEditing(null); setShowForm(true) }
  function openEdit(d: Department) { setForm({ name: d.name, color: d.color }); setEditing(d.id); setShowForm(true) }

  async function save() {
    setSaving(true)
    try {
      if (editing) { await updateDepartment(editing, form); toast.success('Departamento atualizado.') }
      else { await createDepartment(form); toast.success('Departamento criado.') }
      setShowForm(false)
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir ${name}?`)) return
    try { await deleteDepartment(id); toast.success('Departamento removido.') }
    catch { toast.error('Erro ao remover.') }
  }

  return (
    <Shell
      title="Departamentos"
      subtitle={loading ? 'Carregando...' : `${departments.length} departamentos`}
      actions={
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Novo Departamento
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : departments.length === 0 ? (
        <div className="card py-20 flex flex-col items-center gap-3 text-apple-text-4">
          <Building2 size={36} strokeWidth={1.2} />
          <p className="text-sm">Nenhum departamento criado.</p>
          <button onClick={openNew} className="btn-primary">Criar primeiro</button>
        </div>
      ) : (
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="card p-5 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-apple-sm flex items-center justify-center" style={{ backgroundColor: dept.color + '20' }}>
                    <Building2 size={18} style={{ color: dept.color }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-apple-text">{dept.name}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><Pencil size={13} /></button>
                  <button onClick={() => remove(dept.id, dept.name)} className="p-1.5 rounded-apple-sm hover:bg-apple-red/10 text-apple-red"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{editing ? 'Editar Departamento' : 'Novo Departamento'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><X size={16} /></button>
            </div>
            <label className="form-label">Nome *</label>
            <input className="input mb-4" placeholder="Ex: Comercial" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
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
