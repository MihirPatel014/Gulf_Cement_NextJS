'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { MapPin, CheckCircle, Shield, AlertTriangle, Clock, Lock, KeyRound, FileCheck } from 'lucide-react';

export default function DeliveryPage() {
    const { tokens, otpRecords, verifyDeliveryOTP } = useAppStore();
    const [tab, setTab] = useState('verify');
    const [tokenInput, setTokenInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [result, setResult] = useState(null);

    const arrivedTokens = tokens.filter((t) => t.stage === 'Arrived');
    const deliveredTokens = tokens.filter((t) => t.stage === 'Delivered');
    const pendingOTPs = otpRecords.filter((o) => o.status === 'Pending');
    const verifiedOTPs = otpRecords.filter((o) => o.status === 'Verified');

    const handleVerify = () => {
        if (!tokenInput || !otpInput) { setResult({ success: false, reason: 'Enter Token ID, OTP, and receiver name' }); return; }
        const res = verifyDeliveryOTP(tokenInput.toUpperCase(), otpInput, receiverName || 'Receiver');
        setResult(res);
        if (res.success) { setTimeout(() => { setTokenInput(''); setOtpInput(''); setReceiverName(''); }, 2000); }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Delivery Confirmation</h1>
                <p className="page-subtitle">OTP-verified delivery with digital signatures and ePOD</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Pending OTP</div><div className="kpi-value">{pendingOTPs.length}</div></div>
                    <div className="kpi-icon warning"><Clock size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Verified</div><div className="kpi-value">{verifiedOTPs.length}</div></div>
                    <div className="kpi-icon success"><CheckCircle size={24} /></div>
                </div>
                <div className="kpi-card danger">
                    <div><div className="kpi-label">Expired/Locked</div><div className="kpi-value">{otpRecords.filter((o) => ['Expired', 'Locked'].includes(o.status)).length}</div></div>
                    <div className="kpi-icon danger"><Lock size={24} /></div>
                </div>
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Flagged</div><div className="kpi-value">{otpRecords.filter((o) => o.status === 'Flagged').length}</div></div>
                    <div className="kpi-icon primary"><AlertTriangle size={24} /></div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'verify' ? 'active' : ''}`} onClick={() => setTab('verify')}>OTP Verification</button>
                <button className={`tab ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>All OTP Records</button>
                <button className={`tab ${tab === 'epod' ? 'active' : ''}`} onClick={() => setTab('epod')}>ePOD / Documents</button>
            </div>

            {tab === 'verify' && (
                <div className="gate-screen">
                    <div className="gate-form">
                        <Shield size={48} style={{ color: 'var(--primary)', marginBottom: 16 }} />
                        <div className="gate-title">OTP Delivery Verification</div>
                        <div className="gate-subtitle">Enter OTP sent to customer to confirm delivery</div>
                        <div className="form-group">
                            <label className="form-label">Token ID</label>
                            <input type="text" className="form-input gate-input" placeholder="TK___" value={tokenInput}
                                onChange={(e) => { setTokenInput(e.target.value.toUpperCase()); setResult(null); }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Delivery OTP</label>
                            <input type="text" className="form-input gate-input" placeholder="______" maxLength={6} value={otpInput}
                                onChange={(e) => { setOtpInput(e.target.value); setResult(null); }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Receiver Name</label>
                            <input type="text" className="form-input" placeholder="Name of person receiving goods" value={receiverName}
                                onChange={(e) => setReceiverName(e.target.value)} />
                        </div>
                        <button className="btn btn-success btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleVerify}>
                            <CheckCircle size={20} /> Confirm Delivery
                        </button>
                        {result && (
                            <div className={`gate-result ${result.success ? 'success' : 'error'}`}>
                                {result.success ? (
                                    <><CheckCircle size={20} /> <strong>DELIVERY CONFIRMED</strong> — Documents digitally signed via OTP.</>
                                ) : (
                                    <><AlertTriangle size={20} /> <strong>FAILED</strong> — {result.reason}</>
                                )}
                            </div>
                        )}

                        {/* Demo OTP Reference */}
                        {arrivedTokens.length > 0 && (
                            <div style={{ marginTop: 20, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: 12, textAlign: 'left' }}>
                                <strong>Demo OTPs:</strong>
                                {otpRecords.filter((o) => o.status === 'Pending').slice(0, 3).map((o) => (
                                    <div key={o.id} style={{ marginTop: 4 }}>{o.tokenId}: <code style={{ background: 'var(--primary-bg)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{o.otp}</code></div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'records' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>OTP ID</th><th>Token</th><th>Order</th><th>OTP</th><th>Status</th><th>Sent</th><th>Verified</th><th>Attempts</th><th>Receiver</th><th>Geo-Fence</th></tr></thead>
                        <tbody>
                            {otpRecords.map((otp) => (
                                <tr key={otp.id}>
                                    <td className="mono">{otp.id}</td>
                                    <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{otp.tokenId}</td>
                                    <td className="mono">{otp.orderId}</td>
                                    <td className="mono" style={{ letterSpacing: 2 }}>{otp.otp}</td>
                                    <td><span className={`badge ${getStatusColor(otp.status)}`}>{otp.status}</span></td>
                                    <td>{formatDateTime(otp.sentAt)}</td>
                                    <td>{otp.verifiedAt ? formatDateTime(otp.verifiedAt) : '—'}</td>
                                    <td>{otp.attempts}/5</td>
                                    <td>{otp.receiverName || '—'}</td>
                                    <td>{otp.geoFenceOk == null ? '—' : otp.geoFenceOk ? <span className="badge success">✓ OK</span> : <span className="badge danger">✗ Outside</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'epod' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                    {deliveredTokens.slice(0, 6).map((token) => {
                        const otp = otpRecords.find((o) => o.tokenId === token.id && o.status === 'Verified');
                        return (
                            <div key={token.id} className="card">
                                <div className="card-header">
                                    <div className="card-title"><FileCheck size={16} /> ePOD — {token.id}</div>
                                    <span className="badge success">Signed</span>
                                </div>
                                <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Customer</span><strong>{token.customerName}</strong></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Product</span><strong>{token.product}</strong></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Receiver</span><strong>{otp?.receiverName || 'N/A'}</strong></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>OTP Verified</span><strong>{otp?.verifiedAt ? formatDateTime(otp.verifiedAt) : 'N/A'}</strong></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>GPS</span><strong>{otp?.gpsLat?.toFixed(4)}, {otp?.gpsLng?.toFixed(4)}</strong></div>
                                </div>
                                <div className="voucher-stamp" style={{ marginTop: 12 }}>
                                    <div className="voucher-stamp-text">✓ Digitally Signed via OTP on {otp?.verifiedAt ? formatDateTime(otp.verifiedAt) : 'N/A'}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
