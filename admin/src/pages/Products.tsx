import { useEffect, useState } from 'react'
import { adminApi } from '../api/client'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const CATEGORIES = ['pdf', 'notes', 'interview-notes', 'company-specific'] as const
const PRESET_COLORS = [
  'from-blue-500 to-cyan-500', 'from-purple-500 to-indigo-500', 'from-yellow-500 to-orange-500',
  'from-cyan-500 to-blue-500', 'from-emerald-500 to-teal-500', 'from-sky-500 to-blue-500',
  'from-red-500 to-rose-500', 'from-pink-500 to-rose-500', 'from-amber-500 to-yellow-500',
  'from-violet-500 to-purple-500', 'from-blue-600 to-blue-800', 'from-orange-500 to-amber-600',
  'from-blue-500 to-indigo-600', 'from-green-500 to-emerald-600', 'from-slate-500 to-slate-600',
]
const EMOJIS = ['📄', '📝', '🎤', '🏢', '📚', '📖', '⭐', '🎯', '🔥', '💡', '📘', '📙', '📕', '📗']

const defaultForm = {
  title: '', description: '', category: 'pdf' as string, priceType: 'free' as string,
  priceAmount: 0, priceLabel: '', icon: '📄', color: 'from-blue-500 to-cyan-500',
  tags: '', popular: false, pages: 0, author: '',
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...defaultForm })

  const fetch = () => {
    setLoading(true)
    adminApi.getProducts().then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const resetForm = () => { setForm({ ...defaultForm }); setEditId(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const price = form.priceType === 'free' ? 'free' : { amount: form.priceAmount, label: form.priceLabel || `₹${form.priceAmount}` }
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const data = {
        title: form.title, description: form.description, category: form.category,
        price, icon: form.icon, color: form.color, tags,
        popular: form.popular, pages: form.pages || undefined, author: form.author || undefined,
      }
      if (editId) {
        await adminApi.updateProduct(editId, data)
        toast.success('Product updated')
      } else {
        await adminApi.addProduct(data)
        toast.success('Product added')
      }
      setShowForm(false); resetForm(); fetch()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try { await adminApi.deleteProduct(id); toast.success('Deleted'); fetch() }
    catch { toast.error('Failed') }
  }

  const handleEdit = (p: any) => {
    const isFree = p.price === 'free'
    setForm({
      title: p.title, description: p.description || '', category: p.category,
      priceType: isFree ? 'free' : 'paid',
      priceAmount: isFree ? 0 : p.price.amount,
      priceLabel: isFree ? '' : p.price.label,
      icon: p.icon, color: p.color, tags: (p.tags || []).join(', '),
      popular: !!p.popular, pages: p.pages || 0, author: p.author || '',
    })
    setEditId(p.id); setShowForm(true)
  }

  const priceDisplay = (p: any) => p.price === 'free' ? 'Free' : p.price.label

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop Products</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" required value={form.title} onChange={e => set('title', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input type="text" value={form.author} onChange={e => set('author', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
              <select value={form.priceType} onChange={e => set('priceType', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {form.priceType === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input type="number" min={1} value={form.priceAmount} onChange={e => set('priceAmount', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => set('icon', e)} className={`w-8 h-8 flex items-center justify-center rounded-lg border ${form.icon === e ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('color', c)} className={`w-8 h-8 rounded-lg bg-gradient-to-r ${c} ${form.color === c ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="dsa, algorithms" className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.popular} onChange={e => set('popular', e.target.checked)} className="rounded" />
                Popular
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                <input type="number" min={0} value={form.pages} onChange={e => set('pages', Number(e.target.value))} className="w-24 px-3 py-2 rounded-xl border border-gray-200" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add'} Product</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Icon</th>
              <th className="text-left px-6 py-3 font-medium">Title</th>
              <th className="text-left px-6 py-3 font-medium">Category</th>
              <th className="text-left px-6 py-3 font-medium">Price</th>
              <th className="text-left px-6 py-3 font-medium">Tags</th>
              <th className="text-right px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-sm inline-flex`}>{p.icon}</span></td>
                <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                <td className="px-6 py-4 text-gray-500">{p.category}</td>
                <td className="px-6 py-4 text-gray-500">{priceDisplay(p)}</td>
                <td className="px-6 py-4 text-gray-500">{p.tags?.slice(0, 2).join(', ')}{p.tags?.length > 2 ? '...' : ''}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && <p className="text-center py-8 text-gray-400">No products yet.</p>}
      </div>
    </div>
  )
}
