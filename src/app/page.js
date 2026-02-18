'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { ROLES, ROLE_LABELS, ROLE_DASHBOARDS, CUSTOMER_ACCOUNTS } from '@/lib/constants';
import {
  ShoppingCart, ClipboardCheck, Ticket, Truck, Scale,
  ShieldCheck, FileText, Settings, User, Lock, Building2,
} from 'lucide-react';

const ROLE_ICONS = {
  [ROLES.CUSTOMER]: ShoppingCart,
  [ROLES.DISPATCH_AUTHORITY]: ClipboardCheck,
  [ROLES.COMMAND_CONTROL_ROOM]: Ticket,
  [ROLES.TRANSPORT_MANAGER]: Truck,
  [ROLES.WEIGHBRIDGE_OPERATOR]: Scale,
  [ROLES.GATE_SECURITY]: ShieldCheck,
  [ROLES.FINANCE_ACCOUNTS]: FileText,
  [ROLES.SYSTEM_ADMIN]: Settings,
};

export default function LoginPage() {
  const router = useRouter();
  const { login, customerLogin } = useAppStore();
  const [email, setEmail] = useState('admin@gulfcement.ae');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState('staff'); // staff | customer

  const handleQuickLogin = (role) => {
    if (role === ROLES.CUSTOMER) {
      // Quick login as first customer account
      const acc = CUSTOMER_ACCOUNTS[0];
      login(ROLES.CUSTOMER, acc.name, acc.id);
      router.push('/customer/dashboard');
    } else {
      login(role, ROLE_LABELS[role]);
      router.push(ROLE_DASHBOARDS[role]);
    }
  };

  const handleStaffLogin = () => {
    login(ROLES.SYSTEM_ADMIN, 'System Admin');
    router.push('/dashboard');
  };

  const handleCustomerLogin = () => {
    setError('');
    const result = customerLogin(email, password);
    if (result.success) {
      router.push('/customer/dashboard');
    } else {
      setError(result.reason);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="#0B3D91" />
            <path d="M16 48V32L32 16L48 32V48H36V36H28V48H16Z" fill="white" />
          </svg>
          <h1>Gulf Cement</h1>
          <p>Digital Dispatch & Command Control Platform</p>
        </div>

        {/* Login Mode Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '4px' }}>
          <button
            onClick={() => setLoginMode('staff')}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius)',
              background: loginMode === 'staff' ? 'var(--primary)' : 'transparent',
              color: loginMode === 'staff' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s',
            }}
          >
            <Settings size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Staff Login
          </button>
          <button
            onClick={() => { setLoginMode('customer'); setEmail('habtoor@company.ae'); }}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius)',
              background: loginMode === 'customer' ? 'var(--primary)' : 'transparent',
              color: loginMode === 'customer' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s',
            }}
          >
            <Building2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Customer Portal
          </button>
        </div>

        {loginMode === 'customer' && (
          <>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="customer@company.ae" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Lock size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', fontWeight: 500 }}>{error}</div>}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={handleCustomerLogin}>
              <Building2 size={18} /> Sign In to Portal
            </button>

            <div className="login-divider">Demo Customer Accounts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CUSTOMER_ACCOUNTS.map((acc) => (
                <button key={acc.id} className="quick-role-btn" onClick={() => { login(ROLES.CUSTOMER, acc.name, acc.id); router.push('/customer/dashboard'); }}>
                  <Building2 size={14} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{acc.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {loginMode === 'staff' && (
          <>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="admin@gulfcement.ae" defaultValue="admin@gulfcement.ae" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" className="form-input" placeholder="••••••••" defaultValue="demo1234" />
                <Lock size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={handleStaffLogin}>
              <User size={18} /> Sign In
            </button>

            <div className="login-divider">Quick Demo Access</div>

            <div className="quick-roles">
              {Object.values(ROLES).map((role) => {
                const Icon = ROLE_ICONS[role];
                return (
                  <button key={role} className="quick-role-btn" onClick={() => handleQuickLogin(role)}>
                    <Icon size={16} />
                    {ROLE_LABELS[role]}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
