'use client';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const FIELDS: { key: string; label: string }[] = [
  { key: 'restaurant_name',     label: 'Restoran Adı' },
  { key: 'restaurant_tagline',  label: 'Alt Başlık' },
  { key: 'restaurant_location', label: 'Konum' },
  { key: 'restaurant_hours',    label: 'Çalışma Saatleri' },
  { key: 'restaurant_phone',    label: 'Telefon' },
  { key: 'restaurant_email',    label: 'E-posta' },
  { key: 'food_section_label_tr',    label: 'Yiyecek Bölüm Başlığı (TR)' },
  { key: 'food_section_label_en',    label: 'Yiyecek Bölüm Başlığı (EN)' },
  { key: 'drinks_section_label_tr',  label: 'İçecek Bölüm Başlığı (TR)' },
  { key: 'drinks_section_label_en',  label: 'İçecek Bölüm Başlığı (EN)' },
];

export default function SettingsAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { setValues(d); setLoading(false); });
  }, []);

  async function handleSave() {
    setStatus('saving');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setStatus(res.ok ? 'saved' : 'error');
    setTimeout(() => setStatus('idle'), 2500);
  }

  return (
    <div className="p-6 sm:p-8 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-800">Ayarlar</h1>
          <p className="text-stone-400 text-sm mt-0.5">Restoran bilgileri ve menü etiketleri</p>
        </div>
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 disabled:opacity-60 transition"
        >
          <Save size={15} />
          {status === 'saving' ? 'Kaydediliyor...' : status === 'saved' ? '✓ Kaydedildi' : 'Kaydet'}
        </button>
      </div>

      {loading ? (
        <div className="text-stone-400 py-16 text-center">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">{label}</label>
              <input
                type="text"
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-stone-800"
              />
            </div>
          ))}
          {status === 'error' && (
            <p className="text-red-500 text-xs pt-1">Kayıt sırasında bir hata oluştu.</p>
          )}
        </div>
      )}
    </div>
  );
}
