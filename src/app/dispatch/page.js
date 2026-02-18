'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';
import { CheckCircle, XCircle, Pause, Clock, TrendingUp, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DispatchPage() {
    const { orders, approveOrder, rejectOrder, holdOrder } = useAppStore();
    const [tab, setTab] = useState('inbox');

    const pendingOrders = orders.filter((o) => o.status === 'Pending');
    const approvedOrders = orders.filter((o) => o.status === 'Approved');
    const allOrders = orders;

    const approvalData = [
        { metric: 'Avg Approval Time', value: '12 min' },
        { metric: 'Today Approved', value: approvedOrders.length },
        { metric: 'Pending', value: pendingOrders.length },
        { metric: 'SLA Met', value: '94%' },
    ];

    const revenueByProduct = [
        { name: 'OPC Bulk', revenue: 185000 },
        { name: 'Clinker', revenue: 142000 },
        { name: 'PPC Bags', revenue: 98000 },
        { name: 'SRC Bulk', revenue: 76000 },
        { name: 'White', revenue: 45000 },
    ];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dispatch Authority</h1>
                <p className="page-subtitle">Approve, reject, or hold customer orders</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Pending Orders</div><div className="kpi-value">{pendingOrders.length}</div></div>
                    <div className="kpi-icon warning"><Clock size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Approved Today</div><div className="kpi-value">{approvedOrders.length}</div></div>
                    <div className="kpi-icon success"><CheckCircle size={24} /></div>
                </div>
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Avg Approval SLA</div><div className="kpi-value">12m</div></div>
                    <div className="kpi-icon primary"><TrendingUp size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">Revenue Pipeline</div><div className="kpi-value">{formatCurrency(orders.reduce((s, o) => s + o.totalAmount, 0))}</div></div>
                    <div className="kpi-icon info"><DollarSign size={24} /></div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'inbox' ? 'active' : ''}`} onClick={() => setTab('inbox')}>Order Inbox ({pendingOrders.length})</button>
                <button className={`tab ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>Approved ({approvedOrders.length})</button>
                <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Orders ({allOrders.length})</button>
                <button className={`tab ${tab === 'mis' ? 'active' : ''}`} onClick={() => setTab('mis')}>Dispatch MIS</button>
            </div>

            {tab === 'inbox' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Transport</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {pendingOrders.length === 0 ? (
                                <tr><td colSpan={8}>
                                    <div className="empty-state"><CheckCircle size={32} /><h3>All Clear!</h3><p>No pending orders in the inbox</p></div>
                                </td></tr>
                            ) : pendingOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="mono">{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.product.name || order.product}</td>
                                    <td>{order.quantity}</td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td><span className={`badge ${order.transportOption === 'own' ? 'warning' : 'info'}`}>{order.transportOption}</span></td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <div className="btn-group">
                                            <button className="btn btn-success btn-sm" onClick={() => approveOrder(order.id)}><CheckCircle size={14} /> Approve</button>
                                            <button className="btn btn-warning btn-sm" onClick={() => holdOrder(order.id)}><Pause size={14} /> Hold</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => rejectOrder(order.id)}><XCircle size={14} /> Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'approved' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Approved At</th><th>By</th><th>Status</th></tr></thead>
                        <tbody>
                            {approvedOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="mono">{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.product.name || order.product}</td>
                                    <td>{order.quantity}</td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td>{order.approvedAt ? formatDateTime(order.approvedAt) : '—'}</td>
                                    <td>{order.approvedBy || '—'}</td>
                                    <td><span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'all' && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {allOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="mono">{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.product.name || order.product}</td>
                                    <td>{order.quantity}</td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td><span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                    <td>{formatDate(order.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'mis' && (
                <div className="grid-2">
                    <div className="card">
                        <div className="card-header"><div className="card-title">Revenue by Product</div></div>
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <BarChart data={revenueByProduct} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                    <Bar dataKey="revenue" fill="#0B3D91" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header"><div className="card-title">Approval Metrics</div></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
                            {approvalData.map((item) => (
                                <div key={item.metric} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.metric}</span>
                                    <span style={{ fontSize: 16, fontWeight: 700 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
