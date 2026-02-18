'use client';
import { ZONES, PRODUCTS, ROLES, ROLE_LABELS } from '@/lib/constants';
import { Settings as SettingsIcon, MapPin, Factory, Scale, ShoppingCart, Users, Shield, Server } from 'lucide-react';

export default function SettingsPage() {
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">System Settings</h1>
                <p className="page-subtitle">Configuration management for zones, products, roles, and system parameters</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><MapPin size={18} /> Zone & Loading Point Configuration</div>
                    </div>
                    {ZONES.map((zone) => (
                        <div key={zone.id} style={{ marginBottom: 16, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <strong>{zone.name}</strong>
                                <span className="badge primary">{zone.id}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                {zone.loadingPoints.map((lp) => (
                                    <div key={lp.id} style={{ padding: '6px 12px', background: 'white', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, border: '1px solid var(--border)' }}>
                                        <Factory size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                        {lp.name} ({lp.id})
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                <Scale size={14} /> Weighbridge: <strong>{zone.weighbridge.name} ({zone.weighbridge.id})</strong>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><ShoppingCart size={18} /> Product Catalog</div>
                    </div>
                    <div className="table-container" style={{ border: 'none' }}>
                        <table className="table">
                            <thead><tr><th>Product</th><th>ID</th><th>Price</th><th>Unit</th><th>Packaging</th></tr></thead>
                            <tbody>
                                {PRODUCTS.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td className="mono" style={{ fontSize: 12 }}>{p.id}</td>
                                        <td style={{ fontWeight: 600 }}>AED {p.price}</td>
                                        <td>{p.unit}</td>
                                        <td><span className={`badge ${p.packaging === 'Bulk' ? 'primary' : 'info'}`}>{p.packaging}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Shield size={18} /> Roles & Permissions</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {Object.values(ROLES).map((role) => (
                            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Users size={14} />
                                    <span style={{ fontWeight: 500, fontSize: 13 }}>{ROLE_LABELS[role]}</span>
                                </div>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Server size={18} /> System Parameters</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Gate PIN Expiry', value: '24 hours' },
                            { label: 'Gate PIN Max Attempts', value: '5' },
                            { label: 'OTP Expiry', value: '15 minutes' },
                            { label: 'OTP Max Attempts', value: '5' },
                            { label: 'Geo-Fence Radius', value: '500m' },
                            { label: 'Auto-Save Interval', value: 'Real-time' },
                            { label: 'SMS Gateway', value: 'Demo Mode (Simulated)' },
                            { label: 'VAT Rate', value: '5%' },
                            { label: 'Currency', value: 'AED' },
                            { label: 'Time Zone', value: 'Gulf Standard Time (GST)' },
                        ].map((param) => (
                            <div key={param.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{param.label}</span>
                                <strong style={{ fontSize: 13 }}>{param.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
