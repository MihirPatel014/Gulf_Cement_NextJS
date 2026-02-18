'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';
import {
    FileText, Download, FolderOpen, Filter, Search,
    CheckCircle, Lock, Truck, Receipt, ArrowRight,
} from 'lucide-react';

export default function CustomerDocuments() {
    const router = useRouter();
    const { customerId, orders, tokens, weighbridgeRecords, otpRecords, invoices } = useAppStore();
    const [docFilter, setDocFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Build document list from orders/tokens/WB/invoices
    const documents = useMemo(() => {
        const docs = [];
        const myOrders = orders.filter(o => o.customerId === customerId);

        myOrders.forEach(order => {
            const token = tokens.find(t => t.orderId === order.id);
            const wb = weighbridgeRecords.find(w => w.orderId === order.id);
            const otp = otpRecords.find(r => r.orderId === order.id);
            const inv = invoices.find(i => i.orderId === order.id);

            // Delivery Voucher
            if (wb?.voucherGenerated) {
                docs.push({
                    id: `DV-${order.id}`,
                    type: 'Delivery Voucher',
                    category: 'voucher',
                    orderId: order.id,
                    product: order.product.name,
                    date: wb.grossTimestamp || wb.tareTimestamp,
                    status: 'Available',
                    isSigned: false,
                    details: `${wb.netWeight?.toLocaleString() || '—'} kg net weight`,
                });
            }

            // Delivery Note
            if (order.status === 'Delivered') {
                docs.push({
                    id: `DN-${order.id}`,
                    type: 'Delivery Note',
                    category: 'delivery',
                    orderId: order.id,
                    product: order.product.name,
                    date: token?.deliveredAt || order.updatedAt,
                    status: 'Available',
                    isSigned: true,
                    signedBy: otp?.receiverName || 'Verified',
                    details: `Delivered to ${order.deliveryAddress}`,
                });
            }

            // ePOD
            if (otp?.status === 'Verified') {
                docs.push({
                    id: `EPOD-${order.id}`,
                    type: 'ePOD (Signed)',
                    category: 'epod',
                    orderId: order.id,
                    product: order.product.name,
                    date: otp.verifiedAt,
                    status: 'Signed',
                    isSigned: true,
                    signedBy: otp.receiverName,
                    gps: otp.gpsLat && otp.gpsLng ? `${otp.gpsLat.toFixed(4)}, ${otp.gpsLng.toFixed(4)}` : null,
                    details: `OTP verified • GPS: ${otp.gpsLat?.toFixed(4)}, ${otp.gpsLng?.toFixed(4)}`,
                });
            }

            // Invoice
            if (inv) {
                docs.push({
                    id: inv.id,
                    type: 'Invoice',
                    category: 'invoice',
                    orderId: order.id,
                    product: order.product.name,
                    date: inv.issuedAt,
                    status: inv.status,
                    isSigned: false,
                    amount: inv.total,
                    details: `${formatCurrency(inv.total)} — ${inv.status}`,
                });
            }
        });

        // Sort by date desc
        docs.sort((a, b) => new Date(b.date) - new Date(a.date));
        return docs;
    }, [orders, tokens, weighbridgeRecords, otpRecords, invoices, customerId]);

    const filteredDocs = useMemo(() => {
        let filtered = documents;
        if (docFilter !== 'all') filtered = filtered.filter(d => d.category === docFilter);
        if (searchQuery) filtered = filtered.filter(d =>
            d.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.product.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return filtered;
    }, [documents, docFilter, searchQuery]);

    const docCounts = {
        all: documents.length,
        voucher: documents.filter(d => d.category === 'voucher').length,
        delivery: documents.filter(d => d.category === 'delivery').length,
        epod: documents.filter(d => d.category === 'epod').length,
        invoice: documents.filter(d => d.category === 'invoice').length,
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Documents</h1>
                    <p className="page-subtitle">Access all delivery vouchers, invoices, and signed documents</p>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="filter-bar">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'voucher', label: 'Vouchers' },
                    { key: 'delivery', label: 'Delivery Notes' },
                    { key: 'epod', label: 'ePODs' },
                    { key: 'invoice', label: 'Invoices' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`btn ${docFilter === tab.key ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        onClick={() => setDocFilter(tab.key)}
                    >
                        {tab.label} ({docCounts[tab.key]})
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ position: 'relative', maxWidth: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: '30px', fontSize: '13px' }} placeholder="Search docs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Documents Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {filteredDocs.map((doc) => (
                    <div key={doc.id} className="card cp-doc-card" onClick={() => router.push(`/customer/orders/${doc.orderId}`)}>
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 'var(--radius)',
                                    background: doc.isSigned ? 'var(--success-bg)' : 'var(--primary-bg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {doc.category === 'invoice' ? <Receipt size={20} color={doc.isSigned ? 'var(--success)' : 'var(--primary)'} />
                                        : doc.category === 'epod' ? <Lock size={20} color="var(--success)" />
                                            : <FileText size={20} color={doc.isSigned ? 'var(--success)' : 'var(--primary)'} />
                                    }
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{doc.type}</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.orderId} • {doc.product}</p>
                                </div>
                            </div>
                            <span className={`badge badge-${doc.isSigned ? 'success' : getStatusColor(doc.status)}`}>
                                {doc.isSigned ? '🔒 Signed' : doc.status}
                            </span>
                        </div>

                        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {doc.details}
                        </div>

                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(doc.date)}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn btn-ghost btn-sm"><Download size={14} /> Download</button>
                                <button className="btn btn-ghost btn-sm"><ArrowRight size={14} /></button>
                            </div>
                        </div>

                        {doc.isSigned && doc.signedBy && (
                            <div style={{ marginTop: '8px', padding: '6px 10px', background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--success)' }}>
                                ✓ Digitally Signed via OTP by {doc.signedBy}
                            </div>
                        )}
                    </div>
                ))}

                {filteredDocs.length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="empty-state">
                            <FolderOpen size={40} />
                            <h3>No documents found</h3>
                            <p>Documents will appear here as orders progress through the workflow.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
