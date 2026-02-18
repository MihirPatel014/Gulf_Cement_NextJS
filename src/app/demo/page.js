'use client';
import { useState } from 'react';
import useAppStore from '@/store/appStore';
import { Play, RefreshCw, Database, CheckCircle, ArrowRight, Zap } from 'lucide-react';

const DEMO_STEPS = [
    { id: 1, label: 'Approve Order', icon: '📋' },
    { id: 2, label: 'Create Token', icon: '🎫' },
    { id: 3, label: 'Allocate Zone + LP + WB', icon: '📍' },
    { id: 4, label: 'Capture Tare', icon: '⚖️' },
    { id: 5, label: 'Loading Complete', icon: '🏭' },
    { id: 6, label: 'Capture Gross → Voucher', icon: '📄' },
    { id: 7, label: 'Gate Exit (Token + PIN)', icon: '🚧' },
    { id: 8, label: 'Start Trip', icon: '🚛' },
    { id: 9, label: 'Driver Arrived', icon: '📍' },
    { id: 10, label: 'OTP → Delivery Confirmed', icon: '✅' },
    { id: 11, label: 'Documents Digitally Signed', icon: '🔏' },
];

export default function DemoPage() {
    const { orders, resetDemoData, runFullFlowDemo } = useAppStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [flowResult, setFlowResult] = useState('');
    const [running, setRunning] = useState(false);

    const handleLoadDemo = () => {
        resetDemoData();
        setFlowResult('✅ Demo data loaded successfully! All modules populated with sample data.');
        setCurrentStep(0);
    };

    const handleResetDemo = () => {
        resetDemoData();
        setFlowResult('🔄 Demo data reset! All data refreshed to initial state.');
        setCurrentStep(0);
    };

    const handleRunFullFlow = async () => {
        setRunning(true);
        setFlowResult('');
        for (let i = 1; i <= DEMO_STEPS.length; i++) {
            setCurrentStep(i);
            await new Promise((r) => setTimeout(r, 500));
        }
        const result = runFullFlowDemo();
        setFlowResult(result || '✅ Full flow completed successfully!');
        setRunning(false);
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Demo Mode</h1>
                <p className="page-subtitle">Load sample data, reset, or run a complete end-to-end flow demonstration</p>
            </div>

            <div className="demo-controls">
                <button className="btn btn-primary demo-btn" onClick={handleLoadDemo} disabled={running}>
                    <Database size={20} /> Load Demo Data
                </button>
                <button className="btn btn-outline demo-btn" onClick={handleResetDemo} disabled={running}>
                    <RefreshCw size={20} /> Reset Demo Data
                </button>
                <button className="btn btn-success demo-btn" onClick={handleRunFullFlow} disabled={running}>
                    <Play size={20} /> {running ? 'Running...' : 'Run Full Flow Demo'}
                </button>
            </div>

            {flowResult && (
                <div className="card" style={{ marginBottom: 24, padding: 16, background: flowResult.includes('✅') ? 'var(--success-bg)' : 'var(--info-bg)' }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{flowResult}</p>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div className="card-title"><Zap size={18} /> Full Flow Demo Steps</div>
                    <div className="card-subtitle">Order → Dispatch → Token → Zone → Load → Weigh → Gate → Trip → OTP → Signed</div>
                </div>
                <div className="demo-flow-steps">
                    {DEMO_STEPS.map((step) => {
                        const isCompleted = currentStep >= step.id;
                        const isActive = currentStep === step.id;
                        return (
                            <div key={step.id} className={`demo-step ${isCompleted ? 'completed' : ''} ${isActive && running ? 'active' : ''}`}>
                                <div className="demo-step-number">
                                    {isCompleted ? <CheckCircle size={14} /> : step.id}
                                </div>
                                <span style={{ fontSize: 20, marginRight: 4 }}>{step.icon}</span>
                                <span style={{ fontWeight: isActive ? 700 : 500, fontSize: 14 }}>{step.label}</span>
                                {step.id < DEMO_STEPS.length && <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid-3" style={{ marginTop: 24 }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{orders.length}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Orders</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)' }}>{orders.filter((o) => o.status === 'Delivered').length}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Delivered</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--warning)' }}>{orders.filter((o) => o.status === 'Pending').length}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pending</div>
                </div>
            </div>
        </>
    );
}
