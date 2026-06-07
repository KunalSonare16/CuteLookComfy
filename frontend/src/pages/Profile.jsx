import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, fetchMe, logout } = useAuth();
  const [editing, setEditing] = useState(false);

  // Refresh user from backend on mount to pick up any role changes
  useEffect(() => { fetchMe(); }, [fetchMe]);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  // Change password
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('New passwords do not match'); return; }
    setPwSaving(true);
    try {
      await authAPI.changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) logout();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile(form);
      await fetchMe();
      setEditing(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '40px' }}
        >
          Your Profile
        </motion.h1>

        <div style={{ border: '1px solid var(--border)', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text)', margin: 0 }}>
              Account Details
            </h2>
            {!editing && (
              <button onClick={() => { setEditing(true); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)' }}>
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setEditing(false)} style={{ padding: '10px 24px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                ['Name', user?.name],
                ['Email', user?.email],
                ['Phone', user?.phone || '—'],
                ['Role', user?.role],
                ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div style={{ border: '1px solid var(--border)', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pwOpen ? '24px' : 0 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text)', margin: 0 }}>
              Password
            </h2>
            {!pwOpen && (
              <button onClick={() => setPwOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)' }}>
                {user?.hasPassword ? 'Change' : 'Set Password'}
              </button>
            )}
          </div>

          {pwOpen && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!user?.hasPassword && (
                <p style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Your account was created with Google sign-in. Set a password here to also log in with email + password.
                </p>
              )}
              {(user?.hasPassword
                ? [['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']]
                : [['newPassword', 'New Password'], ['confirm', 'Confirm New Password']]
              ).map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={pwForm[key]} required
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '10px 44px 10px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '14px', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <button type="button" onClick={() => setShowPw(s => !s)} title={showPw ? 'Hide' : 'Show'}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: 'var(--text-muted)' }}>
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={pwSaving} style={{ padding: '10px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{pwSaving ? 'Saving…' : 'Update Password'}</button>
                <button type="button" onClick={() => { setPwOpen(false); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); }} style={{ padding: '10px 24px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div style={{ padding: '20px 24px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>Sign Out</div>
            <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>You can always sign back in</div>
          </div>
          <button onClick={handleSignOut} style={{ padding: '10px 20px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
