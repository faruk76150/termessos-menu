'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react';

interface Category {
  id: string; slug: string; name_tr: string; name_en: string;
  image_url: string | null; display_order: number; is_active: boolean; is_drink: boolean;
}

const empty: Omit<Category, 'id'> = {
  slug: '', name_tr: '', name_en: '', image_url: '', display_order: 0, is_active: true, is_drink: false,
};

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Category> }>({ open: false, data: {} });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'categories');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.url) {
        setField('image_url', data.url);
      }
    } catch (err) {
      console.error(err);
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function onDragStart(idx: number) {
    dragIdx.current = idx;
  }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function onDrop(idx: number) {
    const from = dragIdx.current;
    if (from === null || from === idx) { resetDrag(); return; }

    const reordered = [...categories];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(idx, 0, moved);
    // Update display_order to match new positions
    const updated = reordered.map((c, i) => ({ ...c, display_order: i + 1 }));
    setCategories(updated);
    resetDrag();
    persistOrder(updated);
  }

  function resetDrag() {
    dragIdx.current = null;
    setDragOverIdx(null);
  }

  async function persistOrder(items: Category[]) {
    setSaveStatus('saving');
    const res = await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items.map((c) => ({ id: c.id, display_order: c.display_order }))),
    });
    setSaveStatus(res.ok ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function openNew() { setModal({ open: true, data: { ...empty, display_order: categories.length + 1 } }); }
  function openEdit(c: Category) { setModal({ open: true, data: { ...c } }); }
  function closeModal() { setModal({ open: false, data: {} }); }

  async function handleSave() {
    setSaving(true);
    const method = modal.data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/categories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modal.data),
    });
    setSaving(false);
    if (res.ok) { closeModal(); load(); }
    else { alert('Kayıt hatası: ' + (await res.json()).error); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); load(); }
    else { alert('Silme hatası'); }
  }

  function setField(key: keyof Omit<Category, 'id'>, value: unknown) {
    setModal((m) => ({ ...m, data: { ...m.data, [key]: value } }));
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-800">Kategoriler</h1>
          <p className="text-stone-600 text-sm mt-0.5 flex items-center gap-2">
            {categories.length} kategori
            {saveStatus === 'saving' && <span className="text-amber-500 text-xs">● Kaydediliyor...</span>}
            {saveStatus === 'saved' && <span className="text-green-500 text-xs">✓ Sıralama kaydedildi</span>}
            {saveStatus === 'error' && <span className="text-red-500 text-xs">✕ Kayıt hatası</span>}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 transition"
        >
          <Plus size={16} /> Yeni Kategori
        </button>
      </div>

      <p className="text-xs text-stone-500 mb-3 flex items-center gap-1">
        <GripVertical size={12} /> Satırları sürükleyip bırakarak sıralamayı değiştirebilirsiniz
      </p>

      {loading ? (
        <div className="text-center py-16 text-stone-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="w-8 px-2 py-3" />
                {['#', 'Ad (TR)', 'Ad (EN)', 'İçecek', 'Aktif', 'İşlem'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((c, idx) => (
                <tr
                  key={c.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={() => onDrop(idx)}
                  onDragEnd={resetDrag}
                  className={`transition-colors ${
                    dragOverIdx === idx ? 'bg-brand-50 border-t-2 border-brand-400' : 'hover:bg-stone-50'
                  } ${dragIdx.current === idx ? 'opacity-40' : ''}`}
                >
                  <td className="px-2 py-3 text-stone-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                  </td>
                  <td className="px-4 py-3 text-stone-600 font-medium text-xs w-8">{c.display_order}</td>
                  <td className="px-4 py-3 font-medium text-stone-800">{c.name_tr}</td>
                  <td className="px-4 py-3 text-stone-600">{c.name_en}</td>
                  <td className="px-4 py-3">
                    {c.is_drink
                      ? <Check size={14} className="text-green-500" />
                      : <X size={14} className="text-stone-300" />}
                  </td>
                  <td className="px-4 py-3">
                    {c.is_active
                      ? <Check size={14} className="text-green-500" />
                      : <X size={14} className="text-stone-300" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
                        <Pencil size={14} />
                      </button>
                      {deleteId === c.id ? (
                        <div className="flex gap-1 items-center">
                          <button onClick={() => handleDelete(c.id)} className="text-xs text-red-600 font-semibold px-2 py-1 hover:bg-red-50 rounded">Evet</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs text-stone-500 px-2 py-1 hover:bg-stone-100 rounded">İptal</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-stone-800">
                {modal.data.id ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-stone-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Ad (Türkçe)</label>
                <input
                  type="text"
                  value={modal.data.name_tr ?? ''}
                  onChange={(e) => setField('name_tr', e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Ad (İngilizce)</label>
                <input
                  type="text"
                  value={modal.data.name_en ?? ''}
                  onChange={(e) => setField('name_en', e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Slug</label>
                <input
                  type="text"
                  value={modal.data.slug ?? ''}
                  onChange={(e) => setField('slug', e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Görsel (Upload veya URL)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={modal.data.image_url ?? ''}
                    onChange={(e) => setField('image_url', e.target.value)}
                    className="flex-1 border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <label className="bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center justify-center text-stone-700 select-none">
                    {uploading ? 'Yükleniyor...' : 'Görsel Seç'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {modal.data.image_url && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                    <Image
                      src={modal.data.image_url}
                      alt="Önizleme"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setField('image_url', '')}
                      className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 hover:bg-black transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-6 pt-1">
                {([['is_drink', 'İçecek'], ['is_active', 'Aktif']] as const).map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!modal.data[k]}
                      onChange={(e) => setField(k, e.target.checked)}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <span className="text-sm text-stone-600">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 border border-stone-300 text-stone-700 py-2 rounded-xl text-sm font-medium hover:bg-stone-50">
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 bg-brand-700 text-white py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
