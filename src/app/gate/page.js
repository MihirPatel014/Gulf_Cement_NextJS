'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Lock, Clock, Key } from 'lucide-react';

export default function GatePage() {
    const { tokens, gateRecords, pinMap, verifyGateExit } = useAppStore();
    const [tokenInput, setTokenInput] = useState('');
    const [pinInput, setPinInput] = useState('');
    const [result, setResult] = useState(null);
    const [tab, setTab] = useState('verify');

    const handleVerify = () => {
        if (!tokenInput || !pinInput) { setResult({ success: false, reason: 'Enter both Token ID and PIN' }); return; }
        const res = verifyGateExit(tokenInput.toUpperCase(), pinInput);
        setResult(res);
        if (res.success) {
            setTimeout(() => { setTokenInput(''); setPinInput(''); }, 2000);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Gate Security Check</h1>
                <p className="page-subtitle">Verify token + SMS PIN for gate exit — no smartphone required</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card success">
                    <div><div className="kpi-label">Exits Today</div><div className="kpi-value">{gateRecords.filter((g) => g.status === 'Passed').length}</div></div>
                    <div className="kpi-icon success"><CheckCircle size={24} /></div>
                </div>
                <div className="kpi-card danger">
                    <div><div className="kpi-label">Rejected</div><div className="kpi-value">{gateRecords.filter((g) => g.status !== 'Passed').length}</div></div>
                    <div className="kpi-icon danger"><XCircle size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Vouchers Ready</div><div className="kpi-value">{tokens.filter((t) => t.stage === 'Voucher Ready').length}</div></div>
                    <div className="kpi-icon warning"><Key size={24} /></div>
                </div>
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Locked PINs</div><div className="kpi-value">{tokens.filter((t) => t.pinLocked).length}</div></div>
                    <div className="kpi-icon primary"><Lock size={24} /></div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'verify' ? 'active' : ''}`} onClick={() => setTab('verify')}>Gate Verification</button>
                <button className={`tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Gate Log</button>
                <button className={`tab ${tab === 'pins' ? 'active' : ''}`} onClick={() => setTab('pins')}>PIN Reference (Demo)</button>
            </div>

            {tab === 'verify' && (
                <div className="gate-screen">
                    <div className="gate-form">
                        <ShieldCheck size={48} style={{ color: 'var(--primary)', marginBottom: 16 }} />
                        <div className="gate-title">Gate Exit Verification</div>
                        <div className="gate-subtitle">Enter Token ID and 6-digit SMS PIN</div>
                        <div className="form-group">
                            <label className="form-label">Token ID</label>
                            <input type="text" className="form-input gate-input" placeholder="TK___" value={tokenInput}
                                onChange={(e) => { setTokenInput(e.target.value.toUpperCase()); setResult(null); }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">SMS PIN</label>
                            <input type="text" className="form-input gate-input" placeholder="______" maxLength={6} value={pinInput}
                                onChange={(e) => { setPinInput(e.target.value); setResult(null); }} />
                        </div>
                        <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleVerify}>
                            <ShieldCheck size={20} /> Verify & Open Gate
                        </button>
                        {result && (
                            <div className={`gate-result ${result.success ? 'success' : 'error'}`}>
                                {result.success ? (
                                    <><CheckCircle size={20} /> <strong>GATE OPEN</strong> — Vehicle cleared. Logged & customer notified.</>
                                ) : (
                                    <><AlertTriangle size={20} /> <strong>DENIED</strong> — {result.reason}</>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'log' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Gate ID</th><th>Token</th><th>Status</th><th>Verified At</th><th>Reason</th></tr></thead>
                        <tbody>
                            {gateRecords.map((g) => (
                                <tr key={g.id}>
                                    <td className="mono">{g.id}</td>
                                    <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{g.tokenId}</td>
                                    <td><span className={`badge ${getStatusColor(g.status)}`}>{g.status}</span></td>
                                    <td>{g.verifiedAt ? formatDateTime(g.verifiedAt) : '—'}</td>
                                    <td>{g.reason || <span style={{ color: 'var(--success)' }}>✓ Passed</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'pins' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">🔑 Demo PIN Reference</div>
                        <div className="card-subtitle">These PINs are displayed for demo purposes only</div>
                    </div>
                    <div className="table-container" style={{ border: 'none' }}>
                        <table className="table">
                            <thead><tr><th>Token</th><th>PIN</th><th>Status</th><th>Expiry</th><th>Attempts</th></tr></thead>
                            <tbody>
                                {tokens.slice(0, 10).map((t) => (
                                    <tr key={t.id}>
                                        <td className="mono" style={{ fontWeight: 700 }}>{t.id}</td>
                                        <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: 2 }}>{pinMap[t.id] || t.pin}</td>
                                        <td>
                                            <span className={`badge ${t.pinLocked ? 'danger' : new Date(t.pinExpiry) < new Date() ? 'warning' : 'success'}`}>
                                                {t.pinLocked ? 'Locked' : new Date(t.pinExpiry) < new Date() ? 'Expired' : 'Active'}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(t.pinExpiry)}</td>
                                        <td>{t.pinAttempts}/5</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
