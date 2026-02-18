export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  DISPATCH_AUTHORITY: 'DISPATCH_AUTHORITY',
  COMMAND_CONTROL_ROOM: 'COMMAND_CONTROL_ROOM',
  TRANSPORT_MANAGER: 'TRANSPORT_MANAGER',
  WEIGHBRIDGE_OPERATOR: 'WEIGHBRIDGE_OPERATOR',
  GATE_SECURITY: 'GATE_SECURITY',
  FINANCE_ACCOUNTS: 'FINANCE_ACCOUNTS',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
};

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.DISPATCH_AUTHORITY]: 'Dispatch Authority',
  [ROLES.COMMAND_CONTROL_ROOM]: 'Command Control Room',
  [ROLES.TRANSPORT_MANAGER]: 'Transport Manager',
  [ROLES.WEIGHBRIDGE_OPERATOR]: 'Weighbridge Operator',
  [ROLES.GATE_SECURITY]: 'Gate Security',
  [ROLES.FINANCE_ACCOUNTS]: 'Finance & Accounts',
  [ROLES.SYSTEM_ADMIN]: 'System Admin',
};

export const ROLE_DASHBOARDS = {
  [ROLES.CUSTOMER]: '/customer/dashboard',
  [ROLES.DISPATCH_AUTHORITY]: '/dispatch',
  [ROLES.COMMAND_CONTROL_ROOM]: '/control-room',
  [ROLES.TRANSPORT_MANAGER]: '/transport',
  [ROLES.WEIGHBRIDGE_OPERATOR]: '/weighbridge',
  [ROLES.GATE_SECURITY]: '/gate',
  [ROLES.FINANCE_ACCOUNTS]: '/finance',
  [ROLES.SYSTEM_ADMIN]: '/dashboard',
};

export const PRODUCTS = [
  { id: 'CLK-BULK', name: 'Clinker Bulk', unit: 'MT', price: 195, packaging: 'Bulk' },
  { id: 'OPC-BAGS', name: 'OPC 42.5N Bags', unit: 'bag', price: 15, packaging: 'Bags', bagWeight: '50kg' },
  { id: 'OPC-BULK', name: 'OPC 42.5N Bulk', unit: 'MT', price: 265, packaging: 'Bulk' },
  { id: 'PPC-BAGS', name: 'PPC Bags', unit: 'bag', price: 14, packaging: 'Bags', bagWeight: '50kg', fullName: 'Portland Pozzolana' },
  { id: 'SRC-BULK', name: 'SRC Bulk', unit: 'MT', price: 310, packaging: 'Bulk', fullName: 'Sulphate Resistant' },
  { id: 'WHT-BAGS', name: 'White Cement Bags', unit: 'bag', price: 22, packaging: 'Bags', bagWeight: '25kg' },
];

export const ORDER_STATUSES = [
  'Submitted',
  'Pending',
  'Approved',
  'Rejected',
  'On Hold',
  'Token Issued',
  'Zone Assigned',
  'Loading',
  'Weighing',
  'Voucher Ready',
  'Gate Out',
  'In Transit',
  'Arrived',
  'Delivered',
];

export const TIMELINE_STAGES = [
  { key: 'Submitted', label: 'Order Submitted', icon: 'FileText' },
  { key: 'Approved', label: 'Dispatch Approved', icon: 'ClipboardCheck' },
  { key: 'Token Issued', label: 'Token Issued', icon: 'Ticket' },
  { key: 'Zone Assigned', label: 'Zone/LP/WB Assigned', icon: 'MapPin' },
  { key: 'Loading', label: 'Loading (Tare)', icon: 'Scale' },
  { key: 'Weighing', label: 'Loading Complete', icon: 'Package' },
  { key: 'Voucher Ready', label: 'Voucher Ready', icon: 'FileText' },
  { key: 'Gate Out', label: 'Gate Exit', icon: 'ShieldCheck' },
  { key: 'In Transit', label: 'In Transit', icon: 'Truck' },
  { key: 'Arrived', label: 'Arrived at Site', icon: 'MapPin' },
  { key: 'Delivered', label: 'Delivered & Signed', icon: 'CheckCircle' },
];

export const ZONES = [
  {
    id: 'ZONE-A',
    name: 'Zone A',
    loadingPoints: [
      { id: 'L1', name: 'Loading Point 1' },
      { id: 'L2', name: 'Loading Point 2' },
      { id: 'L3', name: 'Loading Point 3' },
      { id: 'L4', name: 'Loading Point 4' },
    ],
    weighbridge: { id: 'W1', name: 'Weighbridge 1' },
  },
  {
    id: 'ZONE-B',
    name: 'Zone B',
    loadingPoints: [
      { id: 'L5', name: 'Loading Point 5' },
      { id: 'L6', name: 'Loading Point 6' },
    ],
    weighbridge: { id: 'W2', name: 'Weighbridge 2' },
  },
];

