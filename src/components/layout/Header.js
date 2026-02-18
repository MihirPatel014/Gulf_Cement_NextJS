'use client';
import { useState } from 'react';
import { Search, Bell, Menu, LogOut, User } from 'lucide-react';
import useAppStore from '@/store/appStore';
import { ROLE_LABELS } from '@/lib/constants';

export default function Header() {
    const { user, role, notifications, toggleSidebar, logout } = useAppStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const unreadCount = notifications.filter((n) => !n.read).length;

    if (!user) return null;

    return (
        <header className="header">
            <div className="header-left">
                <button className="header-toggle" onClick={toggleSidebar}><Menu size={20} /></button>
                <div className="header-logo">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.2)" />
                        <path d="M8 24V16L16 8L24 16V24H18V18H14V24H8Z" fill="white" />
                    </svg>
                    Gulf Cement
                </div>
                <div className="header-search">
                    <Search size={16} color="rgba(255,255,255,0.6)" />
                    <input type="text" placeholder="Search orders, tokens, trucks..." />
                </div>
            </div>
            <div className="header-right">
                <div className="header-role-badge">
                    <User size={14} />
                    {ROLE_LABELS[role]}
                </div>
                <div style={{ position: 'relative' }}>
                    <button className="header-notification" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="notification-badge" />}
                    </button>
                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">Notifications ({unreadCount} new)</div>
                            {notifications.slice(0, 5).map((n) => (
                                <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                                    <div className="notification-msg">{n.message}</div>
                                    <div className="notification-time">{n.time}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ position: 'relative' }}>
                    <div className="header-user" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <div className="header-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    </div>
                    {showUserMenu && (
                        <div className="notification-dropdown" style={{ width: 200 }}>
                            <div className="notification-item" onClick={() => { logout(); window.location.href = '/'; }}>
                                <div className="notification-msg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <LogOut size={14} /> Sign Out
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
