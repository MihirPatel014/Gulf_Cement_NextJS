'use client';
import { create } from 'zustand';
import { generateDemoData } from '@/lib/demoData';
import { generateId, generateTokenNumber, generatePin, generateOTP, hashPin } from '@/lib/utils';
import { ROLES, ZONES, CUSTOMER_ACCOUNTS } from '@/lib/constants';

const initialData = generateDemoData();

const useAppStore = create((set, get) => ({
    // Auth
    user: null,
    role: null,
    isAuthenticated: false,
    customerId: null,

    // Data
    customers: initialData.customers,
    orders: initialData.orders,
    tokens: initialData.tokens,
    tokenCounter: initialData.tokenCounter,
    weighbridgeRecords: initialData.weighbridgeRecords,
    gateRecords: initialData.gateRecords,
    otpRecords: initialData.otpRecords,
    invoices: initialData.invoices,
    auditLogs: initialData.auditLogs,
    pinMap: initialData.pinMap,
    notifications: [
        { id: 1, message: 'New order ORD-2001 from Al Habtoor Construction', time: '5m ago', read: false },
        { id: 2, message: 'Token TK3 loading delayed > 30min', time: '12m ago', read: false },
        { id: 3, message: 'Weighbridge W1 captured gross for TK5', time: '25m ago', read: true },
        { id: 4, message: 'Gate exit verified for TK6', time: '1h ago', read: true },
        { id: 5, message: 'OTP delivery confirmed for TK1', time: '2h ago', read: true },
    ],
    sidebarCollapsed: false,

    // Auth Actions
    login: (role, userName, custId) => {
        set({
            user: { name: userName || role.replace(/_/g, ' ').toLowerCase(), role },
            role,
            isAuthenticated: true,
            customerId: custId || null,
        });
    },
    logout: () => {
        set({ user: null, role: null, isAuthenticated: false, customerId: null });
    },

    // Customer Login
    customerLogin: (email, password) => {
        const account = CUSTOMER_ACCOUNTS.find(a => a.email === email && a.password === password);
        if (!account) return { success: false, reason: 'Invalid email or password' };
        set({
            user: { name: account.name, role: ROLES.CUSTOMER },
            role: ROLES.CUSTOMER,
            isAuthenticated: true,
            customerId: account.id,
        });
        return { success: true, customerId: account.id };
    },

    // Sidebar
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

    // Audit
    addAuditLog: (action, details, user, orderId, tokenId) => {
        const log = {
            id: generateId('AUD'),
            action,
            details,
            user: user || get().user?.name || 'system',
            orderId,
            tokenId,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.100',
        };
        set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    },

    // Order Actions
    createOrder: (orderData) => {
        const id = generateId('ORD');
        const order = {
            ...orderData,
            id,
            status: 'Submitted',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            approvedAt: null,
            approvedBy: null,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        get().addAuditLog('ORDER_SUBMITTED', `Order ${id} submitted by customer`, 'customer.portal', id, null);
        return id;
    },

    approveOrder: (orderId) => {
        set((s) => ({
            orders: s.orders.map((o) =>
                o.id === orderId
                    ? { ...o, status: 'Approved', approvedAt: new Date().toISOString(), approvedBy: s.user?.name, updatedAt: new Date().toISOString() }
                    : o
            ),
        }));
        get().addAuditLog('ORDER_APPROVED', `Order ${orderId} approved`, null, orderId, null);
    },

    rejectOrder: (orderId) => {
        set((s) => ({
            orders: s.orders.map((o) =>
                o.id === orderId ? { ...o, status: 'Rejected', updatedAt: new Date().toISOString() } : o
            ),
        }));
        get().addAuditLog('ORDER_REJECTED', `Order ${orderId} rejected`, null, orderId, null);
    },

    holdOrder: (orderId) => {
        set((s) => ({
            orders: s.orders.map((o) =>
                o.id === orderId ? { ...o, status: 'On Hold', updatedAt: new Date().toISOString() } : o
            ),
        }));
        get().addAuditLog('ORDER_ON_HOLD', `Order ${orderId} put on hold`, null, orderId, null);
    },

    // Token Actions
    createToken: (orderId) => {
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return null;
        const counter = state.tokenCounter + 1;
        const tokenId = generateTokenNumber(counter);
        const pin = generatePin();
        const token = {
            id: tokenId,
            orderId,
            customerId: order.customerId,
            customerName: order.customerName,
            product: order.product.name,
            quantity: order.quantity,
            truckNumber: order.vehicleNumber || `DXB-${Math.floor(1000 + Math.random() * 9000)}`,
            driverName: order.driverName || 'Assigned Driver',
            driverMobile: order.driverMobile || '+971-55-0000000',
            zone: null,
            zoneId: null,
            loadingPoint: null,
            loadingPointId: null,
            weighbridge: null,
            weighbridgeId: null,
            stage: 'Token Issued',
            pin,
            pinHash: hashPin(pin),
            pinExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            pinAttempts: 0,
            pinLocked: false,
            createdAt: new Date().toISOString(),
            allocatedAt: null,
            loadingStartAt: null,
            loadingEndAt: null,
            tareAt: null,
            grossAt: null,
            gateOutAt: null,
            deliveredAt: null,
            alerts: [],
        };

        set((s) => ({
            tokens: [token, ...s.tokens],
            tokenCounter: counter,
            pinMap: { ...s.pinMap, [tokenId]: pin },
            orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: 'Token Issued', updatedAt: new Date().toISOString() } : o)),
        }));
        get().addAuditLog('TOKEN_CREATED', `Token ${tokenId} created for ${orderId}`, null, orderId, tokenId);
        get().addAuditLog('PIN_GENERATED', `Gate PIN generated for ${tokenId}`, 'system.auto', orderId, tokenId);
        return { tokenId, pin };
    },

    allocateZone: (tokenId, zoneId, loadingPointId) => {
        const zone = ZONES.find((z) => z.id === zoneId);
        const lp = zone?.loadingPoints.find((l) => l.id === loadingPointId);
        if (!zone || !lp) return;

        set((s) => ({
            tokens: s.tokens.map((t) =>
                t.id === tokenId
                    ? {
                        ...t,
                        zone: zone.name,
                        zoneId: zone.id,
                        loadingPoint: lp.name,
                        loadingPointId: lp.id,
                        weighbridge: zone.weighbridge.name,
                        weighbridgeId: zone.weighbridge.id,
                        stage: 'Zone Assigned',
                        allocatedAt: new Date().toISOString(),
                    }
                    : t
            ),
            orders: s.orders.map((o) => {
                const token = s.tokens.find((t) => t.id === tokenId);
                return token && o.id === token.orderId ? { ...o, status: 'Zone Assigned', updatedAt: new Date().toISOString() } : o;
            }),
        }));
        get().addAuditLog('ZONE_ALLOCATED', `${tokenId} → ${zone.name}, ${lp.name}, ${zone.weighbridge.name}`, null, null, tokenId);
    },

    // Weighbridge
    captureTare: (tokenId) => {
        const tare = 12000 + Math.floor(Math.random() * 4000);
        const token = get().tokens.find((t) => t.id === tokenId);
        set((s) => ({
            tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, stage: 'Loading', tareAt: new Date().toISOString() } : t)),
            weighbridgeRecords: [
                {
                    id: generateId('WB'),
                    tokenId,
                    orderId: token?.orderId,
                    truckNumber: token?.truckNumber,
                    driverName: token?.driverName,
                    product: token?.product,
                    weighbridgeId: token?.weighbridgeId,
                    weighbridgeName: token?.weighbridge,
                    tareWeight: tare,
                    grossWeight: null,
                    netWeight: null,
                    tareTimestamp: new Date().toISOString(),
                    grossTimestamp: null,
                    status: 'Tare Captured',
                    voucherGenerated: false,
                },
                ...s.weighbridgeRecords,
            ],
            orders: s.orders.map((o) => (o.id === token?.orderId ? { ...o, status: 'Loading', updatedAt: new Date().toISOString() } : o)),
        }));
        get().addAuditLog('TARE_CAPTURED', `${tokenId} tare: ${tare}kg`, null, token?.orderId, tokenId);
    },

    captureGross: (tokenId) => {
        const state = get();
        const wb = state.weighbridgeRecords.find((w) => w.tokenId === tokenId && !w.grossWeight);
        if (!wb) return;
        const gross = wb.tareWeight + 20000 + Math.floor(Math.random() * 15000);
        const net = gross - wb.tareWeight;
        set((s) => ({
            weighbridgeRecords: s.weighbridgeRecords.map((w) =>
                w.id === wb.id ? { ...w, grossWeight: gross, netWeight: net, grossTimestamp: new Date().toISOString(), status: 'Complete', voucherGenerated: true } : w
            ),
            tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, stage: 'Voucher Ready', grossAt: new Date().toISOString() } : t)),
            orders: s.orders.map((o) => (o.id === wb.orderId ? { ...o, status: 'Voucher Ready', updatedAt: new Date().toISOString() } : o)),
        }));
        get().addAuditLog('GROSS_CAPTURED', `${tokenId} gross: ${gross}kg, net: ${net}kg`, null, wb.orderId, tokenId);
        get().addAuditLog('VOUCHER_GENERATED', `Delivery voucher for ${tokenId}`, 'system.auto', wb.orderId, tokenId);
    },

    // Gate
    verifyGateExit: (tokenId, pin) => {
        const state = get();
        const token = state.tokens.find((t) => t.id === tokenId);
        if (!token) return { success: false, reason: 'Token not found' };
        if (token.stage !== 'Voucher Ready') return { success: false, reason: `Cannot exit — stage is "${token.stage}"` };
        if (token.pinLocked) return { success: false, reason: 'PIN is locked — max attempts exceeded' };
        if (new Date(token.pinExpiry) < new Date()) return { success: false, reason: 'PIN has expired' };
        if (pin !== state.pinMap[tokenId] && hashPin(pin) !== token.pinHash) {
            const attempts = token.pinAttempts + 1;
            const locked = attempts >= 5;
            set((s) => ({
                tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, pinAttempts: attempts, pinLocked: locked } : t)),
            }));
            return { success: false, reason: locked ? 'PIN locked after 5 attempts' : `Incorrect PIN (${attempts}/5)` };
        }
        // Success
        set((s) => ({
            tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, stage: 'Gate Out', gateOutAt: new Date().toISOString() } : t)),
            gateRecords: [
                { id: generateId('GATE'), tokenId, status: 'Passed', pin, verified: true, verifiedAt: new Date().toISOString(), reason: '' },
                ...s.gateRecords,
            ],
            orders: s.orders.map((o) => (o.id === token.orderId ? { ...o, status: 'Gate Out', updatedAt: new Date().toISOString() } : o)),
        }));
        get().addAuditLog('GATE_VERIFIED', `${tokenId} gate PIN verified`, null, token.orderId, tokenId);
        get().addAuditLog('GATE_EXIT', `${tokenId} gate exit recorded`, null, token.orderId, tokenId);
        return { success: true };
    },

    // Driver
    startTrip: (tokenId) => {
        const token = get().tokens.find((t) => t.id === tokenId);
        set((s) => ({
            tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, stage: 'In Transit' } : t)),
            orders: s.orders.map((o) => (o.id === token?.orderId ? { ...o, status: 'In Transit', updatedAt: new Date().toISOString() } : o)),
        }));
        get().addAuditLog('TRIP_STARTED', `${tokenId} trip started`, 'driver.app', token?.orderId, tokenId);
    },

    driverArrived: (tokenId) => {
        const token = get().tokens.find((t) => t.id === tokenId);
        const otp = generateOTP();
        set((s) => ({
            tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, stage: 'Arrived' } : t)),
            orders: s.orders.map((o) => (o.id === token?.orderId ? { ...o, status: 'Arrived', updatedAt: new Date().toISOString() } : o)),
            otpRecords: [
                {
                    id: generateId('OTP'),
                    tokenId,
                    orderId: token?.orderId,
                    otp,
                    status: 'Pending',
                    sentAt: new Date().toISOString(),
                    verifiedAt: null,
                    attempts: 0,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                    receiverName: null,
                    gpsLat: null,
                    gpsLng: null,
                    geoFenceOk: null,
                },
                ...s.otpRecords,
            ],
        }));
        get().addAuditLog('DRIVER_ARRIVED', `${tokenId} arrived`, 'driver.app', token?.orderId, tokenId);
        get().addAuditLog('OTP_SENT', `Delivery OTP sent for ${tokenId}`, 'system.auto', token?.orderId, tokenId);
        return otp;
    },

    // OTP Delivery
    verifyDeliveryOTP: (tokenId, otp, receiverName) => {
        const state = get();
        const record = state.otpRecords.find((r) => r.tokenId === tokenId && r.status === 'Pending');
        if (!record) return { success: false, reason: 'No pending OTP' };
        if (new Date(record.expiresAt) < new Date()) {
            set((s) => ({ otpRecords: s.otpRecords.map((r) => (r.id === record.id ? { ...r, status: 'Expired' } : r)) }));
            return { success: false, reason: 'OTP expired' };
        }
        if (record.attempts >= 5) {
            set((s) => ({ otpRecords: s.otpRecords.map((r) => (r.id === record.id ? { ...r, status: 'Locked' } : r)) }));
            return { success: false, reason: 'OTP locked (max attempts)' };
        }
        if (otp !== record.otp) {
            set((s) => ({
                otpRecords: s.otpRecords.map((r) => (r.id === record.id ? { ...r, attempts: r.attempts + 1 } : r)),
            }));
            return { success: false, reason: `Incorrect OTP (${record.attempts + 1}/5)` };
        }
        const token = state.tokens.find((t) => t.id === tokenId);
        set((s) => ({
            otpRecords: s.otpRecords.map((r) =>
                r.id === record.id
                    ? { ...r, status: 'Verified', verifiedAt: new Date().toISOString(), receiverName, gpsLat: 25.2, gpsLng: 55.3, geoFenceOk: true }
                    : r
            ),
            tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, stage: 'Delivered', deliveredAt: new Date().toISOString() } : t)),
            orders: s.orders.map((o) => (o.id === token?.orderId ? { ...o, status: 'Delivered', updatedAt: new Date().toISOString() } : o)),
        }));
        get().addAuditLog('OTP_VERIFIED', `Delivery OTP verified for ${tokenId}`, 'customer.portal', token?.orderId, tokenId);
        get().addAuditLog('DELIVERY_CONFIRMED', `${tokenId} delivery confirmed`, 'system.auto', token?.orderId, tokenId);
        get().addAuditLog('DOCUMENT_SIGNED', `Documents digitally signed for ${tokenId}`, 'system.auto', token?.orderId, tokenId);
        return { success: true };
    },

    // Customer Address Management
    addCustomerAddress: (customerId, address) => {
        set((s) => ({
            customers: s.customers.map((c) =>
                c.id === customerId
                    ? { ...c, deliveryAddresses: [...c.deliveryAddresses, address] }
                    : c
            ),
        }));
        get().addAuditLog('ADDRESS_ADDED', `New address added for ${customerId}`, 'customer.portal', null, null);
    },

    updateNotificationPrefs: (customerId, prefs) => {
        set((s) => ({
            customers: s.customers.map((c) =>
                c.id === customerId ? { ...c, notificationPrefs: prefs } : c
            ),
        }));
    },

    // Demo
    resetDemoData: () => {
        const data = generateDemoData();
        set({
            ...data,
        });
    },

    runFullFlowDemo: () => {
        const state = get();
        // Pick first pending/submitted order
        const pendingOrder = state.orders.find((o) => o.status === 'Pending' || o.status === 'Submitted');
        if (!pendingOrder) return 'No pending orders for demo';

        // 1. Approve
        get().approveOrder(pendingOrder.id);
        // 2. Create Token
        const tokenResult = get().createToken(pendingOrder.id);
        if (!tokenResult) return 'Token creation failed';
        // 3. Allocate Zone
        get().allocateZone(tokenResult.tokenId, 'ZONE-A', 'L1');
        // 4. Capture Tare
        get().captureTare(tokenResult.tokenId);
        // 5. Capture Gross
        get().captureGross(tokenResult.tokenId);
        // 6. Gate Exit
        get().verifyGateExit(tokenResult.tokenId, tokenResult.pin);
        // 7. Start Trip
        get().startTrip(tokenResult.tokenId);
        // 8. Driver Arrived
        const otp = get().driverArrived(tokenResult.tokenId);
        // 9. OTP Verify
        get().verifyDeliveryOTP(tokenResult.tokenId, otp, 'Demo Receiver');

        return `Full flow completed: ${pendingOrder.id} → ${tokenResult.tokenId} → Delivered`;
    },
}));

export default useAppStore;