export const TRANSPORT_OPTIONS = [
  { value: 'company', label: 'Company Transport' },
  { value: 'own', label: 'Customer Own Transport' },
];

export const INVOICE_STATUSES = ['Draft', 'Issued', 'Delivered Verified', 'Paid', 'Overdue'];

export const AUDIT_ACTIONS = [
  'ORDER_CREATED',
  'ORDER_SUBMITTED',
  'ORDER_APPROVED',
  'ORDER_REJECTED',
  'ORDER_ON_HOLD',
  'TOKEN_CREATED',
  'ZONE_ALLOCATED',
  'LOADING_STARTED',
  'LOADING_COMPLETED',
  'TARE_CAPTURED',
  'GROSS_CAPTURED',
  'WEIGHT_VERIFIED',
  'VOUCHER_GENERATED',
  'PIN_GENERATED',
  'GATE_VERIFIED',
  'GATE_EXIT',
  'TRIP_STARTED',
  'DRIVER_ARRIVED',
  'OTP_SENT',
  'OTP_VERIFIED',
  'DELIVERY_CONFIRMED',
  'DOCUMENT_SIGNED',
  'INVOICE_ISSUED',
  'PAYMENT_RECEIVED',
  'OVERRIDE_APPLIED',
  'CUSTOMER_REGISTERED',
  'ADDRESS_ADDED',
];

// Backoffice nav — shown when role is NOT customer
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: [ROLES.SYSTEM_ADMIN] },
  { href: '/orders', label: 'Orders', icon: 'ShoppingCart', roles: [ROLES.DISPATCH_AUTHORITY, ROLES.SYSTEM_ADMIN] },
  { href: '/dispatch', label: 'Dispatch', icon: 'ClipboardCheck', roles: [ROLES.DISPATCH_AUTHORITY, ROLES.SYSTEM_ADMIN] },
  { href: '/control-room', label: 'Control Room', icon: 'Ticket', roles: [ROLES.COMMAND_CONTROL_ROOM, ROLES.SYSTEM_ADMIN] },
  { href: '/weighbridge', label: 'Weighbridge', icon: 'Scale', roles: [ROLES.WEIGHBRIDGE_OPERATOR, ROLES.COMMAND_CONTROL_ROOM, ROLES.SYSTEM_ADMIN] },
  { href: '/gate', label: 'Gate Security', icon: 'ShieldCheck', roles: [ROLES.GATE_SECURITY, ROLES.SYSTEM_ADMIN] },
  { href: '/driver', label: 'Driver Mode', icon: 'Truck', roles: [ROLES.TRANSPORT_MANAGER, ROLES.SYSTEM_ADMIN] },
  { href: '/delivery', label: 'Delivery', icon: 'MapPin', roles: [ROLES.TRANSPORT_MANAGER, ROLES.SYSTEM_ADMIN] },
  { href: '/finance', label: 'Finance', icon: 'FileText', roles: [ROLES.FINANCE_ACCOUNTS, ROLES.SYSTEM_ADMIN] },
  { href: '/mis', label: 'MIS Reports', icon: 'BarChart3', roles: [ROLES.SYSTEM_ADMIN, ROLES.DISPATCH_AUTHORITY, ROLES.FINANCE_ACCOUNTS] },
  { href: '/audit', label: 'Audit Logs', icon: 'ClipboardList', roles: [ROLES.SYSTEM_ADMIN] },
  { href: '/transport', label: 'Transport', icon: 'Factory', roles: [ROLES.TRANSPORT_MANAGER, ROLES.SYSTEM_ADMIN] },
  { href: '/demo', label: 'Demo Mode', icon: 'Play', roles: [ROLES.SYSTEM_ADMIN] },
  { href: '/settings', label: 'Settings', icon: 'Settings', roles: [ROLES.SYSTEM_ADMIN] },
];

// Customer portal nav — shown only when role IS customer
export const CUSTOMER_NAV_ITEMS = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: 'Home' },
  { href: '/customer/orders', label: 'My Orders', icon: 'Package' },
  { href: '/customer/orders/new', label: 'Place Order', icon: 'PlusCircle' },
  { href: '/customer/documents', label: 'Documents', icon: 'FolderOpen' },
  { href: '/customer/profile', label: 'Profile', icon: 'UserCircle' },
];

// Customer demo accounts
export const CUSTOMER_ACCOUNTS = [
  { id: 'CUST-1001', email: 'habtoor@company.ae', password: 'demo1234', name: 'Al Habtoor Construction' },
  { id: 'CUST-1002', email: 'emirates.bm@company.ae', password: 'demo1234', name: 'Emirates Building Materials' },
  { id: 'CUST-1003', email: 'dubai.cont@company.ae', password: 'demo1234', name: 'Dubai Contracting LLC' },
];
