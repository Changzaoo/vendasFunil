import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { useContacts } from '@/hooks/useContacts'
import { createContact, updateContact, deleteContact } from '@/services/contacts'
import { Search, Plus, Users, Mail, Phone, Building2, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import type { Contact } from '@/types'

const statusLabel: Record<Contact['status'], string> = { active: 'Ativo', inactive: 'Inativo', lead: 'Lead' }
const statusClass: Record<Contact['status'], string> = { active: 'badge-green', inactive: 'badge-gray', lead: 'badge-blue' }

type FormState = { name: string; email: string; phone: string; company: string; role: string; notes: string; status: Contact['status'] }
const emptyForm: FormState = { name: '', email: '', phone: '', company: '', role: '', notes: '', status: 'lead' }

export default function Contacts() {
  const { contacts, loading } = useContacts()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = contacts.filter((c) =>
    [c.name, c.email, c.company, c.role].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  )

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true) }
  function openEdit(c: Contact) {
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, role: c.role, notes: c.notes ?? '', status: c.status })
    setEditing(c.id); setShowForm(true)
  }

  async function save() {
    setSaving(true)
    try {
      if (editing) {
        await updateContact(editing, form)
        toast.success('Contato atualizado.')
      } else {
        await createContact(form)
        toast.success('Contato criado.')
      }
      setShowForm(false)
    } catch {
      toast.error('Erro ao salvar contato.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir ${name}?`)) return
    try {
      await deleteContact(id)
      toast.success('Contato removido.')
    } catch {
      toast.error('Erro ao remover contato.')
    }
  }

  return (
    <Shell
      title="Contatos"
      subtitle={loading ? 'Carregando...' : `${contacts.length} contatos`}
      actions={
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Novo Contato
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-apple-text-4" /></div>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-text-4" />
            <input className="input pl-9 bg-white shadow-apple border-0" placeholder="Buscar contatos..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <div className="card py-16 flex flex-col items-center gap-3 text-apple-text-4">
              <Users size={36} strokeWidth={1.2} />
              <p className="text-sm">{search ? 'Nenhum resultado' : 'Nenhum contato ainda'}</p>
              {!search && <button onClick={openNew} className="btn-primary mt-1">Adicionar contato</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <div key={c.id} className="card p-5 group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-apple-blue/10 flex items-center justify-center text-sm font-semibold text-apple-blue flex-shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-apple-text truncate">{c.name}</p>
                      <p className="text-xs text-apple-text-3 truncate">{c.role}</p>
                      <span className={cn('badge text-[10px] mt-1', statusClass[c.status])}>{statusLabel[c.status]}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><Pencil size={13} /></button>
                      <button onClick={() => remove(c.id, c.name)} className="p-1.5 rounded-apple-sm hover:bg-apple-red/10 text-apple-red"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-apple-text-3">
                      <Building2 size={12} className="text-apple-text-4 flex-shrink-0" />
                      <span className="truncate">{c.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-apple-text-3">
                      <Mail size={12} className="text-apple-text-4 flex-shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-apple-text-3">
                      <Phone size={12} className="text-apple-text-4 flex-shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                  {c.notes && (
                    <p className="mt-3 text-xs text-apple-text-4 bg-apple-gray rounded-apple-sm px-3 py-2 border border-apple-gray-3">
                      {c.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">{editing ? 'Editar Contato' : 'Novo Contato'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-apple-sm hover:bg-apple-gray-3 text-apple-text-3"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {([['Nome', 'name', true], ['E-mail', 'email', true], ['Empresa', 'company', true], ['Cargo', 'role', false], ['Telefone', 'phone', false]] as [string, keyof FormState, boolean][]).map(([label, key, required]) => (
                <div key={key}>
                  <label className="form-label">{label}{required ? ' *' : ''}</label>
                  <input className="input" value={String(form[key])} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={label} />
                </div>
              ))}
              <div>
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Contact['status'] }))}>
                  <option value="lead">Lead</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div>
                <label className="form-label">Notas</label>
                <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Observações..." />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.name || !form.email || !form.company || saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
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
