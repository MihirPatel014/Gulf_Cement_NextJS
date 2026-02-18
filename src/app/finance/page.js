'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { FileText, DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#16A34A', '#2563EB', '#F59E0B', '#DC2626', '#6B7280'];

export default function FinancePage() {
    const { invoices, orders, customers } = useAppStore();
    const [tab, setTab] = useState('invoices');

    const totalOutstanding = invoices.filter((i) => !['Paid'].includes(i.status)).reduce((s, i) => s + i.total - i.paidAmount, 0);
    const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.paidAmount, 0);
    const overdue = invoices.filter((i) => i.status === 'Overdue');
    const monthlyRevenue = invoices.reduce((s, i) => s + i.total, 0);

    const agingData = [
        { range: '0-30 days', amount: 85000 },
        { range: '31-60 days', amount: 45000 },
        { range: '61-90 days', amount: 22000 },
        { range: '90+ days', amount: 12000 },
    ];

    const statusData = invoices.reduce((acc, inv) => {
        const existing = acc.find((a) => a.name === inv.status);
        if (existing) existing.value += inv.total;
        else acc.push({ name: inv.status, value: inv.total });
        return acc;
    }, []);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Finance & Accounts</h1>
                <p className="page-subtitle">Invoice management, accounts receivable, and payment tracking</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Monthly Revenue</div><div className="kpi-value">{formatCurrency(monthlyRevenue)}</div></div>
                    <div className="kpi-icon primary"><TrendingUp size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Paid</div><div className="kpi-value">{formatCurrency(totalPaid)}</div></div>
                    <div className="kpi-icon success"><DollarSign size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Outstanding</div><div className="kpi-value">{formatCurrency(totalOutstanding)}</div></div>
                    <div className="kpi-icon warning"><Clock size={24} /></div>
                </div>
                <div className="kpi-card danger">
                    <div><div className="kpi-label">Overdue</div><div className="kpi-value">{overdue.length} invoices</div></div>
                    <div className="kpi-icon danger"><AlertTriangle size={24} /></div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>Invoices ({invoices.length})</button>
                <button className={`tab ${tab === 'ar' ? 'active' : ''}`} onClick={() => setTab('ar')}>AR Dashboard</button>
                <button className={`tab ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>Payments</button>
            </div>

            {tab === 'invoices' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Invoice</th><th>Order</th><th>Customer</th><th>Product</th><th>Subtotal</th><th>VAT (5%)</th><th>Total</th><th>Status</th><th>Issued</th><th>Due</th></tr></thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td className="mono" style={{ fontWeight: 700 }}>{inv.id}</td>
                                    <td className="mono">{inv.orderId}</td>
                                    <td>{inv.customerName}</td>
                                    <td>{inv.product}</td>
                                    <td>{formatCurrency(inv.subtotal)}</td>
                                    <td>{formatCurrency(inv.vat)}</td>
                                    <td style={{ fontWeight: 700 }}>{formatCurrency(inv.total)}</td>
                                    <td><span className={`badge ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                                    <td>{formatDate(inv.issuedAt)}</td>
                                    <td>{formatDate(inv.dueDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'ar' && (
                <div className="grid-2">
                    <div className="card">
                        <div className="card-header"><div className="card-title">Aging Analysis (AED)</div></div>
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <BarChart data={agingData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                    <Bar dataKey="amount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header"><div className="card-title">Invoice Status Breakdown</div></div>
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'payments' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Paid At</th></tr></thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td className="mono" style={{ fontWeight: 700 }}>{inv.id}</td>
                                    <td>{inv.customerName}</td>
                                    <td>{formatCurrency(inv.total)}</td>
                                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(inv.paidAmount)}</td>
                                    <td style={{ color: inv.total - inv.paidAmount > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                                        {formatCurrency(inv.total - inv.paidAmount)}
                                    </td>
                                    <td><span className={`badge ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                                    <td>{inv.paidAt ? formatDate(inv.paidAt) : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
