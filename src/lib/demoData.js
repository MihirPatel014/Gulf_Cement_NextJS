import { PRODUCTS, ZONES, AUDIT_ACTIONS } from './constants';
import { daysAgo, hoursAgo, minutesAgo, generateId, hashPin } from './utils';

const CUSTOMER_NAMES = [
    'Al Habtoor Construction', 'Emirates Building Materials', 'Dubai Contracting LLC',
    'Sharjah Cement Works', 'RAK Properties Group', 'Abu Dhabi Builders Co',
    'Ajman Ready Mix', 'Fujairah Construction Corp', 'Gulf Marine Services',
    'Modern Building Solutions', 'National Projects LLC', 'United Concrete Co',
];

const DRIVER_NAMES = [
    'Mohammed Al Farsi', 'Ahmed Hassan', 'Omar Khalid', 'Saeed Rashid',
    'Khalil Ibrahim', 'Youssef Nasser', 'Faisal Mahmoud', 'Tariq Salim',
    'Hassan Qasim', 'Bilal Ahmad', 'Hamza Ali', 'Jamal Rasheed',
];

const TRUCK_NUMBERS = [
    'DXB-4521', 'SHJ-7823', 'AUH-3345', 'AJM-9912', 'RAK-5567',
    'FUJ-2234', 'UAQ-8891', 'DXB-6673', 'SHJ-1198', 'AUH-4456',
    'DXB-7789', 'RAK-3321',
];

const ADDRESSES = [
    { label: 'Al Quoz Warehouse', address: 'Al Quoz Industrial Area 3, Dubai', city: 'Dubai', lat: 25.1543, lng: 55.2367 },
    { label: 'Mussafah Site', address: 'Mussafah Industrial, Abu Dhabi', city: 'Abu Dhabi', lat: 24.3471, lng: 54.4962 },
    { label: 'Sharjah Depot', address: 'Industrial Area 15, Sharjah', city: 'Sharjah', lat: 25.2948, lng: 55.4534 },
    { label: 'RAK Free Zone', address: 'RAK Free Trade Zone, Ras Al Khaimah', city: 'Ras Al Khaimah', lat: 25.7742, lng: 55.9432 },
    { label: 'Ajman Site', address: 'Ajman Industrial Area, Ajman', city: 'Ajman', lat: 25.3923, lng: 55.4887 },
    { label: 'Fujairah Port', address: 'Fujairah Port Area, Fujairah', city: 'Fujairah', lat: 25.1164, lng: 56.3411 },
    { label: 'JAFZA Office', address: 'JAFZA, Jebel Ali, Dubai', city: 'Dubai', lat: 24.9857, lng: 55.0272 },
    { label: 'KIZAD Facility', address: 'KIZAD, Abu Dhabi', city: 'Abu Dhabi', lat: 24.7541, lng: 54.6502 },
    { label: 'Hamriyah FZ', address: 'Hamriyah Free Zone, Sharjah', city: 'Sharjah', lat: 25.4612, lng: 55.5321 },
    { label: 'DIP Compound', address: 'Dubai Investment Park, Dubai', city: 'Dubai', lat: 24.9931, lng: 55.1853 },
];

