'use client';
import { useState, useEffect } from 'react';
import { User, UserPlus, Edit2, Trash2, Phone, X, Save, Search as SearchIcon } from 'lucide-react';
import { httpClient } from '@/lib/httpClient';

export default function DriverList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        licenseNumber: '',
        phone: '',
        identityNumber: '',
        isActive: true
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const res = await httpClient.get('/Driver/paginated?pageSize=100');
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Failed to load drivers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (driver = null) => {
        if (driver) {
            setEditingDriver(driver);
            setFormData({
                fullName: driver.fullName,
                licenseNumber: driver.licenseNumber,
                phone: driver.phone || '',
                identityNumber: driver.identityNumber || '',
                isActive: driver.isActive
            });
        } else {
            setEditingDriver(null);
            setFormData({
                fullName: '',
                licenseNumber: '',
                phone: '',
                identityNumber: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (editingDriver) {
                await httpClient.put(`/Driver/${editingDriver.id}`, { ...formData, id: editingDriver.id });
            } else {
                await httpClient.post('/Driver', formData);
            }
            setIsModalOpen(false);
            fetchDrivers();
        } catch (error) {
            console.error('Failed to save driver', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;
        try {
            await httpClient.delete(`/Driver/${id}`);
            fetchDrivers();
        } catch (error) {
            console.error('Failed to delete driver', error);
        }
    };

    const filteredData = data.filter(d => 
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Drivers Master Registry</h3>
                        <p className="card-subtitle">Manage licensed delivery personnel and their status</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="header-search" style={{ position: 'relative' }}>
                            <SearchIcon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input 
                                type="text" 
                                placeholder="Search drivers..." 
                                className="form-input" 
                                style={{ paddingLeft: 32, width: 240, background: 'var(--bg)' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <UserPlus size={18} /> Add Driver
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>License Number</th>
                                <th>Phone</th>
                                <th>Identity No.</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading drivers...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No drivers found.</td></tr>
                            ) : filteredData.map((driver) => (
                                <tr key={driver.id}>
                                    <td style={{ fontWeight: 600 }}>{driver.fullName}</td>
                                    <td><code className="badge muted">{driver.licenseNumber}</code></td>
                                    <td>{driver.phone || '—'}</td>
                                    <td>{driver.identityNumber || '—'}</td>
                                    <td>
                                        <span className={`badge ${driver.isActive ? 'success' : 'danger'}`}>
                                            {driver.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleOpenModal(driver)} className="btn btn-ghost btn-sm" style={{ color: 'var(--info)' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(driver.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingDriver ? 'Edit Driver' : 'Register New Driver'}</h2>
                            <button className="btn-ghost" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input 
                                    className="form-input" 
                                    value={formData.fullName} 
                                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Number</label>
                                <input 
                                    className="form-input" 
                                    value={formData.licenseNumber} 
                                    onChange={e => setFormData({...formData, licenseNumber: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input 
                                        className="form-input" 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Identity Number</label>
                                    <input 
                                        className="form-input" 
                                        value={formData.identityNumber} 
                                        onChange={e => setFormData({...formData, identityNumber: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <input 
                                    type="checkbox" 
                                    id="isActive" 
                                    checked={formData.isActive}
                                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                />
                                <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0 }}>Mark as Active</label>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={isSaving} className="btn btn-primary">
                                    <Save size={18} /> {isSaving ? 'Saving...' : editingDriver ? 'Update' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
