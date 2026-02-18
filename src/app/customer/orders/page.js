'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { PRODUCTS, ORDER_STATUSES } from '@/lib/constants';
import {
    Search, Filter, PlusCircle, ArrowRight, Package,
    ShoppingCart, ChevronDown,
} from 'lucide-react';

export default function CustomerOrders() {
    const router = useRouter();
    const { customerId, orders } = useAppStore();
    const [statusFilter, setStatusFilter] = useState('all');
    const [productFilter, setProductFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const myOrders = useMemo(() => {
        let filtered = orders.filter(o => o.customerId === customerId);
        if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
        if (productFilter !== 'all') filtered = filtered.filter(o => o.product.id === productFilter);
        if (searchQuery) filtered = filtered.filter(o =>
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return filtered;
    }, [orders, customerId, statusFilter, productFilter, searchQuery]);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Orders</h1>
                    <p className="page-subtitle">Track and manage your cement orders</p>
                </div>
                <button className="btn btn-primary" onClick={() => router.push('/customer/orders/new')}>
                    <PlusCircle size={18} /> Place New Order
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
                    <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="form-input"
                        style={{ paddingLeft: '34px' }}
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-select" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                    <option value="all">All Products</option>
                    {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <span className="filter-count">{myOrders.length} orders</span>
            </div>

            {/* Orders Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ORDER #</th>
                                <th>DATE</th>
                                <th>PRODUCT</th>
                                <th>QTY</th>
                                <th>TRANSPORT</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map((order) => (
                                <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/customer/orders/${order.id}`)}>
                                    <td><strong style={{ color: 'var(--primary)' }}>{order.id}</strong></td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{order.product.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.packaging}</div>
                                    </td>
                                    <td>{order.quantity} {order.product.unit}</td>
                                    <td>
                                        <span className={`badge badge-${order.transportOption === 'own' ? 'info' : 'muted'}`}>
                                            {order.transportOption === 'own' ? 'Own Transport' : 'Company'}
                                        </span>
                                    </td>
                                    <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                                    <td><span className={`badge badge-${getStatusColor(order.status)}`}>{order.status}</span></td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); router.push(`/customer/orders/${order.id}`); }}>
                                            Details <ArrowRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {myOrders.length === 0 && (
                                <tr><td colSpan={8} className="empty-state">
                                    <Package size={40} />
                                    <h3>No orders found</h3>
                                    <p>Try adjusting your filters or place a new order.</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
