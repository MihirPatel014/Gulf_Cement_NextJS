'use client';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { TIMELINE_STAGES, ORDER_STATUSES } from '@/lib/constants';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';
import {
    ChevronLeft, FileText, ClipboardCheck, Ticket, MapPin, Scale,
    Package, ShieldCheck, Truck, CheckCircle, Clock, AlertCircle,
    Lock, Key, User, ArrowRight, Download, Phone,
} from 'lucide-react';

const ICON_MAP = {
    FileText, ClipboardCheck, Ticket, MapPin, Scale, Package,
    ShieldCheck, Truck, CheckCircle, Clock,
};

function getStatusIndex(status) {
    const flat = ['Submitted', 'Approved', 'Token Issued', 'Zone Assigned', 'Loading', 'Weighing', 'Voucher Ready', 'Gate Out', 'In Transit', 'Arrived', 'Delivered'];
    return flat.indexOf(status);
}

export default function OrderDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { orders, tokens, weighbridgeRecords, otpRecords, invoices, verifyDeliveryOTP } = useAppStore();

    const order = useMemo(() => orders.find(o => o.id === id), [orders, id]);
    const token = useMemo(() => tokens.find(t => t.orderId === id), [tokens, id]);
    const wb = useMemo(() => weighbridgeRecords.find(w => w.orderId === id), [weighbridgeRecords, id]);
    const otp = useMemo(() => otpRecords.find(r => r.orderId === id), [otpRecords, id]);
    const invoice = useMemo(() => invoices.find(i => i.orderId === id), [invoices, id]);

    const currentStatusIdx = order ? getStatusIndex(order.status) : -1;

    // OTP Form
    const [otpInput, setOtpInput] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState(false);

    const handleOtpSubmit = () => {
        if (!token) return;
        setOtpError('');
        const result = verifyDeliveryOTP(token.id, otpInput, receiverName || 'Customer');
        if (result.success) {
            setOtpSuccess(true);
        } else {
            setOtpError(result.reason);
        }
    };

    if (!order) {
        return (
            <div className="page">
                <div className="empty-state">
                    <Package size={48} />
                    <h3>Order not found</h3>
                    <p>The order you're looking for doesn't exist.</p>
                    <button className="btn btn-primary" onClick={() => router.push('/customer/orders')}>Back to Orders</button>
                </div>
            </div>
        );
    }

    const isRejected = order.status === 'Rejected';

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn btn-ghost" onClick={() => router.push('/customer/orders')} style={{ marginBottom: '8px' }}>
                        <ChevronLeft size={18} /> Back to Orders
                    </button>
                    <h1 className="page-title">Order {order.id}</h1>
                    <p className="page-subtitle">
                        Placed {formatDate(order.createdAt)} • <span className={`badge badge-${getStatusColor(order.status)}`}>{order.status}</span>
                    </p>
                </div>
            </div>

            {/* Timeline */}
            {!isRejected && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header"><h3><Clock size={18} /> Order Tracking Timeline</h3></div>
                    <div className="cp-timeline">
                        {TIMELINE_STAGES.map((stage, idx) => {
                            const isCompleted = currentStatusIdx >= idx;
                            const isCurrent = currentStatusIdx === idx;
                            const IconComp = ICON_MAP[stage.icon] || Clock;
                            return (
                                <div key={stage.key} className={`cp-timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                    <div className="cp-timeline-icon">
                                        {isCompleted ? <CheckCircle size={20} /> : <IconComp size={20} />}
                                    </div>
                                    <div className="cp-timeline-connector" />
                                    <div className="cp-timeline-label">{stage.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Rejected Banner */}
            {isRejected && (
                <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--danger)', background: 'var(--danger-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
                        <AlertCircle size={24} color="var(--danger)" />
                        <div>
                            <strong style={{ color: 'var(--danger)' }}>Order Rejected</strong>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>This order was rejected by Dispatch Authority. Please contact support or place a new order.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Order Info */}
                <div>
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div className="card-header"><h3><Package size={18} /> Order Information</h3></div>
                        <div className="detail-grid">
                            <div className="detail-row"><span className="detail-label">Order ID</span><span className="detail-value">{order.id}</span></div>
                            <div className="detail-row"><span className="detail-label">Product</span><span className="detail-value">{order.product.name}</span></div>
                            <div className="detail-row"><span className="detail-label">Quantity</span><span className="detail-value">{order.quantity} {order.product.unit}</span></div>
                            <div className="detail-row"><span className="detail-label">Packaging</span><span className="detail-value">{order.packaging}</span></div>
                            <div className="detail-row"><span className="detail-label">Amount</span><span className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(order.totalAmount)}</span></div>
                            <div className="detail-row"><span className="detail-label">Transport</span><span className="detail-value">{order.transportOption === 'own' ? 'Customer Own' : 'Company Transport'}</span></div>
                            <div className="detail-row"><span className="detail-label">Delivery To</span><span className="detail-value">{order.deliveryAddress}</span></div>
                            <div className="detail-row"><span className="detail-label">Preferred Date</span><span className="detail-value">{formatDate(order.preferredDate)}</span></div>
                            {order.notes && <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{order.notes}</span></div>}
                        </div>
                    </div>

                    {/* Transport Info */}
                    {order.transportOption === 'own' && (
                        <div className="card" style={{ marginBottom: '16px' }}>
                            <div className="card-header"><h3><Truck size={18} /> Transport Details</h3></div>
                            <div className="detail-grid">
                                <div className="detail-row"><span className="detail-label">Vehicle</span><span className="detail-value">{order.vehicleNumber}</span></div>
                                <div className="detail-row"><span className="detail-label">Driver</span><span className="detail-value">{order.driverName}</span></div>
                                <div className="detail-row"><span className="detail-label">Driver Mobile</span><span className="detail-value">{order.driverMobile}</span></div>
                            </div>
                        </div>
                    )}

                    {/* Weighbridge */}
                    {wb && (
                        <div className="card" style={{ marginBottom: '16px' }}>
                            <div className="card-header"><h3><Scale size={18} /> Weighment Data</h3></div>
                            <div className="detail-grid">
                                <div className="detail-row"><span className="detail-label">Tare Weight</span><span className="detail-value">{wb.tareWeight?.toLocaleString()} kg</span></div>
                                {wb.grossWeight && <div className="detail-row"><span className="detail-label">Gross Weight</span><span className="detail-value">{wb.grossWeight?.toLocaleString()} kg</span></div>}
                                {wb.netWeight && <div className="detail-row"><span className="detail-label">Net Weight</span><span className="detail-value" style={{ fontWeight: 700, color: 'var(--success)' }}>{wb.netWeight?.toLocaleString()} kg</span></div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div>
                    {/* OTP Delivery Confirmation — only when Arrived */}
                    {order.status === 'Arrived' && !otpSuccess && (
                        <div className="card" style={{ marginBottom: '16px', borderTop: '3px solid var(--primary)' }}>
                            <div className="card-header"><h3><Key size={18} /> Confirm Delivery</h3></div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                An OTP has been sent to the registered contact. Enter the 6-digit code to confirm delivery.
                            </p>

                            {otp && (
                                <div style={{ padding: '10px', background: 'var(--info-bg)', borderRadius: 'var(--radius)', marginBottom: '12px', fontSize: '12px', color: 'var(--info)' }}>
                                    <strong>Demo OTP:</strong> {otp.otp} • Expires: {formatDateTime(otp.expiresAt)}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Receiver Name</label>
                                <input className="form-input" placeholder="Name of person receiving goods" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">OTP Code *</label>
                                <input
                                    className="form-input"
                                    placeholder="Enter 6-digit OTP"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                    maxLength={6}
                                    style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontWeight: 600 }}
                                />
                            </div>

                            {otpError && (
                                <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={14} /> {otpError}
                                </div>
                            )}

                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={handleOtpSubmit}>
                                <CheckCircle size={18} /> Confirm Delivery
                            </button>
                        </div>
                    )}

                    {/* ePOD / Delivery Confirmed */}
                    {(order.status === 'Delivered' || otpSuccess) && (
                        <div className="card" style={{ marginBottom: '16px', borderTop: '3px solid var(--success)' }}>
                            <div className="card-header"><h3><CheckCircle size={18} /> Delivery Confirmed</h3></div>
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <CheckCircle size={30} color="var(--success)" />
                                </div>
                                <h3 style={{ color: 'var(--success)', marginBottom: '4px' }}>Delivery Verified ✓</h3>
                                {otp?.receiverName && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Received by: <strong>{otp.receiverName}</strong></p>}
                                {otp?.verifiedAt && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confirmed: {formatDateTime(otp.verifiedAt)}</p>}
                                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    🔒 Digitally signed via OTP verification • GPS-confirmed
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div className="card-header"><h3><FileText size={18} /> Documents</h3></div>
                        <div className="detail-grid">
                            {wb?.voucherGenerated && (
                                <div className="detail-row" style={{ cursor: 'pointer' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Download size={14} color="var(--primary)" /> Delivery Voucher
                                    </span>
                                    <span className="badge badge-success">Available</span>
                                </div>
                            )}
                            {(order.status === 'Delivered') && (
                                <>
                                    <div className="detail-row" style={{ cursor: 'pointer' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={14} color="var(--primary)" /> Delivery Note
                                        </span>
                                        <span className="badge badge-success">Available</span>
                                    </div>
                                    <div className="detail-row" style={{ cursor: 'pointer' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={14} color="var(--primary)" /> ePOD (Signed)
                                        </span>
                                        <span className="badge badge-success">🔒 Signed</span>
                                    </div>
                                </>
                            )}
                            {invoice && (
                                <div className="detail-row" style={{ cursor: 'pointer' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Download size={14} color="var(--primary)" /> Invoice {invoice.id}
                                    </span>
                                    <span className={`badge badge-${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                                </div>
                            )}
                            {!wb?.voucherGenerated && order.status !== 'Delivered' && !invoice && (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    <FileText size={24} />
                                    <p style={{ marginTop: '8px' }}>Documents will appear here as order progresses</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Token Info */}
                    {token && (
                        <div className="card">
                            <div className="card-header"><h3><Ticket size={18} /> Dispatch Token</h3></div>
                            <div className="detail-grid">
                                <div className="detail-row"><span className="detail-label">Token #</span><span className="detail-value">{token.id}</span></div>
                                <div className="detail-row"><span className="detail-label">Vehicle</span><span className="detail-value">{token.truckNumber}</span></div>
                                <div className="detail-row"><span className="detail-label">Driver</span><span className="detail-value">{token.driverName}</span></div>
                                {token.zone && <div className="detail-row"><span className="detail-label">Zone</span><span className="detail-value">{token.zone}</span></div>}
                                {token.loadingPoint && <div className="detail-row"><span className="detail-label">Loading Point</span><span className="detail-value">{token.loadingPoint}</span></div>}
                                {token.weighbridge && <div className="detail-row"><span className="detail-label">Weighbridge</span><span className="detail-value">{token.weighbridge}</span></div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
