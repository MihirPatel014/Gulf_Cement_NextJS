'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { Scale, Zap, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

export default function WeighbridgePage() {
    const { tokens, weighbridgeRecords, captureTare, captureGross } = useAppStore();
    const [tab, setTab] = useState('capture');

    const zoneAssigned = tokens.filter((t) => t.stage === 'Zone Assigned');
    const loading = tokens.filter((t) => t.stage === 'Loading');
    const completedWB = weighbridgeRecords.filter((w) => w.status === 'Complete');
    const pendingWB = weighbridgeRecords.filter((w) => w.status === 'Tare Captured');

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Weighbridge Module</h1>
                <p className="page-subtitle">Automatic weight capture — no manual entry allowed</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Awaiting Tare</div><div className="kpi-value">{zoneAssigned.length}</div></div>
                    <div className="kpi-icon primary"><Scale size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">In Loading (Awaiting Gross)</div><div className="kpi-value">{loading.length + pendingWB.length}</div></div>
                    <div className="kpi-icon warning"><Clock size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Completed Today</div><div className="kpi-value">{completedWB.length}</div></div>
                    <div className="kpi-icon success"><CheckCircle size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">Avg Net Weight</div><div className="kpi-value">{completedWB.length > 0 ? `${Math.round(completedWB.reduce((s, w) => s + w.netWeight, 0) / completedWB.length).toLocaleString()} kg` : '—'}</div></div>
                    <div className="kpi-icon info"><Zap size={24} /></div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'capture' ? 'active' : ''}`} onClick={() => setTab('capture')}>Weight Capture</button>
                <button className={`tab ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>All Records</button>
            </div>

            {tab === 'capture' && (
                <>
                    {/* Tare Section */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                            <div className="card-title">⚖️ Tare Capture — Trucks Awaiting Tare</div>
                        </div>
                        {zoneAssigned.length === 0 ? (
                            <div className="empty-state"><CheckCircle size={32} /><h3>No trucks awaiting tare</h3></div>
                        ) : (
                            <div className="table-container" style={{ border: 'none' }}>
                                <table className="table">
                                    <thead><tr><th>Token</th><th>Truck</th><th>Driver</th><th>Product</th><th>Zone</th><th>WB</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {zoneAssigned.map((token) => (
                                            <tr key={token.id}>
                                                <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{token.id}</td>
                                                <td className="mono">{token.truckNumber}</td>
                                                <td>{token.driverName}</td>
                                                <td>{token.product}</td>
                                                <td><span className="badge info">{token.zone}</span></td>
                                                <td>{token.weighbridge}</td>
                                                <td>
                                                    <button className="btn btn-primary btn-sm" onClick={() => {
                                                        captureTare(token.id);
                                                        alert(`Tare captured for ${token.id} — Truck sent to loading`);
                                                    }}>
                                                        <Zap size={14} /> Auto Capture Tare
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Gross Section */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">⚖️ Gross Capture — Loaded Trucks</div>
                        </div>
                        {loading.length === 0 && pendingWB.length === 0 ? (
                            <div className="empty-state"><CheckCircle size={32} /><h3>No trucks awaiting gross capture</h3></div>
                        ) : (
                            <div className="table-container" style={{ border: 'none' }}>
                                <table className="table">
                                    <thead><tr><th>Token</th><th>Truck</th><th>Tare (kg)</th><th>Tare Time</th><th>WB</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {[...loading, ...tokens.filter((t) => t.stage === 'Weighing')].map((token) => {
                                            const wb = weighbridgeRecords.find((w) => w.tokenId === token.id && !w.grossWeight);
                                            return (
                                                <tr key={token.id}>
                                                    <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{token.id}</td>
                                                    <td className="mono">{token.truckNumber}</td>
                                                    <td style={{ fontWeight: 600 }}>{wb ? `${wb.tareWeight.toLocaleString()} kg` : '—'}</td>
                                                    <td>{wb ? formatDateTime(wb.tareTimestamp) : '—'}</td>
                                                    <td>{token.weighbridge}</td>
                                                    <td>
                                                        <button className="btn btn-success btn-sm" onClick={() => {
                                                            captureGross(token.id);
                                                            alert(`Gross captured for ${token.id} — Delivery Voucher generated!`);
                                                        }}>
                                                            <Zap size={14} /> Auto Capture Gross
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {tab === 'records' && (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>WB ID</th><th>Token</th><th>Truck</th><th>Product</th><th>WB</th><th>Tare (kg)</th><th>Gross (kg)</th><th>Net (kg)</th><th>Tare Time</th><th>Gross Time</th><th>Status</th><th>Voucher</th></tr>
                        </thead>
                        <tbody>
                            {weighbridgeRecords.map((wb) => (
                                <tr key={wb.id}>
                                    <td className="mono">{wb.id}</td>
                                    <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{wb.tokenId}</td>
                                    <td className="mono">{wb.truckNumber}</td>
                                    <td>{wb.product}</td>
                                    <td>{wb.weighbridgeName}</td>
                                    <td style={{ fontWeight: 600 }}>{wb.tareWeight?.toLocaleString()}</td>
                                    <td style={{ fontWeight: 600 }}>{wb.grossWeight?.toLocaleString() || '—'}</td>
                                    <td style={{ fontWeight: 700, color: wb.netWeight ? 'var(--success)' : 'inherit' }}>{wb.netWeight?.toLocaleString() || '—'}</td>
                                    <td>{formatDateTime(wb.tareTimestamp)}</td>
                                    <td>{wb.grossTimestamp ? formatDateTime(wb.grossTimestamp) : '—'}</td>
                                    <td><span className={`badge ${wb.status === 'Complete' ? 'success' : 'warning'}`}>{wb.status}</span></td>
                                    <td>{wb.voucherGenerated ? <span className="badge success"><FileText size={12} /> Generated</span> : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
