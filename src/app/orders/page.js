'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { PRODUCTS, TRANSPORT_OPTIONS } from '@/lib/constants';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';
import { ShoppingCart, Plus, Eye, Download, Filter, X, Truck } from 'lucide-react';

export default function OrdersPage() {
    const { orders, customers, createOrder } = useAppStore();
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [form, setForm] = useState({
        customerId: '', productId: '', quantity: '', transportOption: 'company',
        deliveryAddress: '', preferredDate: '', notes: '',
        vehicleNumber: '', driverName: '', driverMobile: '', estimatedArrival: '',
    });

    const filtered = statusFilter === 'All' ? orders : orders.filter((o) => o.status === statusFilter);
    const statuses = ['All', ...new Set(orders.map((o) => o.status))];

    const handleCreate = () => {
        const product = PRODUCTS.find((p) => p.id === form.productId);
        const customer = customers.find((c) => c.id === form.customerId);
        if (!product || !customer) return;
        createOrder({
            customerId: customer.id, customerName: customer.companyName,
            product, quantity: Number(form.quantity),
            totalAmount: Number(form.quantity) * product.price,
            packaging: product.packaging, transportOption: form.transportOption,
            deliveryAddress: form.deliveryAddress || 'Default Address, Dubai',
            deliveryLat: 25.2, deliveryLng: 55.3,
            preferredDate: form.preferredDate || new Date().toISOString(),
            notes: form.notes,
            vehicleNumber: form.vehicleNumber, driverName: form.driverName,
            driverMobile: form.driverMobile, estimatedArrival: form.estimatedArrival,
        });
        setShowModal(false);
        setForm({ customerId: '', productId: '', quantity: '', transportOption: 'company', deliveryAddress: '', preferredDate: '', notes: '', vehicleNumber: '', driverName: '', driverMobile: '', estimatedArrival: '' });
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Orders Management</h1>
                <p className="page-subtitle">Create, track, and manage customer orders</p>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Order</button>
                </div>
            </div>

            <div className="filter-bar">
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                {statuses.map((s) => (
                    <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter(s)}>{s}</button>
                ))}
                <div className="filter-count">{filtered.length} orders</div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th>
                            <th>Transport</th><th>Status</th><th>Date</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((order) => (
                            <tr key={order.id}>
                                <td className="mono">{order.id}</td>
                                <td>{order.customerName}</td>
                                <td>{order.product.name || order.product}</td>
                                <td>{order.quantity} {order.product.unit || ''}</td>
                                <td>{formatCurrency(order.totalAmount)}</td>
                                <td><span className={`badge ${order.transportOption === 'own' ? 'warning' : 'info'}`}>{order.transportOption === 'own' ? '🚛 Own' : '🏭 Company'}</span></td>
                                <td><span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(order)}><Eye size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Order {selectedOrder.id}</div>
                                <span className={`badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
                        </div>
                        <div className="grid-2">
                            <div>
                                <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Order Details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Customer:</span> <strong>{selectedOrder.customerName}</strong></div>
                                    <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Product:</span> <strong>{selectedOrder.product.name || selectedOrder.product}</strong></div>
                                    <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Quantity:</span> <strong>{selectedOrder.quantity}</strong></div>
                                    <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Amount:</span> <strong>{formatCurrency(selectedOrder.totalAmount)}</strong></div>
                                    <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Transport:</span> <strong>{selectedOrder.transportOption}</strong></div>
                                    <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Address:</span> <strong>{selectedOrder.deliveryAddress}</strong></div>
                                    {selectedOrder.notes && <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Notes:</span> <strong>{selectedOrder.notes}</strong></div>}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Tracking Timeline</h4>
                                <div className="timeline">
                                    {['Pending', 'Approved', 'Token Issued', 'Zone Assigned', 'Loading', 'Weighing', 'Voucher Ready', 'Gate Out', 'In Transit', 'Arrived', 'Delivered'].map((stage, i) => {
                                        const orderStageIndex = ['Pending', 'Approved', 'Token Issued', 'Zone Assigned', 'Loading', 'Weighing', 'Voucher Ready', 'Gate Out', 'In Transit', 'Arrived', 'Delivered'].indexOf(selectedOrder.status);
                                        const isCompleted = i < orderStageIndex;
                                        const isActive = i === orderStageIndex;
                                        return (
                                            <div key={stage} className="timeline-item">
                                                <div className="timeline-dot-container">
                                                    <div className={`timeline-dot ${isCompleted ? 'completed' : isActive ? 'active' : ''}`} />
                                                    <div className="timeline-line" />
                                                </div>
                                                <div className="timeline-content">
                                                    <div className="timeline-title" style={{ opacity: !isCompleted && !isActive ? 0.4 : 1 }}>{stage}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {selectedOrder.transportOption === 'own' && selectedOrder.vehicleNumber && (
                            <div style={{ marginTop: 16, padding: 12, background: 'var(--warning-bg)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Truck size={16} color="var(--warning)" />
                                <span style={{ fontSize: 13 }}>Own Transport: {selectedOrder.vehicleNumber} — {selectedOrder.driverName} ({selectedOrder.driverMobile})</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Order Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Create New Order</div>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Customer</label>
                                <select className="form-select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                                    <option value="">Select Customer</option>
                                    {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Product</label>
                                <select className="form-select" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                                    <option value="">Select Product</option>
                                    {PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name} — AED {p.price}/{p.unit}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Quantity</label>
                                <input type="number" className="form-input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="Enter quantity" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transport Option</label>
                                <select className="form-select" value={form.transportOption} onChange={(e) => setForm({ ...form, transportOption: e.target.value })}>
                                    {TRANSPORT_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {form.transportOption === 'own' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Vehicle Number</label>
                                    <input type="text" className="form-input" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="e.g., DXB-1234" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Driver Name</label>
                                    <input type="text" className="form-input" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Delivery Address</label>
                            <input type="text" className="form-input" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} placeholder="Delivery address" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Preferred Date</label>
                                <input type="date" className="form-input" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input type="text" className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Special instructions" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}><ShoppingCart size={16} /> Create Order</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
