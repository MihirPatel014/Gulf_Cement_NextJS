'use client';
import useAppStore from '@/store/appStore';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Truck, MapPin, Clock, CheckCircle, Package, AlertTriangle } from 'lucide-react';

export default function TransportPage() {
    const { tokens, orders } = useAppStore();

    const activeTransit = tokens.filter((t) => ['Gate Out', 'In Transit', 'Arrived'].includes(t.stage));
    const deliveredTokens = tokens.filter((t) => t.stage === 'Delivered');
    const allTokens = [...activeTransit, ...deliveredTokens.slice(0, 5)];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Transport Management</h1>
                <p className="page-subtitle">Fleet tracking and delivery operations</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Total Vehicles</div><div className="kpi-value">{tokens.length}</div></div>
                    <div className="kpi-icon primary"><Truck size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">In Transit</div><div className="kpi-value">{tokens.filter((t) => t.stage === 'In Transit').length}</div></div>
                    <div className="kpi-icon info"><MapPin size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Delivered</div><div className="kpi-value">{deliveredTokens.length}</div></div>
                    <div className="kpi-icon success"><CheckCircle size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Avg Trip Time</div><div className="kpi-value">1h 45m</div></div>
                    <div className="kpi-icon warning"><Clock size={24} /></div>
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Token</th><th>Truck</th><th>Driver</th><th>Customer</th><th>Product</th><th>Zone</th><th>Stage</th><th>Gate Out</th></tr></thead>
                    <tbody>
                        {allTokens.map((token) => (
                            <tr key={token.id}>
                                <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{token.id}</td>
                                <td className="mono">{token.truckNumber}</td>
                                <td>{token.driverName}</td>
                                <td>{token.customerName}</td>
                                <td>{token.product}</td>
                                <td>{token.zone || '—'}</td>
                                <td><span className={`badge ${getStatusColor(token.stage)}`}>{token.stage}</span></td>
                                <td>{token.gateOutAt ? formatDate(token.gateOutAt) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
