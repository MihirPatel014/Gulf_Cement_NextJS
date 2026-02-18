'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { ZONES } from '@/lib/constants';
import { formatDateTime, getTimeDiff, getStatusColor } from '@/lib/utils';
import { Ticket, MapPin, Factory, Scale, Clock, AlertTriangle, CheckCircle, Send, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ControlRoomPage() {
    const { orders, tokens, createToken, allocateZone } = useAppStore();
    const [tab, setTab] = useState('board');
    const [allocateModal, setAllocateModal] = useState(null);
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedLP, setSelectedLP] = useState('');

    const approvedOrders = orders.filter((o) => o.status === 'Approved');
    const activeTokens = tokens.filter((t) => !['Delivered'].includes(t.stage));

    const handleCreateToken = (orderId) => {
        const result = createToken(orderId);
        if (result) alert(`Token ${result.tokenId} created!\nGate PIN: ${result.pin}\nSMS sent to driver.`);
    };

    const handleAllocate = () => {
        if (allocateModal && selectedZone && selectedLP) {
            allocateZone(allocateModal.id, selectedZone, selectedLP);
            const zone = ZONES.find((z) => z.id === selectedZone);
            const lp = zone?.loadingPoints.find((l) => l.id === selectedLP);
            alert(`${allocateModal.id} → ${zone?.name} → ${lp?.name} → ${zone?.weighbridge.name}\nSMS sent to driver.`);
            setAllocateModal(null);
            setSelectedZone('');
            setSelectedLP('');
        }
    };

    const stageColors = {
        'Token Issued': 'info', 'Zone Assigned': 'primary', 'Loading': 'warning',
        'Weighing': 'warning', 'Voucher Ready': 'success', 'Gate Out': 'success',
        'In Transit': 'info', 'Arrived': 'success', 'Delivered': 'muted',
    };

    const tatData = [
        { stage: 'Token→Zone', avg: 8 }, { stage: 'Zone→Load', avg: 15 },
        { stage: 'Load→Weigh', avg: 22 }, { stage: 'Weigh→Gate', avg: 10 },
        { stage: 'Gate→Deliver', avg: 45 },
    ];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Command Control Room</h1>
                <p className="page-subtitle">Token management, zone allocation, and real-time operations board</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Active Tokens</div><div className="kpi-value">{activeTokens.length}</div></div>
                    <div className="kpi-icon primary"><Ticket size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Awaiting Allocation</div><div className="kpi-value">{tokens.filter((t) => t.stage === 'Token Issued').length}</div></div>
                    <div className="kpi-icon warning"><MapPin size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">In Loading</div><div className="kpi-value">{tokens.filter((t) => t.stage === 'Loading').length}</div></div>
                    <div className="kpi-icon success"><Factory size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">Avg TAT</div><div className="kpi-value">2h 34m</div></div>
                    <div className="kpi-icon info"><Clock size={24} /></div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'board' ? 'active' : ''}`} onClick={() => setTab('board')}>Control Board</button>
                <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>Create Token ({approvedOrders.length})</button>
                <button className={`tab ${tab === 'mis' ? 'active' : ''}`} onClick={() => setTab('mis')}>CCR MIS</button>
            </div>

            {tab === 'board' && (
                <div className="control-board">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Token</th><th>Truck</th><th>Customer</th><th>Product</th>
                                    <th>Zone</th><th>LP</th><th>WB</th><th>Stage</th><th>Timer</th><th>Alerts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tokens.map((token) => (
                                    <tr key={token.id}>
                                        <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{token.id}</td>
                                        <td className="mono">{token.truckNumber}</td>
                                        <td>{token.customerName}</td>
                                        <td>{token.product}</td>
                                        <td>{token.zone || <button className="btn btn-primary btn-sm" onClick={() => setAllocateModal(token)}><MapPin size={12} /> Assign</button>}</td>
                                        <td>{token.loadingPoint || '—'}</td>
                                        <td>{token.weighbridge || '—'}</td>
                                        <td><span className={`badge ${stageColors[token.stage] || 'muted'}`}>{token.stage}</span></td>
                                        <td className="timer-cell">{token.createdAt ? getTimeDiff(token.createdAt, new Date().toISOString()) : '—'}</td>
                                        <td>{token.alerts.length > 0 ? (
                                            <span className="alert-cell"><AlertTriangle size={14} /> {token.alerts[0]}</span>
                                        ) : <span style={{ color: 'var(--success)' }}><CheckCircle size={14} /></span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'create' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Transport</th><th>Actions</th></tr></thead>
                        <tbody>
                            {approvedOrders.length === 0 ? (
                                <tr><td colSpan={6}><div className="empty-state"><CheckCircle size={32} /><h3>No approved orders awaiting tokens</h3></div></td></tr>
                            ) : approvedOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="mono">{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.product.name || order.product}</td>
                                    <td>{order.quantity}</td>
                                    <td><span className={`badge ${order.transportOption === 'own' ? 'warning' : 'info'}`}>{order.transportOption}</span></td>
                                    <td><button className="btn btn-primary btn-sm" onClick={() => handleCreateToken(order.id)}><Ticket size={14} /> Create Token</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'mis' && (
                <div className="grid-2">
                    <div className="card">
                        <div className="card-header"><div className="card-title">Average TAT by Stage (min)</div></div>
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <BarChart data={tatData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="avg" fill="#0B3D91" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header"><div className="card-title">Zone & WB Utilization</div></div>
                        <div style={{ padding: 16 }}>
                            {ZONES.map((zone) => {
                                const zoneTokens = tokens.filter((t) => t.zoneId === zone.id);
                                const loading = zoneTokens.filter((t) => t.stage === 'Loading').length;
                                return (
                                    <div key={zone.id} style={{ marginBottom: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <strong>{zone.name}</strong>
                                            <span className="badge info">{zoneTokens.length} tokens</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {zone.loadingPoints.map((lp) => {
                                                const active = zoneTokens.find((t) => t.loadingPointId === lp.id && t.stage === 'Loading');
                                                return (
                                                    <div key={lp.id} style={{ flex: 1, padding: 8, borderRadius: 'var(--radius)', background: active ? 'var(--warning-bg)' : 'var(--bg)', textAlign: 'center', fontSize: 12, fontWeight: 600 }}>
                                                        {lp.name}
                                                        <div style={{ fontSize: 10, color: active ? 'var(--warning)' : 'var(--success)', marginTop: 2 }}>{active ? 'BUSY' : 'IDLE'}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ marginTop: 8, padding: 8, background: 'var(--bg)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                            <span><Scale size={12} /> {zone.weighbridge.name}</span>
                                            <span className={`badge ${loading > 0 ? 'warning' : 'success'}`} style={{ fontSize: 10 }}>{loading > 0 ? 'ACTIVE' : 'READY'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Allocate Modal */}
            {allocateModal && (
                <div className="modal-overlay" onClick={() => setAllocateModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Allocate {allocateModal.id}</div>
                            <button className="modal-close" onClick={() => setAllocateModal(null)}>×</button>
                        </div>
                        <div style={{ marginBottom: 12, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                            <strong>{allocateModal.truckNumber}</strong> — {allocateModal.customerName} — {allocateModal.product}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Zone</label>
                            <select className="form-select" value={selectedZone} onChange={(e) => { setSelectedZone(e.target.value); setSelectedLP(''); }}>
                                <option value="">Select Zone</option>
                                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name} (→ {z.weighbridge.name})</option>)}
                            </select>
                        </div>
                        {selectedZone && (
                            <div className="form-group">
                                <label className="form-label">Loading Point</label>
                                <select className="form-select" value={selectedLP} onChange={(e) => setSelectedLP(e.target.value)}>
                                    <option value="">Select Loading Point</option>
                                    {ZONES.find((z) => z.id === selectedZone)?.loadingPoints.map((lp) => (
                                        <option key={lp.id} value={lp.id}>{lp.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setAllocateModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAllocate} disabled={!selectedZone || !selectedLP}>
                                <Send size={16} /> Allocate & Notify
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
