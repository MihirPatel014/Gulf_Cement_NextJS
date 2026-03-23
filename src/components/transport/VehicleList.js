'use client';
import { useState, useEffect } from 'react';
import { Truck, PlusCircle, Edit2, Trash2, X, Save, Search as SearchIcon, WeighingScale } from 'lucide-react';
import { httpClient } from '@/lib/httpClient';

export default function VehicleList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        plateNumber: '',
        vehicleType: 'BULK',
        maxCapacity: 30,
        model: '',
        isActive: true
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const res = await httpClient.get('/Vehicle/paginated?pageSize=100');
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Failed to load vehicles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({
                plateNumber: vehicle.plateNumber,
                vehicleType: vehicle.vehicleType,
                maxCapacity: vehicle.maxCapacity,
                model: vehicle.model || '',
                isActive: vehicle.isActive
            });
        } else {
            setEditingVehicle(null);
            setFormData({
                plateNumber: '',
                vehicleType: 'BULK',
                maxCapacity: 30,
                model: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const payload = { ...formData, maxCapacity: Number(formData.maxCapacity) };
            if (editingVehicle) {
                await httpClient.put(`/Vehicle/${editingVehicle.id}`, { ...payload, id: editingVehicle.id });
            } else {
                await httpClient.post('/Vehicle', payload);
            }
            setIsModalOpen(false);
            fetchVehicles();
        } catch (error) {
            console.error('Failed to save vehicle', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle recorded?')) return;
        try {
            await httpClient.delete(`/Vehicle/${id}`);
            fetchVehicles();
        } catch (error) {
            console.error('Failed to delete vehicle', error);
        }
    };

    const filteredData = data.filter(v => 
        v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Vehicles Master Registry</h3>
                        <p className="card-subtitle">Manage fleet assets, capacities and types</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="header-search" style={{ position: 'relative' }}>
                            <SearchIcon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input 
                                type="text" 
                                placeholder="Search plate no..." 
                                className="form-input" 
                                style={{ paddingLeft: 32, width: 240, background: 'var(--bg)' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <PlusCircle size={18} /> Add Vehicle
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Plate Number</th>
                                <th>Type</th>
                                <th>Capacity (Tons)</th>
                                <th>Model / Info</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading fleet data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No vehicles found.</td></tr>
                            ) : filteredData.map((v) => (
                                <tr key={v.id}>
                                    <td style={{ fontWeight: 600 }}>{v.plateNumber}</td>
                                    <td>
                                        <span className={`badge ${v.vehicleType === 'BULK' ? 'info' : 'warning'}`}>
                                            {v.vehicleType}
                                        </span>
                                    </td>
                                    <td>{v.maxCapacity} T</td>
                                    <td>{v.model || '—'}</td>
                                    <td>
                                        <span className={`badge ${v.isActive ? 'success' : 'danger'}`}>
                                            {v.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleOpenModal(v)} className="btn btn-ghost btn-sm" style={{ color: 'var(--info)' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
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
                            <h2 className="modal-title">{editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>
                            <button className="btn-ghost" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Plate Number</label>
                                <input 
                                    className="form-input" 
                                    value={formData.plateNumber} 
                                    onChange={e => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})} 
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Vehicle Type</label>
                                    <select 
                                        className="form-select"
                                        value={formData.vehicleType}
                                        onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                                    >
                                        <option value="BULK">BULK</option>
                                        <option value="BAG">BAG</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Capacity (Tons)</label>
                                    <input 
                                        type="number"
                                        className="form-input" 
                                        value={formData.maxCapacity} 
                                        onChange={e => setFormData({...formData, maxCapacity: e.target.value})} 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Model Description</label>
                                <input 
                                    className="form-input" 
                                    value={formData.model} 
                                    onChange={e => setFormData({...formData, model: e.target.value})} 
                                    placeholder="e.g. Mercedes Actros 2024"
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                                <input 
                                    type="checkbox" 
                                    id="isVehicleActive" 
                                    checked={formData.isActive}
                                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                />
                                <label htmlFor="isVehicleActive" className="form-label" style={{ marginBottom: 0 }}>Mark as Active</label>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={isSaving} className="btn btn-primary">
                                    <Save size={18} /> {isSaving ? 'Saving...' : editingVehicle ? 'Update' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