export function generateDemoData() {
    const customers = CUSTOMER_NAMES.map((name, i) => ({
        id: `CUST-${1001 + i}`,
        companyName: name,
        vatNumber: `AE${100000000 + Math.floor(Math.random() * 900000000)}`,
        phone: `+971-${50 + Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
        email: name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '') + '@company.ae',
        contactPerson: DRIVER_NAMES[i] || 'Contact Person',
        deliveryAddresses: [ADDRESSES[i % ADDRESSES.length], ADDRESSES[(i + 3) % ADDRESSES.length], ADDRESSES[(i + 6) % ADDRESSES.length]],
        notificationPrefs: { sms: true, whatsapp: true, email: true },
        status: 'Active',
        createdAt: daysAgo(30 + i * 5),
        creditLimit: 50000 + i * 10000,
        outstandingBalance: Math.floor(Math.random() * 30000),
    }));

    // Generate orders: ensure first 3 customers (CUST-1001, 1002, 1003) have 10+ orders each
    const allStatuses = ['Submitted', 'Pending', 'Approved', 'Token Issued', 'Zone Assigned', 'Loading', 'Weighing', 'Voucher Ready', 'Gate Out', 'In Transit', 'Arrived', 'Delivered', 'Rejected'];
    const orders = [];
    let orderIdx = 0;

    // 10 orders each for first 3 customers (portal customers)
    for (let custIdx = 0; custIdx < 3; custIdx++) {
        const customer = customers[custIdx];
        for (let j = 0; j < 10; j++) {
            const product = PRODUCTS[(custIdx * 10 + j) % PRODUCTS.length];
            const status = allStatuses[j % allStatuses.length];
            const qty = product.packaging === 'Bulk' ? 25 + Math.floor(Math.random() * 75) : 200 + Math.floor(Math.random() * 800);
            const transport = j % 3 === 0 ? 'own' : 'company';
            const addr = ADDRESSES[(custIdx + j) % ADDRESSES.length];
            orders.push({
                id: `ORD-${2001 + orderIdx}`,
                customerId: customer.id,
                customerName: customer.companyName,
                product: product,
                quantity: qty,
                totalAmount: qty * product.price,
                packaging: product.packaging,
                transportOption: transport,
                deliveryAddress: addr.address,
                deliveryCity: addr.city,
                deliveryLat: addr.lat,
                deliveryLng: addr.lng,
                preferredDate: daysAgo(-1 * (j % 5)),
                notes: j % 4 === 0 ? 'Urgent delivery required' : '',
                status: status,
                vehicleNumber: transport === 'own' ? TRUCK_NUMBERS[(custIdx + j) % TRUCK_NUMBERS.length] : '',
                driverName: transport === 'own' ? DRIVER_NAMES[(custIdx + j) % DRIVER_NAMES.length] : '',
                driverMobile: transport === 'own' ? `+971-55-${Math.floor(1000000 + Math.random() * 9000000)}` : '',
                estimatedArrival: transport === 'own' ? hoursAgo(-2) : '',
                createdAt: daysAgo(j + 1 + custIdx),
                updatedAt: hoursAgo(j * 2),
                approvedAt: !['Submitted', 'Pending', 'Rejected'].includes(status) ? daysAgo(j) : null,
                approvedBy: !['Submitted', 'Pending', 'Rejected'].includes(status) ? 'dispatch.admin' : null,
            });
            orderIdx++;
        }
    }

    // 2 more orders per remaining customer for variety
    for (let custIdx = 3; custIdx < customers.length; custIdx++) {
        const customer = customers[custIdx];
        for (let j = 0; j < 2; j++) {
            const product = PRODUCTS[(custIdx + j) % PRODUCTS.length];
            const status = j === 0 ? 'Delivered' : 'Approved';
            const qty = product.packaging === 'Bulk' ? 30 + Math.floor(Math.random() * 50) : 300 + Math.floor(Math.random() * 500);
            const transport = j === 0 ? 'company' : 'own';
            const addr = ADDRESSES[custIdx % ADDRESSES.length];
            orders.push({
                id: `ORD-${2001 + orderIdx}`,
                customerId: customer.id,
                customerName: customer.companyName,
                product: product,
                quantity: qty,
                totalAmount: qty * product.price,
                packaging: product.packaging,
                transportOption: transport,
                deliveryAddress: addr.address,
                deliveryCity: addr.city || '',
                deliveryLat: addr.lat,
                deliveryLng: addr.lng,
                preferredDate: daysAgo(-2),
                notes: '',
                status: status,
                vehicleNumber: transport === 'own' ? TRUCK_NUMBERS[custIdx % TRUCK_NUMBERS.length] : '',
                driverName: transport === 'own' ? DRIVER_NAMES[custIdx % DRIVER_NAMES.length] : '',
                driverMobile: transport === 'own' ? `+971-55-${Math.floor(1000000 + Math.random() * 9000000)}` : '',
                estimatedArrival: transport === 'own' ? hoursAgo(-2) : '',
                createdAt: daysAgo(custIdx),
                updatedAt: hoursAgo(custIdx * 2),
                approvedAt: daysAgo(custIdx - 1),
                approvedBy: 'dispatch.admin',
            });
            orderIdx++;
        }
    }

    const tokenCount = 10;
    const tokens = [];
    const pinMap = {};
    for (let i = 0; i < tokenCount; i++) {
        const order = orders[i % orders.length];
        const zone = ZONES[i % 2];
        const lp = zone.loadingPoints[i % zone.loadingPoints.length];
        const pin = String(100000 + i * 100000 + Math.floor(Math.random() * 99999));
        const tokenStages = ['Token Issued', 'Zone Assigned', 'Loading', 'Weighing', 'Voucher Ready', 'Gate Out', 'In Transit', 'Arrived', 'Delivered', 'Delivered'];
        tokens.push({
            id: `TK${i + 1}`,
            orderId: order.id,
            customerId: order.customerId,
            customerName: order.customerName,
            product: order.product.name,
            quantity: order.quantity,
            truckNumber: TRUCK_NUMBERS[i % TRUCK_NUMBERS.length],
            driverName: DRIVER_NAMES[i % DRIVER_NAMES.length],
            driverMobile: `+971-55-${Math.floor(1000000 + Math.random() * 9000000)}`,
            zone: zone.name,
            zoneId: zone.id,
            loadingPoint: lp.name,
            loadingPointId: lp.id,
            weighbridge: zone.weighbridge.name,
            weighbridgeId: zone.weighbridge.id,
            stage: tokenStages[i],
            pin: pin,
            pinHash: hashPin(pin),
            pinExpiry: i === 6 ? hoursAgo(25) : daysAgo(-1),
            pinAttempts: i === 7 ? 5 : 0,
            pinLocked: i === 7,
            createdAt: hoursAgo(tokenCount - i + 5),
            allocatedAt: hoursAgo(tokenCount - i + 4),
            loadingStartAt: i >= 3 ? hoursAgo(tokenCount - i + 3) : null,
            loadingEndAt: i >= 3 ? hoursAgo(tokenCount - i + 2) : null,
            tareAt: i >= 4 ? hoursAgo(tokenCount - i + 2) : null,
            grossAt: i >= 4 ? hoursAgo(tokenCount - i + 1) : null,
            gateOutAt: i >= 5 ? hoursAgo(tokenCount - i) : null,
            deliveredAt: i >= 8 ? hoursAgo(tokenCount - i - 1) : null,
            alerts: i === 3 ? ['Loading delayed > 30min'] : [],
        });
        pinMap[`TK${i + 1}`] = pin;
    }

    const weighbridgeRecords = [];
    for (let i = 0; i < 10; i++) {
        const token = tokens[i];
        const tare = 12000 + Math.floor(Math.random() * 4000);
        const gross = tare + 20000 + Math.floor(Math.random() * 15000);
        weighbridgeRecords.push({
            id: `WB-${3001 + i}`,
            tokenId: token.id,
            orderId: token.orderId,
            truckNumber: token.truckNumber,
            driverName: token.driverName,
            product: token.product,
            weighbridgeId: token.weighbridgeId,
            weighbridgeName: token.weighbridge,
            tareWeight: tare,
            grossWeight: i >= 4 ? gross : null,
            netWeight: i >= 4 ? gross - tare : null,
            tareTimestamp: hoursAgo(10 - i),
            grossTimestamp: i >= 4 ? hoursAgo(9 - i) : null,
            status: i >= 4 ? 'Complete' : 'Tare Captured',
            voucherGenerated: i >= 5,
        });
    }

    const gateRecords = [
        { id: 'GATE-001', tokenId: 'TK1', status: 'Passed', pin: pinMap['TK1'], verified: true, verifiedAt: hoursAgo(8), reason: '' },
        { id: 'GATE-002', tokenId: 'TK2', status: 'Passed', pin: pinMap['TK2'], verified: true, verifiedAt: hoursAgo(7), reason: '' },
        { id: 'GATE-003', tokenId: 'TK3', status: 'Passed', pin: pinMap['TK3'], verified: true, verifiedAt: hoursAgo(6), reason: '' },
        { id: 'GATE-004', tokenId: 'TK4', status: 'Passed', pin: pinMap['TK4'], verified: true, verifiedAt: hoursAgo(5), reason: '' },
        { id: 'GATE-005', tokenId: 'TK5', status: 'Passed', pin: pinMap['TK5'], verified: true, verifiedAt: hoursAgo(4), reason: '' },
        { id: 'GATE-006', tokenId: 'TK6', status: 'Passed', pin: pinMap['TK6'], verified: true, verifiedAt: hoursAgo(3), reason: '' },
        { id: 'GATE-007', tokenId: 'TK7', status: 'Expired', pin: pinMap['TK7'], verified: false, verifiedAt: null, reason: 'PIN expired' },
        { id: 'GATE-008', tokenId: 'TK8', status: 'Locked', pin: pinMap['TK8'], verified: false, verifiedAt: null, reason: 'Max attempts exceeded' },
        { id: 'GATE-009', tokenId: 'TK9', status: 'Not Ready', pin: pinMap['TK9'], verified: false, verifiedAt: null, reason: 'Voucher not ready' },
        { id: 'GATE-010', tokenId: 'TK10', status: 'Used', pin: pinMap['TK10'], verified: true, verifiedAt: hoursAgo(1), reason: 'Already passed' },
    ];

    const otpRecords = [
        { id: 'OTP-001', tokenId: 'TK1', orderId: 'ORD-2001', otp: '284731', status: 'Verified', sentAt: hoursAgo(7), verifiedAt: hoursAgo(6.5), attempts: 1, expiresAt: hoursAgo(6.75), receiverName: 'Ali Hassan', gpsLat: 25.1543, gpsLng: 55.2367, geoFenceOk: true },
        { id: 'OTP-002', tokenId: 'TK2', orderId: 'ORD-2002', otp: '593812', status: 'Verified', sentAt: hoursAgo(6), verifiedAt: hoursAgo(5.5), attempts: 1, expiresAt: hoursAgo(5.75), receiverName: 'Saeed Khalid', gpsLat: 24.3471, gpsLng: 54.4962, geoFenceOk: true },
        { id: 'OTP-003', tokenId: 'TK3', orderId: 'ORD-2003', otp: '174629', status: 'Verified', sentAt: hoursAgo(5), verifiedAt: hoursAgo(4.8), attempts: 2, expiresAt: hoursAgo(4.75), receiverName: 'Omar Rashid', gpsLat: 25.2948, gpsLng: 55.4534, geoFenceOk: true },
        { id: 'OTP-004', tokenId: 'TK4', orderId: 'ORD-2004', otp: '847392', status: 'Verified', sentAt: hoursAgo(4), verifiedAt: hoursAgo(3.5), attempts: 1, expiresAt: hoursAgo(3.75), receiverName: 'Faisal Mahmoud', gpsLat: 25.7742, gpsLng: 55.9432, geoFenceOk: true },
        { id: 'OTP-005', tokenId: 'TK5', orderId: 'ORD-2005', otp: '629481', status: 'Verified', sentAt: hoursAgo(3), verifiedAt: hoursAgo(2.5), attempts: 1, expiresAt: hoursAgo(2.75), receiverName: 'Tariq Ibrahim', gpsLat: 25.3923, gpsLng: 55.4887, geoFenceOk: true },
        { id: 'OTP-006', tokenId: 'TK6', orderId: 'ORD-2006', otp: '381947', status: 'Verified', sentAt: hoursAgo(2), verifiedAt: hoursAgo(1.5), attempts: 1, expiresAt: hoursAgo(1.75), receiverName: 'Bilal Ahmad', gpsLat: 25.1164, gpsLng: 56.3411, geoFenceOk: true },
        { id: 'OTP-007', tokenId: 'TK7', orderId: 'ORD-2007', otp: '749283', status: 'Expired', sentAt: hoursAgo(1), verifiedAt: null, attempts: 0, expiresAt: minutesAgo(45), receiverName: null, gpsLat: null, gpsLng: null, geoFenceOk: null },
        { id: 'OTP-008', tokenId: 'TK8', orderId: 'ORD-2008', otp: '582164', status: 'Locked', sentAt: hoursAgo(1.5), verifiedAt: null, attempts: 5, expiresAt: hoursAgo(1.25), receiverName: null, gpsLat: null, gpsLng: null, geoFenceOk: null },
        { id: 'OTP-009', tokenId: 'TK9', orderId: 'ORD-2009', otp: '937261', status: 'Pending', sentAt: minutesAgo(10), verifiedAt: null, attempts: 0, expiresAt: minutesAgo(-5), receiverName: null, gpsLat: null, gpsLng: null, geoFenceOk: null },
        { id: 'OTP-010', tokenId: 'TK10', orderId: 'ORD-2010', otp: '415873', status: 'Flagged', sentAt: hoursAgo(2), verifiedAt: hoursAgo(1.8), attempts: 3, expiresAt: hoursAgo(1.75), receiverName: 'Unknown', gpsLat: 26.0000, gpsLng: 56.0000, geoFenceOk: false },
    ];

    const invoices = [];
    const invoiceStatuses = ['Draft', 'Issued', 'Delivered Verified', 'Paid', 'Paid', 'Issued', 'Overdue', 'Paid', 'Issued', 'Delivered Verified'];
    for (let i = 0; i < 10; i++) {
        const order = orders[i];
        invoices.push({
            id: `INV-${4001 + i}`,
            orderId: order.id,
            customerId: order.customerId,
            customerName: order.customerName,
            product: order.product.name,
            quantity: order.quantity,
            unitPrice: order.product.price,
            subtotal: order.totalAmount,
            vat: Math.round(order.totalAmount * 0.05),
            total: Math.round(order.totalAmount * 1.05),
            status: invoiceStatuses[i],
            issuedAt: daysAgo(i + 1),
            dueDate: daysAgo(-(30 - i)),
            paidAt: ['Paid'].includes(invoiceStatuses[i]) ? daysAgo(Math.max(0, i - 3)) : null,
            paidAmount: ['Paid'].includes(invoiceStatuses[i]) ? Math.round(order.totalAmount * 1.05) : 0,
        });
    }

    const auditLogs = [];
    const users = ['dispatch.admin', 'ccr.operator', 'wb.operator1', 'gate.officer', 'finance.user', 'system.admin', 'transport.mgr'];
    let auditIdx = 0;
    for (let i = 0; i < 12; i++) {
        const orderId = `ORD-${2001 + (i % 12)}`;
        const tokenId = `TK${(i % 10) + 1}`;
        const actions = [
            { action: 'ORDER_CREATED', details: `Order ${orderId} created`, user: 'customer.portal' },
            { action: 'ORDER_APPROVED', details: `Order ${orderId} approved`, user: 'dispatch.admin' },
            { action: 'TOKEN_CREATED', details: `Token ${tokenId} created for ${orderId}`, user: 'ccr.operator' },
            { action: 'ZONE_ALLOCATED', details: `${tokenId} allocated to Zone A, L${(i % 4) + 1}`, user: 'ccr.operator' },
            { action: 'TARE_CAPTURED', details: `${tokenId} tare: ${12000 + i * 200}kg at W1`, user: 'wb.operator1' },
            { action: 'GROSS_CAPTURED', details: `${tokenId} gross: ${32000 + i * 300}kg at W1`, user: 'wb.operator1' },
        ];
        if (i < 8) {
            actions.push({ action: 'VOUCHER_GENERATED', details: `Delivery voucher for ${tokenId}`, user: 'system.auto' });
            actions.push({ action: 'PIN_GENERATED', details: `Gate PIN for ${tokenId}`, user: 'system.auto' });
        }
        if (i < 6) {
            actions.push({ action: 'GATE_VERIFIED', details: `${tokenId} gate PIN verified`, user: 'gate.officer' });
            actions.push({ action: 'GATE_EXIT', details: `${tokenId} gate exit recorded`, user: 'gate.officer' });
        }
        if (i < 4) {
            actions.push({ action: 'TRIP_STARTED', details: `${tokenId} trip started`, user: 'driver.app' });
            actions.push({ action: 'OTP_SENT', details: `Delivery OTP sent for ${tokenId}`, user: 'system.auto' });
            actions.push({ action: 'OTP_VERIFIED', details: `Delivery OTP verified for ${tokenId}`, user: 'driver.app' });
            actions.push({ action: 'DELIVERY_CONFIRMED', details: `${tokenId} delivery confirmed`, user: 'system.auto' });
            actions.push({ action: 'DOCUMENT_SIGNED', details: `Documents signed for ${tokenId}`, user: 'system.auto' });
        }
        actions.forEach((a, j) => {
            auditLogs.push({
                id: `AUD-${5001 + auditIdx}`,
                ...a,
                orderId,
                tokenId: j >= 2 ? tokenId : null,
                timestamp: hoursAgo(60 - auditIdx * 0.5),
                ipAddress: `192.168.1.${100 + (auditIdx % 50)}`,
            });
            auditIdx++;
        });
    }

    return {
        customers,
        orders,
        tokens,
        tokenCounter: tokenCount,
        weighbridgeRecords,
        gateRecords,
        otpRecords,
        invoices,
        auditLogs: auditLogs.slice(0, 60),
        pinMap,
    };
}
