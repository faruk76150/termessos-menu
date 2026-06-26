'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Search, GripVertical } from 'lucide-react';

interface Category { id: string; name_tr: string }
interface MenuItem {
  id: string; category_id: string; slug: string; name_tr: string; name_en: string;
  description_tr: string; description_en: string; price: number; image_url: string | null;
  is_active: boolean; is_featured: boolean; display_order: number;
}

const emptyItem = (): Omit<MenuItem, 'id'> => ({
  category_id: '', slug: '', name_tr: '', name_en: '', description_tr: '', description_en: '',
  price: 0, image_url: '', is_active: true, is_featured: false, display_order: 0,
});

export default function ItemsAdmin() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState<{ open: boolean; data: Partial<MenuItem> }>({ open: false, data: {} });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Drag state
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [itemsRes, catsRes] = await Promise.all([fetch('/api/items'), fetch('/api/categories')]);
    setItems(await itemsRes.json());
    setCategories(await catsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Drag disabled only when free-text search is active (indices would be ambiguous).
  // Category filter is fine — we reorder within the filtered subset.
  const canDrag = !search;

  function onDragStart(idx: number) { if (canDrag) dragIdx.current = idx; }

  function onDragOver(e: React.DragEvent, idx: number) {
    if (!canDrag) return;
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function onDrop(idx: number) {
    const from = dragIdx.current;
    if (!canDrag || from === null || from === idx) { resetDrag(); return; }

    // Reorder within the filtered subset
    const reorderedFiltered = [...filtered];
    const [moved] = reorderedFiltered.splice(from, 1);
    reorderedFiltered.splice(idx, 0, moved);

    // Assign new display_order within this subset
    const updatedSubset = reorderedFiltered.map((item, i) => ({ ...item, display_order: i + 1 }));

    // Merge back: replace matching items in the full list, keep the rest
    const subsetIds = new Set(updatedSubset.map((i) => i.id));
    const updatedAll = items
      .filter((i) => !subsetIds.has(i.id))
      .concat(updatedSubset)
      .sort((a, b) => {
        // Keep non-subset items in original relative order, subset items by new order
        if (subsetIds.has(a.id) && subsetIds.has(b.id)) return a.display_order - b.display_order;
        return 0;
      });

    setItems(updatedAll);
    resetDrag();
    persistOrder(updatedSubset);
  }

  function resetDrag() { dragIdx.current = null; setDragOverIdx(null); }

  async function persistOrder(ordered: MenuItem[]) {
    setSaveStatus('saving');
    const res = await fetch('/api/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ordered.map((i) => ({ id: i.id, display_order: i.display_order }))),
    });
    setSaveStatus(res.ok ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  function openNew() { setModal({ open: true, data: { ...emptyItem(), display_order: items.length + 1 } }); }
  function openEdit(i: MenuItem) { setModal({ open: true, data: { ...i } }); }
  function closeModal() { setModal({ open: false, data: {} }); }

  async function handleSave() {
    setSaving(true);
    const method = modal.data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/items', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modal.data),
    });
    setSaving(false);
    if (res.ok) { closeModal(); load(); }
    else { alert('Kayıt hatası: ' + (await res.json()).error); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/items?id=${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); load(); }
    else { alert('Silme hatası'); }
  }

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.name_tr.toLowerCase().includes(search.toLowerCase()) || i.name_en.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || i.category_id === filterCat;
    return matchSearch && matchCat;
  });

  function setField(key: keyof MenuItem, value: unknown) {
    setModal((m) => ({ ...m, data: { ...m.data, [key]: value } }));
  }

  const getCatName = (id: string) => categories.find((c) => c.id === id)?.name_tr || '—';

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-800">Ürünler</h1>
          <p className="text-stone-400 text-sm mt-0.5 flex items-center gap-2">
            {filtered.length} / {items.length} ürün
            {saveStatus === 'saving' && <span className="text-amber-500 text-xs">● Kaydediliyor...</span>}
            {saveStatus === 'saved' && <span className="text-green-500 text-xs">✓ Sıralama kaydedildi</span>}
            {saveStatus === 'error' && <span className="text-red-500 text-xs">✕ Kayıt hatası</span>}
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 transition">
          <Plus size={16} /> Yeni Ürün
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text" placeholder="Ürün ara..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
        </select>
      </div>

      {canDrag && (
        <p className="text-xs text-stone-400 mb-3 flex items-center gap-1">
          <GripVertical size={12} /> Sürükleyip bırakarak sıralamayı değiştirebilirsiniz
        </p>
      )}

      {loading ? (
        <div className="text-center py-16 text-stone-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                {canDrag && <th className="w-8 px-2 py-3" />}
                {['Kategori', 'Ad (TR)', 'Ad (EN)', 'Fiyat', 'Aktif', 'İşlem'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  draggable={canDrag}
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={() => onDrop(idx)}
                  onDragEnd={resetDrag}
                  className={`transition-colors ${
                    canDrag && dragOverIdx === idx ? 'bg-brand-50 border-t-2 border-brand-400' : 'hover:bg-stone-50'
                  } ${canDrag && dragIdx.current === idx ? 'opacity-40' : ''}`}
                >
                  {canDrag && (
                    <td className="px-2 py-2.5 text-stone-300 cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} />
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-xs text-stone-400">{getCatName(item.category_id)}</td>
                  <td className="px-4 py-2.5 font-medium text-stone-800">{item.name_tr}</td>
                  <td className="px-4 py-2.5 text-stone-500">{item.name_en}</td>
                  <td className="px-4 py-2.5 text-brand-700 font-semibold whitespace-nowrap">
                    {item.price.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-stone-300'}`} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><Pencil size={13} /></button>
                      {deleteId === item.id ? (
                        <div className="flex gap-1 items-center">
                          <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 font-semibold px-2 py-1 hover:bg-red-50 rounded">Evet</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs text-stone-500 px-2 py-1 hover:bg-stone-100 rounded">İptal</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-stone-800">{modal.data.id ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-stone-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Kategori</label>
                <select
                  value={modal.data.category_id || ''}
                  onChange={(e) => setField('category_id', e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Kategori Seç</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
                </select>
              </div>
              {[
                ['name_tr', 'Ad (Türkçe)'],
                ['name_en', 'Ad (İngilizce)'],
                ['slug', 'Slug'],
                ['description_tr', 'Açıklama (Türkçe)'],
                ['description_en', 'Açıklama (İngilizce)'],
                ['image_url', 'Görsel URL'],
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-stone-600 mb-1">{l}</label>
                  <input
                    type="text"
                    value={String(modal.data[k as keyof MenuItem] ?? '')}
                    onChange={(e) => setField(k as keyof MenuItem, e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Fiyat (₺)</label>
                <input
                  type="number" value={modal.data.price ?? 0}
                  onChange={(e) => setField('price', +e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-6 pt-1">
                {([['is_active', 'Aktif'], ['is_featured', 'Öne Çıkan']] as const).map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!modal.data[k]} onChange={(e) => setField(k, e.target.checked)} className="w-4 h-4 accent-amber-600" />
                    <span className="text-sm text-stone-600">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 border border-stone-300 text-stone-700 py-2 rounded-xl text-sm font-medium hover:bg-stone-50">İptal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-brand-700 text-white py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 disabled:opacity-60">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
