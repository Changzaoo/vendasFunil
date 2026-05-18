import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { useSellers } from '@/hooks/useSellers'
import { createSeller, updateSeller, deleteSeller } from '@/services/sellers'
import { formatCurrency, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Mail, Phone, TrendingUp, Plus, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Seller } from '@/types'

type FormState = { name: string; email: string; phone: string; department: string; role: string; target: string }
const emptyForm: FormState = { name: '', email: '', phone: '', department: '', role: '', target: '' }

export default function Sellers() {
  const { sellers, loading } = useSellers()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true) }
  function openEdit(s: Seller) {
    setForm({ name: s.name, email: s.email, phone: s.phone, department: s.department, role: s.role, target: String(s.target) })
    setEditing(s.id); setShowForm(true)
  }

  async function save() {
    setSaving(true)
    try {
      const data = { name: form.name, email: form.email, phone: form.phone, department: form.department, role: form.role, target: Number(form.target) || 0 }
      if (editing) { await updateSeller(editing, data); toast.success('Vendedor atualizado.') }
      else { await createSeller(data); toast.success('Vendedor criado.') }
      setShowForm(false)
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir ${name}?`)) return
    try { await deleteSeller(id); toast.success('Vendedor removido.') }
    catch { toast.error('Erro ao remover.') }
  }

  return (
    <Shell
      title="Vendedores"
      subtitle={loading ? 'Carregando...' : `${sellers.length} membros`}
      actions={
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Novo Vendedor
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : sellers.length === 0 ? (
        <div className="card py-20 flex flex-col items-center gap-3 text-apple-text-4">
          <p className="text-sm">Nenhum vendedor cadastrado.</p>
          <button onClick={openNew} className="btn-primary">Adicionar vendedor</button>
        </div>
      ) : (
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
          {sellers.map((seller) => (
            <div key={seller.id} className="card p-5 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-apple-blue/10 flex items-center justify-center text-sm font-semibold text-apple-blue flex-shrink-0">
                  {getInitials(seller.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-apple-text">{seller.name}</p>
                  <p className="text-xs text-apple-text-3">{seller.role}{seller.department ? ` · ${seller.department}` : ''}</p>
                  <p className="flex items-center gap-1 text-xs text-apple-text-4 mt-1"><Mail size={11} />{seller.email}</p>
                  {seller.phone && <p className="flex items-center gap-1 text-xs text-apple-text-4"><Phone size={11} />{seller.phone}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(seller)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><Pencil size={13} /></button>
                  <button onClick={() => remove(seller.id, seller.name)} className="p-1.5 rounded-apple-sm hover:bg-apple-red/10 text-apple-red"><Trash2 size={13} /></button>
                </div>
              </div>
              {seller.target > 0 && (
                <div className="flex items-center gap-2 text-xs text-apple-text-4">
                  <TrendingUp size={12} />
                  Meta: {formatCurrency(seller.target)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">{editing ? 'Editar Vendedor' : 'Novo Vendedor'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {([['Nome *', 'name'], ['E-mail *', 'email'], ['Telefone', 'phone'], ['Departamento', 'department'], ['Cargo', 'role']] as [string, keyof FormState][]).map(([label, key]) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input className="input" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={label.replace(' *', '')} />
                </div>
              ))}
              <div>
                <label className="form-label">Meta Mensal (R$)</label>
                <input type="number" className="input" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.name || !form.email || saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
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
