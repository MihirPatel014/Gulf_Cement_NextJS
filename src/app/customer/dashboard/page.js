'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
    ShoppingCart, Package, Clock, FileText, PlusCircle,
    Search, Download, ArrowRight, TrendingUp, CheckCircle,
} from 'lucide-react';

export default function CustomerDashboard() {
    const router = useRouter();
    const { customerId, orders, invoices, tokens, otpRecords } = useAppStore();

    const myOrders = useMemo(() => orders.filter(o => o.customerId === customerId), [orders, customerId]);
    const myInvoices = useMemo(() => invoices.filter(i => i.customerId === customerId), [invoices, customerId]);

    const activeOrders = myOrders.filter(o => !['Delivered', 'Rejected'].includes(o.status)).length;
    const deliveredThisMonth = myOrders.filter(o => {
        if (o.status !== 'Delivered') return false;
        const d = new Date(o.updatedAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const pendingApprovals = myOrders.filter(o => ['Submitted', 'Pending'].includes(o.status)).length;
    const outstandingInvoices = myInvoices.filter(i => !['Paid'].includes(i.status));
    const outstandingTotal = outstandingInvoices.reduce((s, i) => s + i.total, 0);

    const recentOrders = myOrders.slice(0, 8);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customer Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here's your order activity overview.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card" style={{ borderTop: '3px solid var(--primary)' }}>
                    <div className="kpi-label">Active Orders</div>
                    <div className="kpi-value">{activeOrders}</div>
                    <div className="kpi-icon"><ShoppingCart size={22} /></div>
                </div>
                <div className="kpi-card" style={{ borderTop: '3px solid var(--success)' }}>
                    <div className="kpi-label">Delivered This Month</div>
                    <div className="kpi-value">{deliveredThisMonth}</div>
                    <div className="kpi-icon"><CheckCircle size={22} /></div>
                </div>
                <div className="kpi-card" style={{ borderTop: '3px solid var(--warning)' }}>
                    <div className="kpi-label">Pending Approvals</div>
                    <div className="kpi-value">{pendingApprovals}</div>
                    <div className="kpi-icon"><Clock size={22} /></div>
                </div>
                <div className="kpi-card" style={{ borderTop: '3px solid var(--info)' }}>
                    <div className="kpi-label">Outstanding Invoices</div>
                    <div className="kpi-value">{formatCurrency(outstandingTotal)}</div>
                    <div className="kpi-icon"><FileText size={22} /></div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><h3>Quick Actions</h3></div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => router.push('/customer/orders/new')}>
                        <PlusCircle size={18} /> Place New Order
                    </button>
                    <button className="btn btn-outline" onClick={() => router.push('/customer/orders')}>
                        <Search size={18} /> Track Orders
                    </button>
                    <button className="btn btn-outline" onClick={() => router.push('/customer/documents')}>
                        <Download size={18} /> Download Documents
                    </button>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="card-header">
                    <h3>Recent Orders</h3>
                    <button className="btn btn-ghost" onClick={() => router.push('/customer/orders')}>
                        View All <ArrowRight size={16} />
                    </button>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ORDER #</th>
                                <th>DATE</th>
                                <th>PRODUCT</th>
                                <th>QTY</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td><strong>{order.id}</strong></td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>{order.product.name}</td>
                                    <td>{order.quantity} {order.product.unit}</td>
                                    <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                                    <td><span className={`badge badge-${getStatusColor(order.status)}`}>{order.status}</span></td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/customer/orders/${order.id}`)}>
                                            View <ArrowRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <Package size={32} /><p style={{ marginTop: '8px' }}>No orders yet. Place your first order!</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
