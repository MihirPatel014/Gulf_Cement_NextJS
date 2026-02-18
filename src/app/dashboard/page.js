'use client';
import useAppStore from '@/store/appStore';
import { formatCurrency, formatDate, getStatusColor, getTimeDiff } from '@/lib/utils';
import {
    ShoppingCart, Truck, Scale, BarChart3, Clock, AlertTriangle,
    CheckCircle, TrendingUp, DollarSign, Zap,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0B3D91', '#16A34A', '#F59E0B', '#DC2626', '#6B7280', '#2563EB'];

export default function DashboardPage() {
    const { orders, tokens, weighbridgeRecords, invoices, auditLogs } = useAppStore();

    const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length || 3;
    const dispatchToday = tokens.filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString()).length || 5;
    const deliveredTokens = tokens.filter((t) => t.stage === 'Delivered');
    const avgTAT = deliveredTokens.length > 0 ? '2h 34m' : '—';
    const wbUtil = `${Math.round((weighbridgeRecords.filter((w) => w.status === 'Complete').length / Math.max(weighbridgeRecords.length, 1)) * 100)}%`;
    const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
    const exceptions = tokens.filter((t) => t.alerts.length > 0).length;
    const onTime = `${Math.round((deliveredTokens.length / Math.max(tokens.length, 1)) * 100)}%`;

    const ordersByStatus = ['Pending', 'Approved', 'In Transit', 'Delivered', 'Rejected'].map((s) => ({
        name: s, value: orders.filter((o) => o.status === s).length || 1,
    }));

    const dailyOrders = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        orders: Math.floor(3 + Math.random() * 8),
        dispatched: Math.floor(2 + Math.random() * 6),
    }));

    const revenueData = Array.from({ length: 6 }, (_, i) => ({
        month: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i],
        revenue: 150000 + Math.floor(Math.random() * 100000),
    }));

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">CEO Dashboard</h1>
                <p className="page-subtitle">Gulf Cement Operations Overview — {formatDate(new Date())}</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <div><div className="kpi-label">Orders Today</div><div className="kpi-value">{ordersToday}</div><div className="kpi-change up">↑ 12% vs yesterday</div></div>
                    <div className="kpi-icon primary"><ShoppingCart size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Dispatched Today</div><div className="kpi-value">{dispatchToday}</div><div className="kpi-change up">↑ 8% vs yesterday</div></div>
                    <div className="kpi-icon success"><Truck size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">Avg TAT</div><div className="kpi-value">{avgTAT}</div><div className="kpi-change up">↓ 15min improvement</div></div>
                    <div className="kpi-icon info"><Clock size={24} /></div>
                </div>
                <div className="kpi-card warning">
                    <div><div className="kpi-label">WB Utilization</div><div className="kpi-value">{wbUtil}</div><div className="kpi-change up">Optimal range</div></div>
                    <div className="kpi-icon warning"><Scale size={24} /></div>
                </div>
                <div className="kpi-card danger">
                    <div><div className="kpi-label">Exceptions</div><div className="kpi-value">{exceptions}</div><div className="kpi-change down">{exceptions} alerts active</div></div>
                    <div className="kpi-icon danger"><AlertTriangle size={24} /></div>
                </div>
                <div className="kpi-card success">
                    <div><div className="kpi-label">Revenue (MTD)</div><div className="kpi-value">{formatCurrency(totalRevenue)}</div><div className="kpi-change up">↑ 18% vs last month</div></div>
                    <div className="kpi-icon success"><DollarSign size={24} /></div>
                </div>
                <div className="kpi-card primary">
                    <div><div className="kpi-label">On-Time Delivery</div><div className="kpi-value">{onTime}</div><div className="kpi-change up">Target: 95%</div></div>
                    <div className="kpi-icon primary"><CheckCircle size={24} /></div>
                </div>
                <div className="kpi-card info">
                    <div><div className="kpi-label">Loading Utilization</div><div className="kpi-value">78%</div><div className="kpi-change up">↑ 5% improvement</div></div>
                    <div className="kpi-icon info"><Zap size={24} /></div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">Orders & Dispatch Trend</div></div>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <BarChart data={dailyOrders}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#0B3D91" radius={[4, 4, 0, 0]} name="Orders" />
                                <Bar dataKey="dispatched" fill="#16A34A" radius={[4, 4, 0, 0]} name="Dispatched" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">Revenue Trend (AED)</div></div>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <LineChart data={revenueData}>
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

            <div className="grid-2">
                <div className="card">
                    <div className="card-header"><div className="card-title">Orders by Status</div></div>
                    <div className="chart-container-sm">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={ordersByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                                    {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">Recent Activity</div></div>
                    <div className="timeline">
                        {auditLogs.slice(0, 5).map((log) => (
                            <div key={log.id} className="timeline-item">
                                <div className="timeline-dot-container">
                                    <div className="timeline-dot completed" />
                                    <div className="timeline-line" />
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-title">{log.action.replace(/_/g, ' ')}</div>
                                    <div className="timeline-desc">{log.details}</div>
                                    <div className="timeline-time">{formatDate(log.timestamp)} · {log.user}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
