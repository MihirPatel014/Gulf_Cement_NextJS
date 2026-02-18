export function formatCurrency(amount) {
    return `AED ${Number(amount).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date) {
    return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function generateId(prefix = 'ID') {
    return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

export function generateTokenNumber(count) {
    return `TK${count}`;
}

export function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashPin(pin) {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        const char = pin.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(16);
}

export function getStatusColor(status) {
    const colors = {
        'Pending': 'warning',
        'Approved': 'success',
        'Rejected': 'danger',
        'On Hold': 'warning',
        'Token Issued': 'info',
        'Zone Assigned': 'info',
        'Loading': 'info',
        'Weighing': 'info',
        'Voucher Ready': 'success',
        'Gate Out': 'success',
        'In Transit': 'info',
        'Arrived': 'success',
        'Delivered': 'success',
        'Draft': 'muted',
        'Issued': 'info',
        'Delivered Verified': 'success',
        'Paid': 'success',
        'Overdue': 'danger',
        'Valid': 'success',
        'Expired': 'danger',
        'Locked': 'danger',
        'Used': 'muted',
        'Not Ready': 'warning',
        'Success': 'success',
        'Flagged': 'danger',
    };
    return colors[status] || 'muted';
}

export function getTimeDiff(start, end) {
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}

export function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}

export function hoursAgo(hours) {
    const d = new Date();
    d.setHours(d.getHours() - hours);
    return d.toISOString();
}

export function minutesAgo(minutes) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - minutes);
    return d.toISOString();
}

export function minutesFromNow(minutes) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString();
}
