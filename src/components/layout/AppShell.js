'use client';
import useAppStore from '@/store/appStore';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
    const { isAuthenticated, sidebarCollapsed } = useAppStore();

    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="app-shell">
            <Header />
            <Sidebar />
            <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {children}
            </main>
        </div>
    );
}
