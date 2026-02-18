'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatDateTime } from '@/lib/utils';
import { ClipboardList, Filter, Search, Shield, AlertTriangle } from 'lucide-react';

const ACTION_COLORS = {
    ORDER_CREATED: 'info', ORDER_APPROVED: 'success', ORDER_REJECTED: 'danger', ORDER_ON_HOLD: 'warning',
    TOKEN_CREATED: 'primary', ZONE_ALLOCATED: 'info', LOADING_STARTED: 'info', LOADING_COMPLETED: 'success',
    TARE_CAPTURED: 'warning', GROSS_CAPTURED: 'success', WEIGHT_VERIFIED: 'success', VOUCHER_GENERATED: 'success',
    PIN_GENERATED: 'primary', GATE_VERIFIED: 'success', GATE_EXIT: 'success', TRIP_STARTED: 'info',
    DRIVER_ARRIVED: 'info', OTP_SENT: 'primary', OTP_VERIFIED: 'success', DELIVERY_CONFIRMED: 'success',
    DOCUMENT_SIGNED: 'success', INVOICE_ISSUED: 'info', PAYMENT_RECEIVED: 'success', OVERRIDE_APPLIED: 'danger',
};

export default function AuditPage() {
    const { auditLogs } = useAppStore();
    const [actionFilter, setActionFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const actions = ['All', ...new Set(auditLogs.map((l) => l.action))];
    const filtered = auditLogs
        .filter((l) => actionFilter === 'All' || l.action === actionFilter)
        .filter((l) => !searchQuery || l.details.toLowerCase().includes(searchQuery.toLowerCase()) || l.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) || l.tokenId?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Audit Logs</h1>
                <p className="page-subtitle">Complete system audit trail — {auditLogs.length} records</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Total Logs</div><div className="kpi-value">{auditLogs.length}</div></div>
                    <div className="kpi-icon primary"><ClipboardList size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Actions Logged</div><div className="kpi-value">{new Set(auditLogs.map((l) => l.action)).size}</div></div>
                    <div className="kpi-icon success"><Shield size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Users Active</div><div className="kpi-value">{new Set(auditLogs.map((l) => l.user)).size}</div></div>
                    <div className="kpi-icon warning"><Shield size={24} /></div>
                </div>
                <div className="kpi-card danger">
                    <div><div className="kpi-label">Overrides</div><div className="kpi-value">{auditLogs.filter((l) => l.action === 'OVERRIDE_APPLIED').length}</div></div>
                    <div className="kpi-icon danger"><AlertTriangle size={24} /></div>
                </div>
            </div>

            <div className="filter-bar">
                <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                    <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="form-input" style={{ paddingLeft: 32 }} placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <select className="form-select" style={{ width: 'auto', minWidth: 200 }} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                    {actions.map((a) => <option key={a} value={a}>{a === 'All' ? 'All Actions' : a.replace(/_/g, ' ')}</option>)}
                </select>
                <div className="filter-count">{filtered.length} records</div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Audit ID</th><th>Timestamp</th><th>Action</th><th>Details</th><th>User</th><th>Order</th><th>Token</th><th>IP</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map((log) => (
                            <tr key={log.id}>
                                <td className="mono" style={{ fontSize: 12 }}>{log.id}</td>
                                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDateTime(log.timestamp)}</td>
                                <td><span className={`badge ${ACTION_COLORS[log.action] || 'muted'}`}>{log.action.replace(/_/g, ' ')}</span></td>
                                <td style={{ fontSize: 13, maxWidth: 300 }}>{log.details}</td>
                                <td className="mono" style={{ fontSize: 12 }}>{log.user}</td>
                                <td className="mono" style={{ fontSize: 12 }}>{log.orderId || '—'}</td>
                                <td className="mono" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{log.tokenId || '—'}</td>
                                <td className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.ipAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
