'use client';
import useAppStore from '@/store/appStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    ShoppingCart, Truck, Clock, Scale, AlertTriangle, CheckCircle,
    TrendingUp, DollarSign, Zap, BarChart3, Target, Users,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0B3D91', '#16A34A', '#F59E0B', '#DC2626', '#2563EB', '#6B7280'];

export default function MISPage() {
    const { orders, tokens, weighbridgeRecords, invoices } = useAppStore();

    const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length || 5;
    const deliveredTokens = tokens.filter((t) => t.stage === 'Delivered');
    const completedWB = weighbridgeRecords.filter((w) => w.status === 'Complete');

    const weeklyData = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        orders: Math.floor(4 + Math.random() * 8),
        dispatched: Math.floor(3 + Math.random() * 6),
        delivered: Math.floor(2 + Math.random() * 5),
    }));

    const tatData = [
        { hour: '8AM', tat: 145 }, { hour: '9AM', tat: 130 }, { hour: '10AM', tat: 155 }, { hour: '11AM', tat: 120 },
        { hour: '12PM', tat: 180 }, { hour: '1PM', tat: 165 }, { hour: '2PM', tat: 140 }, { hour: '3PM', tat: 125 },
    ];

    const productMix = [
        { name: 'OPC Bulk', value: 35 }, { name: 'Clinker', value: 25 }, { name: 'PPC Bags', value: 18 },
        { name: 'SRC Bulk', value: 12 }, { name: 'White', value: 10 },
    ];

    const wbUtilization = [
        { wb: 'W1', utilization: 78, idle: 22 }, { wb: 'W2', utilization: 65, idle: 35 },
    ];

    const monthlyRevenue = [
        { month: 'Sep', revenue: 320000 }, { month: 'Oct', revenue: 380000 }, { month: 'Nov', revenue: 410000 },
        { month: 'Dec', revenue: 355000 }, { month: 'Jan', revenue: 425000 }, { month: 'Feb', revenue: 460000 },
    ];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Management MIS Reports</h1>
                <p className="page-subtitle">Comprehensive operations intelligence — {formatDate(new Date())}</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Orders Today</div><div className="kpi-value">{ordersToday}</div><div className="kpi-change up">↑ 15% vs avg</div></div>
                    <div className="kpi-icon primary"><ShoppingCart size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Dispatch Today</div><div className="kpi-value">{Math.max(3, tokens.filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString()).length)}</div></div>
                    <div className="kpi-icon success"><Truck size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">Avg TAT</div><div className="kpi-value">2h 34m</div><div className="kpi-change up">↓ 12% improved</div></div>
                    <div className="kpi-icon info"><Clock size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">WB Utilization</div><div className="kpi-value">72%</div></div>
                    <div className="kpi-icon warning"><Scale size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Loading Utilization</div><div className="kpi-value">78%</div></div>
                    <div className="kpi-icon success"><Zap size={24} /></div>
                </div>
                <div className="kpi-card danger">
                    <div><div className="kpi-label">Exceptions</div><div className="kpi-value">{tokens.filter((t) => t.alerts.length > 0).length}</div></div>
                    <div className="kpi-icon danger"><AlertTriangle size={24} /></div>
                </div>
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Revenue (MTD)</div><div className="kpi-value">{formatCurrency(invoices.reduce((s, i) => s + i.total, 0))}</div></div>
                    <div className="kpi-icon primary"><DollarSign size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">On-time %</div><div className="kpi-value">{Math.round((deliveredTokens.length / Math.max(tokens.length, 1)) * 100)}%</div><div className="kpi-change up">Target: 95%</div></div>
                    <div className="kpi-icon success"><Target size={24} /></div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">Weekly Orders / Dispatch / Delivery</div></div>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#0B3D91" radius={[4, 4, 0, 0]} name="Orders" />
                                <Bar dataKey="dispatched" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Dispatched" />
                                <Bar dataKey="delivered" fill="#16A34A" radius={[4, 4, 0, 0]} name="Delivered" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">TAT Trend (minutes)</div></div>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <AreaChart data={tatData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="tat" stroke="#0B3D91" fill="rgba(11,61,145,0.1)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">Product Mix (%)</div></div>
                    <div className="chart-container-sm">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={productMix} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                    {productMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">WB Utilization</div></div>
                    <div className="chart-container-sm">
                        <ResponsiveContainer>
                            <BarChart data={wbUtilization} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                <YAxis type="category" dataKey="wb" tick={{ fontSize: 12 }} width={40} />
                                <Tooltip />
                                <Bar dataKey="utilization" fill="#16A34A" stackId="a" radius={[0, 4, 4, 0]} name="Active" />
                                <Bar dataKey="idle" fill="#E5E7EB" stackId="a" radius={[0, 4, 4, 0]} name="Idle" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">Monthly Revenue (AED)</div></div>
                    <div className="chart-container-sm">
                        <ResponsiveContainer>
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Line type="monotone" dataKey="revenue" stroke="#0B3D91" strokeWidth={2} dot={{ fill: '#0B3D91' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
