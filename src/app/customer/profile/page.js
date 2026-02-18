'use client';
import { useMemo, useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
    Building2, User, Mail, Phone, MapPin, Shield,
    Bell, MessageCircle, Smartphone, PlusCircle, Trash2,
    Save, CheckCircle, Edit3,
} from 'lucide-react';

export default function CustomerProfile() {
    const { customerId, customers, addCustomerAddress, updateNotificationPrefs } = useAppStore();
    const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', lat: '', lng: '' });
    const [notifPrefs, setNotifPrefs] = useState(customer?.notificationPrefs || { sms: true, whatsapp: true, email: true });
    const [saved, setSaved] = useState(false);

    const handleAddAddress = () => {
        if (!newAddr.address || !newAddr.city) return;
        addCustomerAddress(customerId, {
            label: newAddr.label || newAddr.address,
            address: newAddr.address,
            city: newAddr.city,
            lat: Number(newAddr.lat) || 25.2,
            lng: Number(newAddr.lng) || 55.3,
        });
        setNewAddr({ label: '', address: '', city: '', lat: '', lng: '' });
        setShowAddAddress(false);
    };

    const handleSavePrefs = () => {
        updateNotificationPrefs(customerId, notifPrefs);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!customer) return <div className="page"><h2>Profile not found</h2></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your company information and preferences</p>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Company Info */}
                <div>
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div className="card-header"><h3><Building2 size={18} /> Company Information</h3></div>
                        <div className="detail-grid">
                            <div className="detail-row"><span className="detail-label">Company Name</span><span className="detail-value">{customer.companyName}</span></div>
                            <div className="detail-row"><span className="detail-label">Customer ID</span><span className="detail-value">{customer.id}</span></div>
                            <div className="detail-row"><span className="detail-label">VAT Number</span><span className="detail-value">{customer.vatNumber}</span></div>
                            <div className="detail-row"><span className="detail-label">Contact Person</span><span className="detail-value">{customer.contactPerson}</span></div>
                            <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{customer.email}</span></div>
                            <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{customer.phone}</span></div>
                            <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className="badge badge-success">{customer.status}</span></span></div>
                            <div className="detail-row"><span className="detail-label">Member Since</span><span className="detail-value">{formatDate(customer.createdAt)}</span></div>
                        </div>
                    </div>

                    {/* Credit Info */}
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div className="card-header"><h3><Shield size={18} /> Credit Information</h3></div>
                        <div className="detail-grid">
                            <div className="detail-row"><span className="detail-label">Credit Limit</span><span className="detail-value" style={{ fontWeight: 700 }}>{formatCurrency(customer.creditLimit)}</span></div>
                            <div className="detail-row"><span className="detail-label">Outstanding Balance</span><span className="detail-value" style={{ fontWeight: 700, color: customer.outstandingBalance > customer.creditLimit * 0.8 ? 'var(--danger)' : 'var(--text)' }}>{formatCurrency(customer.outstandingBalance)}</span></div>
                            <div className="detail-row"><span className="detail-label">Available Credit</span><span className="detail-value" style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(customer.creditLimit - customer.outstandingBalance)}</span></div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* Delivery Addresses */}
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div className="card-header">
                            <h3><MapPin size={18} /> Delivery Addresses</h3>
                            <button className="btn btn-outline btn-sm" onClick={() => setShowAddAddress(!showAddAddress)}>
                                <PlusCircle size={14} /> Add
                            </button>
                        </div>

                        {showAddAddress && (
                            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: '12px', border: '1px dashed var(--border)' }}>
                                <div className="form-group">
                                    <label className="form-label">Label</label>
                                    <input className="form-input" placeholder="e.g. Main Warehouse" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City *</label>
                                        <input className="form-input" placeholder="e.g. Dubai" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Full Address *</label>
                                        <input className="form-input" placeholder="Street, area, landmark" value={newAddr.address} onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Latitude</label>
                                        <input type="number" step="0.0001" className="form-input" placeholder="25.1234" value={newAddr.lat} onChange={(e) => setNewAddr({ ...newAddr, lat: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Longitude</label>
                                        <input type="number" step="0.0001" className="form-input" placeholder="55.1234" value={newAddr.lng} onChange={(e) => setNewAddr({ ...newAddr, lng: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setShowAddAddress(false)}>Cancel</button>
                                    <button className="btn btn-primary btn-sm" onClick={handleAddAddress}><Save size={14} /> Save Address</button>
                                </div>
                            </div>
                        )}

                        <div className="detail-grid">
                            {(customer.deliveryAddresses || []).map((addr, i) => (
                                <div key={i} style={{ padding: '12px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'start' }}>
                                    <MapPin size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{addr.label || `Address ${i + 1}`}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{addr.address}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{addr.city} • GPS: {addr.lat?.toFixed(4)}, {addr.lng?.toFixed(4)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="card">
                        <div className="card-header"><h3><Bell size={18} /> Notification Preferences</h3></div>

                        <div className="detail-grid">
                            {[
                                { key: 'sms', label: 'SMS Notifications', icon: <Smartphone size={16} />, desc: 'Receive order updates via SMS' },
                                { key: 'whatsapp', label: 'WhatsApp Alerts', icon: <MessageCircle size={16} />, desc: 'Get alerts via WhatsApp' },
                                { key: 'email', label: 'Email Notifications', icon: <Mail size={16} />, desc: 'Receive email updates' },
                            ].map(pref => (
                                <div key={pref.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        {pref.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{pref.label}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pref.desc}</div>
                                    </div>
                                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                        <input
                                            type="checkbox"
                                            checked={notifPrefs[pref.key]}
                                            onChange={(e) => setNotifPrefs({ ...notifPrefs, [pref.key]: e.target.checked })}
                                            style={{ opacity: 0, width: 0, height: 0 }}
                                        />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            background: notifPrefs[pref.key] ? 'var(--primary)' : '#ccc',
                                            borderRadius: '12px', transition: '0.3s',
                                        }}>
                                            <span style={{
                                                position: 'absolute', content: '""', height: '18px', width: '18px',
                                                left: notifPrefs[pref.key] ? '22px' : '3px', bottom: '3px',
                                                background: 'white', borderRadius: '50%', transition: '0.3s',
                                            }} />
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button className="btn btn-primary btn-sm" onClick={handleSavePrefs}>
                                <Save size={14} /> Save Preferences
                            </button>
                            {saved && <span style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Saved!</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
