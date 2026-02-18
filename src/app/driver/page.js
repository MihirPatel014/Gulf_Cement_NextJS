'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { formatDateTime } from '@/lib/utils';
import { Truck, Navigation, Phone, MapPin, Play, CheckCircle, ExternalLink, User } from 'lucide-react';

export default function DriverPage() {
    const { tokens, orders, startTrip, driverArrived } = useAppStore();
    const [selectedToken, setSelectedToken] = useState(null);
    const [otpResult, setOtpResult] = useState(null);

    const gateOutTokens = tokens.filter((t) => t.stage === 'Gate Out');
    const inTransitTokens = tokens.filter((t) => t.stage === 'In Transit');
    const arrivedTokens = tokens.filter((t) => t.stage === 'Arrived');
    const deliveredTokens = tokens.filter((t) => t.stage === 'Delivered');

    const handleStartTrip = (tokenId) => {
        startTrip(tokenId);
        alert(`Trip started for ${tokenId}! Google Maps navigation link sent.`);
    };

    const handleArrived = (tokenId) => {
        const otp = driverArrived(tokenId);
        setOtpResult({ tokenId, otp });
        alert(`Arrived! OTP ${otp} sent to customer for delivery confirmation.`);
    };

    const allDriverTokens = [...gateOutTokens, ...inTransitTokens, ...arrivedTokens, ...deliveredTokens.slice(0, 5)];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Driver Mode</h1>
                <p className="page-subtitle">Trip management, navigation, and delivery tracking</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card warning">
                    <div><div className="kpi-label">Ready for Trip</div><div className="kpi-value">{gateOutTokens.length}</div></div>
                    <div className="kpi-icon warning"><Play size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">In Transit</div><div className="kpi-value">{inTransitTokens.length}</div></div>
                    <div className="kpi-icon info"><Truck size={24} /></div>
                </div>
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Arrived</div><div className="kpi-value">{arrivedTokens.length}</div></div>
                    <div className="kpi-icon primary"><MapPin size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Delivered</div><div className="kpi-value">{deliveredTokens.length}</div></div>
                    <div className="kpi-icon success"><CheckCircle size={24} /></div>
                </div>
            </div>

            {selectedToken ? (
                <div className="driver-card">
                    <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => { setSelectedToken(null); setOtpResult(null); }}>← Back to list</button>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">{selectedToken.id} — Trip Details</div>
                            <span className={`badge ${selectedToken.stage === 'Delivered' ? 'success' : 'info'}`}>{selectedToken.stage}</span>
                        </div>

                        <div className="driver-map-placeholder">
                            <div style={{ textAlign: 'center' }}>
                                <Navigation size={32} style={{ marginBottom: 8 }} />
                                <div>Google Maps Navigation</div>
                                <a href={`https://www.google.com/maps/dir/?api=1&destination=${orders.find((o) => o.id === selectedToken.orderId)?.deliveryLat || 25.2},${orders.find((o) => o.id === selectedToken.orderId)?.deliveryLng || 55.3}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                                    <ExternalLink size={14} /> Open Maps
                                </a>
                            </div>
                        </div>

                        <div className="driver-info">
                            <div className="driver-info-row"><span>Customer</span><strong>{selectedToken.customerName}</strong></div>
                            <div className="driver-info-row"><span>Product</span><strong>{selectedToken.product}</strong></div>
                            <div className="driver-info-row"><span>Quantity</span><strong>{selectedToken.quantity}</strong></div>
                            <div className="driver-info-row"><span>Truck</span><strong>{selectedToken.truckNumber}</strong></div>
                            <div className="driver-info-row">
                                <span>Delivery Address</span>
                                <strong>{orders.find((o) => o.id === selectedToken.orderId)?.deliveryAddress || 'N/A'}</strong>
                            </div>
                            <div className="driver-info-row">
                                <span>Customer Contact</span>
                                <strong>{orders.find((o) => o.id === selectedToken.orderId)?.customerName || 'N/A'}</strong>
                            </div>
                        </div>

                        <div className="driver-actions">
                            {selectedToken.stage === 'Gate Out' && (
                                <button className="btn btn-primary" onClick={() => { handleStartTrip(selectedToken.id); setSelectedToken({ ...selectedToken, stage: 'In Transit' }); }}>
                                    <Play size={18} /> Start Trip
                                </button>
                            )}
                            {selectedToken.stage === 'In Transit' && (
                                <button className="btn btn-success" onClick={() => { handleArrived(selectedToken.id); setSelectedToken({ ...selectedToken, stage: 'Arrived' }); }}>
                                    <MapPin size={18} /> I Have Arrived
                                </button>
                            )}
                            {selectedToken.stage === 'Arrived' && (
                                <div style={{ width: '100%', padding: 16, background: 'var(--warning-bg)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                    <p style={{ fontWeight: 600, color: 'var(--warning)' }}>⏳ Waiting for customer OTP confirmation</p>
                                    {otpResult && otpResult.tokenId === selectedToken.id && (
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Demo OTP: <strong style={{ letterSpacing: 2 }}>{otpResult.otp}</strong></p>
                                    )}
                                </div>
                            )}
                            {selectedToken.stage === 'Delivered' && (
                                <div style={{ width: '100%', padding: 16, background: 'var(--success-bg)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                    <CheckCircle size={24} style={{ color: 'var(--success)', marginBottom: 8 }} />
                                    <p style={{ fontWeight: 600, color: 'var(--success)' }}>Delivery Confirmed & Documents Signed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Token</th><th>Truck</th><th>Customer</th><th>Product</th><th>Destination</th><th>Stage</th><th>Actions</th></tr></thead>
                        <tbody>
                            {allDriverTokens.length === 0 ? (
                                <tr><td colSpan={7}><div className="empty-state"><Truck size={32} /><h3>No active trips</h3></div></td></tr>
                            ) : allDriverTokens.map((token) => (
                                <tr key={token.id}>
                                    <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>{token.id}</td>
                                    <td className="mono">{token.truckNumber}</td>
                                    <td>{token.customerName}</td>
                                    <td>{token.product}</td>
                                    <td>{orders.find((o) => o.id === token.orderId)?.deliveryAddress || 'N/A'}</td>
                                    <td><span className={`badge ${token.stage === 'Delivered' ? 'success' : 'info'}`}>{token.stage}</span></td>
                                    <td><button className="btn btn-outline btn-sm" onClick={() => setSelectedToken(token)}>Open</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
