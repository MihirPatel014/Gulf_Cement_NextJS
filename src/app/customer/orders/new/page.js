'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { PRODUCTS, TRANSPORT_OPTIONS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
    ShoppingCart, Truck, MapPin, Calendar, FileText,
    CheckCircle, AlertCircle, PlusCircle, ChevronLeft,
} from 'lucide-react';

export default function PlaceOrder() {
    const router = useRouter();
    const { customerId, customers, createOrder } = useAppStore();
    const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

    const [form, setForm] = useState({
        productId: '',
        quantity: '',
        transportOption: 'company',
        addressIdx: '0',
        newAddress: '',
        newCity: '',
        newLat: '',
        newLng: '',
        useNewAddress: false,
        preferredDate: new Date().toISOString().split('T')[0],
        notes: '',
        vehicleNumber: '',
        driverName: '',
        driverMobile: '',
        vehicleArrivalTime: '',
        estimatedArrival: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [errors, setErrors] = useState({});

    const selectedProduct = PRODUCTS.find(p => p.id === form.productId);
    const totalEstimate = selectedProduct && form.quantity
        ? Number(form.quantity) * selectedProduct.price
        : 0;

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.productId) errs.productId = 'Select a product';
        if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Enter valid quantity';
        if (!form.preferredDate) errs.preferredDate = 'Select delivery date';
        if (form.transportOption === 'own') {
            if (!form.vehicleNumber) errs.vehicleNumber = 'Vehicle number required';
            if (!form.driverName) errs.driverName = 'Driver name required';
            if (!form.driverMobile) errs.driverMobile = 'Driver mobile required';
            if (!form.vehicleArrivalTime) errs.vehicleArrivalTime = 'Arrival time required';
            if (!form.estimatedArrival) errs.estimatedArrival = 'Estimated arrival required';
        }
        if (form.useNewAddress) {
            if (!form.newAddress) errs.newAddress = 'Address required';
            if (!form.newCity) errs.newCity = 'City required';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const product = PRODUCTS.find(p => p.id === form.productId);
        const addr = form.useNewAddress
            ? { address: form.newAddress, city: form.newCity, lat: Number(form.newLat) || 25.2, lng: Number(form.newLng) || 55.3 }
            : customer?.deliveryAddresses[Number(form.addressIdx)] || {};

        const orderData = {
            customerId,
            customerName: customer?.companyName || '',
            product,
            quantity: Number(form.quantity),
            totalAmount: Number(form.quantity) * product.price,
            packaging: product.packaging,
            transportOption: form.transportOption,
            deliveryAddress: addr.address,
            deliveryCity: addr.city || '',
            deliveryLat: addr.lat,
            deliveryLng: addr.lng,
            preferredDate: form.preferredDate,
            notes: form.notes,
            vehicleNumber: form.transportOption === 'own' ? form.vehicleNumber : '',
            driverName: form.transportOption === 'own' ? form.driverName : '',
            driverMobile: form.transportOption === 'own' ? form.driverMobile : '',
            estimatedArrival: form.transportOption === 'own' ? form.estimatedArrival : '',
        };

        const id = createOrder(orderData);
        setOrderId(id);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="page">
                <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle size={36} color="var(--success)" />
                    </div>
                    <h2 style={{ marginBottom: '8px' }}>Order Submitted Successfully!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Your order <strong>{orderId}</strong> has been submitted and is awaiting dispatch approval.
                        You will be notified once it's approved.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => router.push(`/customer/orders/${orderId}`)}>Track Order</button>
                        <button className="btn btn-outline" onClick={() => router.push('/customer/orders')}>View All Orders</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn btn-ghost" onClick={() => router.push('/customer/orders')} style={{ marginBottom: '8px' }}>
                        <ChevronLeft size={18} /> Back to Orders
                    </button>
                    <h1 className="page-title">Place New Order</h1>
                    <p className="page-subtitle">Fill in the details below to submit a cement order</p>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Order Form */}
                <div className="card">
                    <div className="card-header"><h3><ShoppingCart size={18} /> Order Details</h3></div>

                    <div className="form-group">
                        <label className="form-label">Cement Grade / Product *</label>
                        <select className={`form-select ${errors.productId ? 'input-error' : ''}`} value={form.productId} onChange={(e) => handleChange('productId', e.target.value)}>
                            <option value="">Select a product...</option>
                            {PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}{p.fullName ? ` (${p.fullName})` : ''}{p.bagWeight ? ` ${p.bagWeight}` : ''} — AED {p.price}/{p.unit}
                                </option>
                            ))}
                        </select>
                        {errors.productId && <div className="form-error">{errors.productId}</div>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Quantity ({selectedProduct?.unit || 'units'}) *</label>
                            <input type="number" className={`form-input ${errors.quantity ? 'input-error' : ''}`} placeholder="e.g. 50" value={form.quantity} onChange={(e) => handleChange('quantity', e.target.value)} min="1" />
                            {errors.quantity && <div className="form-error">{errors.quantity}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Packaging</label>
                            <input className="form-input" value={selectedProduct?.packaging || '—'} disabled />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Transport Option *</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {TRANSPORT_OPTIONS.map(opt => (
                                <label key={opt.value} style={{
                                    flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px',
                                    border: `2px solid ${form.transportOption === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.2s',
                                    background: form.transportOption === opt.value ? 'var(--primary-bg)' : 'white',
                                }}>
                                    <input type="radio" name="transport" value={opt.value} checked={form.transportOption === opt.value} onChange={(e) => handleChange('transportOption', e.target.value)} />
                                    <Truck size={16} />
                                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {form.transportOption === 'own' && (
                        <div className="card" style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
                            <div className="card-header"><h4 style={{ fontSize: '14px' }}><Truck size={16} /> Own Transport Details</h4></div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Vehicle Number *</label>
                                    <input className={`form-input ${errors.vehicleNumber ? 'input-error' : ''}`} placeholder="e.g. DXB-4521" value={form.vehicleNumber} onChange={(e) => handleChange('vehicleNumber', e.target.value)} />
                                    {errors.vehicleNumber && <div className="form-error">{errors.vehicleNumber}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Driver Name *</label>
                                    <input className={`form-input ${errors.driverName ? 'input-error' : ''}`} placeholder="Driver full name" value={form.driverName} onChange={(e) => handleChange('driverName', e.target.value)} />
                                    {errors.driverName && <div className="form-error">{errors.driverName}</div>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Driver Mobile *</label>
                                    <input className={`form-input ${errors.driverMobile ? 'input-error' : ''}`} placeholder="+971-55-XXXXXXX" value={form.driverMobile} onChange={(e) => handleChange('driverMobile', e.target.value)} />
                                    {errors.driverMobile && <div className="form-error">{errors.driverMobile}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Arrival Time *</label>
                                    <input type="time" className={`form-input ${errors.vehicleArrivalTime ? 'input-error' : ''}`} value={form.vehicleArrivalTime} onChange={(e) => handleChange('vehicleArrivalTime', e.target.value)} />
                                    {errors.vehicleArrivalTime && <div className="form-error">{errors.vehicleArrivalTime}</div>}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estimated Arrival at Plant *</label>
                                <input type="datetime-local" className={`form-input ${errors.estimatedArrival ? 'input-error' : ''}`} value={form.estimatedArrival} onChange={(e) => handleChange('estimatedArrival', e.target.value)} />
                                {errors.estimatedArrival && <div className="form-error">{errors.estimatedArrival}</div>}
                            </div>
                        </div>
                    )}

                    {/* Delivery Address */}
                    <div className="card-header" style={{ padding: '0', marginTop: '8px', marginBottom: '12px' }}><h3><MapPin size={18} /> Delivery Address</h3></div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button className={`btn ${!form.useNewAddress ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => handleChange('useNewAddress', false)}>Saved Address</button>
                        <button className={`btn ${form.useNewAddress ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => handleChange('useNewAddress', true)}>
                            <PlusCircle size={14} /> New Address
                        </button>
                    </div>

                    {!form.useNewAddress ? (
                        <div className="form-group">
                            <select className="form-select" value={form.addressIdx} onChange={(e) => handleChange('addressIdx', e.target.value)}>
                                {(customer?.deliveryAddresses || []).map((addr, i) => (
                                    <option key={i} value={i}>{addr.label || addr.address} — {addr.city || ''} ({addr.lat?.toFixed(2)}, {addr.lng?.toFixed(2)})</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input className={`form-input ${errors.newCity ? 'input-error' : ''}`} placeholder="e.g. Dubai" value={form.newCity} onChange={(e) => handleChange('newCity', e.target.value)} />
                                    {errors.newCity && <div className="form-error">{errors.newCity}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Full Address *</label>
                                    <input className={`form-input ${errors.newAddress ? 'input-error' : ''}`} placeholder="Full delivery address" value={form.newAddress} onChange={(e) => handleChange('newAddress', e.target.value)} />
                                    {errors.newAddress && <div className="form-error">{errors.newAddress}</div>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">GPS Latitude</label>
                                    <input type="number" step="0.0001" className="form-input" placeholder="25.1234" value={form.newLat} onChange={(e) => handleChange('newLat', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GPS Longitude</label>
                                    <input type="number" step="0.0001" className="form-input" placeholder="55.1234" value={form.newLng} onChange={(e) => handleChange('newLng', e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Preferred Delivery Date *</label>
                            <input type="date" className={`form-input ${errors.preferredDate ? 'input-error' : ''}`} value={form.preferredDate} onChange={(e) => handleChange('preferredDate', e.target.value)} />
                            {errors.preferredDate && <div className="form-error">{errors.preferredDate}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-input" rows={3} placeholder="Special instructions, urgency, etc." value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
                    </div>
                </div>

                {/* Price Preview */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '80px' }}>
                        <div className="card-header"><h3><FileText size={18} /> Order Summary</h3></div>
                        {selectedProduct ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Product</span>
                                    <strong>{selectedProduct.name}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Unit Price</span>
                                    <span>AED {selectedProduct.price} / {selectedProduct.unit}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Quantity</span>
                                    <span>{form.quantity || 0} {selectedProduct.unit}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                    <span>{formatCurrency(totalEstimate)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>VAT (5%)</span>
                                    <span>{formatCurrency(totalEstimate * 0.05)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                                    <span>Total Estimate</span>
                                    <span>{formatCurrency(totalEstimate * 1.05)}</span>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <ShoppingCart size={32} />
                                <p style={{ marginTop: '8px', fontSize: '13px' }}>Select a product to see price estimate</p>
                            </div>
                        )}

                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '16px', fontSize: '15px' }} onClick={handleSubmit}>
                            <CheckCircle size={18} /> Submit Order
                        </button>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                            Order will be sent to Dispatch Authority for approval
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
