'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { NAV_ITEMS, CUSTOMER_NAV_ITEMS, ROLES } from '@/lib/constants';
import {
    LayoutDashboard, ShoppingCart, ClipboardCheck, Ticket, Scale,
    ShieldCheck, Truck, MapPin, FileText, BarChart3, ClipboardList,
    Settings, Play, Factory, Zap, Home, Package, PlusCircle,
    FolderOpen, UserCircle,
} from 'lucide-react';

const ICON_MAP = {
    LayoutDashboard, ShoppingCart, ClipboardCheck, Ticket, Scale,
    ShieldCheck, Truck, MapPin, FileText, BarChart3, ClipboardList,
    Settings, Play, Factory, Zap, Home, Package, PlusCircle,
    FolderOpen, UserCircle,
};

export default function Sidebar() {
    const pathname = usePathname();
    const { role, sidebarCollapsed } = useAppStore();

    if (!role) return null;

    const isCustomer = role === ROLES.CUSTOMER;
    const navItems = isCustomer
        ? CUSTOMER_NAV_ITEMS
        : NAV_ITEMS.filter((item) => item.roles.includes(role) || role === 'SYSTEM_ADMIN');

    return (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">{isCustomer ? 'Customer Portal' : 'Navigation'}</div>
                {navItems.map((item) => {
                    const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/customer/dashboard' && pathname.startsWith(item.href) && item.href !== '/customer/orders/new');
                    return (
                        <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                            <IconComponent size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
