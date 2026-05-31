import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminAPI.getSettings(),
    select: d => d.data.data,
  });

  useEffect(() => {
    if (settings) {
      // Backend returns { key: value } map — use directly
      if (Array.isArray(settings)) {
        const obj = {};
        settings.forEach(s => { obj[s.key] = s.value; });
        setForm(obj);
      } else {
        setForm(settings);
      }
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Backend expects { key: value } map, not array
      await adminAPI.updateSettings(form);
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings saved');
    } catch { toast.error('Could not save settings'); }
    finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none' };
  const labelStyle = { fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

  const SETTING_GROUPS = [
    {
      title: 'Store',
      keys: ['store_name', 'store_email', 'store_phone', 'store_currency'],
    },
    {
      title: 'Shipping',
      keys: ['free_shipping_threshold', 'standard_shipping_cost'],
    },
    {
      title: 'Orders',
      keys: ['max_return_days', 'order_prefix'],
    },
  ];

  return (
    <AdminLayout title="Settings">
      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '640px' }}>
            {SETTING_GROUPS.map(group => (
              <div key={group.title} style={{ border: '1px solid var(--border)', padding: '24px' }}>
                <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>{group.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {group.keys.filter(k => form[k] !== undefined).map(key => (
                    <div key={key}>
                      <label style={labelStyle}>{key.replace(/_/g, ' ')}</label>
                      <input
                        style={inputStyle}
                        value={form[key] || ''}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = 'var(--text)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button type="submit" disabled={saving} style={{ padding: '14px 32px', background: saving ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
