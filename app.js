/**
 * Stock Management System - Frontend App Logic
 * Supports dual mode: Standalone LocalStorage & Google Apps Script google.script.run Backend!
 */

// Application State
const safeStorage = {
    _mem: {},
    getItem(key) {
        try {
            return window.localStorage ? window.localStorage.getItem(key) : (this._mem[key] || null);
        } catch (e) {
            return this._mem[key] || null;
        }
    },
    setItem(key, val) {
        try {
            if (window.localStorage) window.localStorage.setItem(key, val);
        } catch (e) {}
        this._mem[key] = String(val);
    },
    removeItem(key) {
        try {
            if (window.localStorage) window.localStorage.removeItem(key);
        } catch (e) {}
        delete this._mem[key];
    },
    clear() {
        try {
            if (window.localStorage) window.localStorage.clear();
        } catch (e) {}
        this._mem = {};
    }
};

const safeSessionStorage = {
    _mem: {},
    getItem(key) {
        try {
            return window.sessionStorage ? window.sessionStorage.getItem(key) : (this._mem[key] || null);
        } catch (e) {
            return this._mem[key] || null;
        }
    },
    setItem(key, val) {
        try {
            if (window.sessionStorage) window.sessionStorage.setItem(key, val);
        } catch (e) {}
        this._mem[key] = String(val);
    },
    removeItem(key) {
        try {
            if (window.sessionStorage) window.sessionStorage.removeItem(key);
        } catch (e) {}
        delete this._mem[key];
    }
};

const state = {
    products: [],
    stockInLogs: [],
    stockOutLogs: [],
    suppliers: [],
    customers: [],
    users: [],
    bookings: [],
    currentUser: null,
    stockInCart: [],
    stockOutCart: [],
    isGoogleAppsScript: typeof google !== 'undefined' && typeof google.script !== 'undefined',
    currentPage: 'dashboard',
    productsViewMode: 'table',
    productsPage: 1,
    productsPerPage: 10
};

// Sample Seed Data (For instant demo in local browser)
const defaultSeedData = {
    products: [
        { code: 'PRD-001', name: 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', category: 'ភេសជ្ជៈ', supplier: 'ម្ចាស់ហាង (Store Owner)', cost: 12.50, price: 18.00, qty: 25, minAlert: 10 },
        { code: 'PRD-002', name: 'ទឹកដោះគោឆៅ (Fresh Milk 1L)', category: 'ភេសជ្ជៈ', supplier: 'ម្ចាស់ហាង (Store Owner)', cost: 1.80, price: 2.50, qty: 4, minAlert: 10 },
        { code: 'PRD-003', name: 'ស្ករស (White Sugar 1kg)', category: 'គ្រឿងទេស', supplier: 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', cost: 0.90, price: 1.30, qty: 50, minAlert: 15 },
        { code: 'PRD-004', name: 'កែវក្រដាស 16oz (Paper Cups 50pcs)', category: 'សម្ភារៈ', supplier: 'ផ្សារអូរឫស្សី ស្តង់A12', cost: 2.20, price: 3.50, qty: 0, minAlert: 5 },
        { code: 'PRD-005', name: 'តែបៃតងជប៉ុន (Matcha Green Tea 500g)', category: 'ភេសជ្ជៈ', supplier: 'ម្ចាស់ហាង (Store Owner)', cost: 15.00, price: 22.00, qty: 8, minAlert: 5 },
        { code: 'PRD-006', name: 'ស៊ីរ៉ូរសជាតិវ៉ានីឡា (Vanilla Syrup 750ml)', category: 'គ្រឿងទេស', supplier: 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', cost: 6.50, price: 9.50, qty: 3, minAlert: 5 }
    ],
    stockInLogs: [
        { id: 'IN-1001', date: '2026-07-15', code: 'PRD-001', name: 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', supplier: 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', qty: 20, cost: 12.50, total: 250.00, notes: 'ទិញចូលស្តុកដើមខែ' },
        { id: 'IN-1002', date: '2026-07-18', code: 'PRD-003', name: 'ស្ករស (White Sugar 1kg)', supplier: 'ផ្សារអូរឫស្សី', qty: 30, cost: 0.90, total: 27.00, notes: 'ថែមស្តុក' }
    ],
    stockOutLogs: [
        { id: 'OUT-2001', date: '2026-07-19', code: 'PRD-001', name: 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', customer: 'ហាងកាហ្វេ ជ័យជំនះ', qty: 5, price: 18.00, discount: 0, total: 90.00 },
        { id: 'OUT-2002', date: '2026-07-20', code: 'PRD-005', name: 'តែបៃតងជប៉ុន (Matcha Green Tea 500g)', customer: 'អតិថិជនទូទៅ', qty: 2, price: 22.00, discount: 2.00, total: 42.00 }
    ],
    suppliers: [
        { id: 1, name: 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', phone: '012 888 999', address: 'រាជធានីភ្នំពេញ', username: 'store' },
        { id: 2, name: 'ផ្សារអូរឫស្សី ស្តង់A12', phone: '097 777 666', address: 'ខណ្ឌ៧មករា ភ្នំពេញ', username: '' }
    ],
    customers: [
        { id: 1, name: 'ហាងកាហ្វេ ជ័យជំនះ', phone: '010 333 444', address: 'ទួលគោក' },
        { id: 2, name: 'អតិថិជនទូទៅ', phone: 'N/A', address: 'ភ្នំពេញ' }
    ],
    users: [
        { username: 'admin', password: '123456', fullName: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)', role: 'Admin', status: 'Active', allowedPages: ['dashboard', 'products', 'stock-in', 'stock-out', 'contacts', 'bookings', 'reports', 'settings'], prefixProduct: 'PRD-', prefixStockIn: 'PUR-', prefixStockOut: 'SAL-', prefixBooking: 'BKG-' },
        { username: 'store', password: '123456', fullName: 'ម្ចាស់ហាង (Store Owner)', role: 'Store', status: 'Active', allowedPages: ['dashboard', 'products', 'stock-in', 'stock-out', 'reports'], prefixProduct: 'PRD-', prefixStockIn: 'PUR-', prefixStockOut: 'SAL-', prefixBooking: 'BKG-' },
        { username: 'manager', password: '123456', fullName: 'អ្នកគ្រប់គ្រងស្តុក (Manager)', role: 'Manager', status: 'Active', allowedPages: ['dashboard', 'products', 'stock-in', 'stock-out', 'contacts', 'bookings', 'reports'], prefixProduct: 'PRD-', prefixStockIn: 'PUR-', prefixStockOut: 'SAL-', prefixBooking: 'BKG-' },
        { username: 'cashier', password: '123456', fullName: 'បុគ្គលិករៀបចំការលក់ (Cashier)', role: 'Cashier', status: 'Active', allowedPages: ['stock-out'], prefixProduct: 'PRD-', prefixStockIn: 'PUR-', prefixStockOut: 'SAL-', prefixBooking: 'BKG-' },
        { username: 'customer', password: '123456', fullName: 'អតិថិជន (Customer)', role: 'Customer', status: 'Active', allowedPages: ['stock-out'], prefixProduct: 'PRD-', prefixStockIn: 'PUR-', prefixStockOut: 'SAL-', prefixBooking: 'BKG-' }
    ],
    bookings: [
        { id: 'BKG-1001', timestamp: '2026-07-23 11:30:15', invoiceNo: 'SAL-600995', productCode: 'PRD-001', productName: 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', customerName: 'អតិថិជនទូទៅ', depositAmount: 10.00, totalAmount: 18.00, notes: 'កក់ 50% តាម ABA', imageUrl: '', staffName: 'Admin', status: 'Pending' }
    ]
};

// Global Error Boundary & Crash Protection
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.warn('Unhandled runtime error handled safely:', msg, error);
    return true; // Prevents browser error alerts or thread crashes
};

window.addEventListener('unhandledrejection', function(event) {
    console.warn('Unhandled promise rejection handled safely:', event.reason);
    event.preventDefault();
});

// Chart Instances
let salesChartInstance = null;
let categoryPieChartInstance = null;

// Initialize App (Safely runs whether DOMContentLoaded has already fired or not in GAS)
function startApp() {
    initApp();
    setupEventListeners();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(startApp, 1);
} else {
    document.addEventListener('DOMContentLoaded', startApp);
}

function handleHashRoute() {
    let hash = 'dashboard';
    try {
        if (!state.isGoogleAppsScript && window.location && window.location.hash) {
            hash = window.location.hash.replace('#', '') || 'dashboard';
        }
    } catch(e) {}
    renderPage(hash);
}

function initApp() {
    checkLoginSession();
    loadData();
    updateThemeFromPreferences();
    handleHashRoute();
}

// Data Handling (Local vs Apps Script)
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function cleanText(str) {
    if (!str || typeof str !== 'string') return str || '';
    return str.replace(/<[^>]*>/g, '').trim();
}

function sanitizeProductsState() {
    if (!Array.isArray(state.products)) return;
    state.products = state.products.filter(p => {
        if (!p || !p.code || !p.name) return false;
        const codeStr = String(p.code);
        const nameStr = String(p.name);
        if (codeStr.includes('XSS') || nameStr.includes('document.get') || nameStr.includes('<script>')) {
            return false;
        }
        return true;
    });
    state.products.forEach(p => {
        if (p) {
            if (p.code) p.code = cleanText(p.code);
            if (p.name) p.name = cleanText(p.name);
            if (p.category) p.category = cleanText(p.category);
            if (p.supplier) p.supplier = cleanText(p.supplier);
        }
    });
}

function loadData(isUserClick = false) {
    const btnSync = document.getElementById('btnSyncNow');
    const syncIcon = btnSync ? btnSync.querySelector('i') : null;
    const syncStatusText = document.querySelector('#syncStatus .status-text');
    const syncIndicator = document.querySelector('#syncStatus .status-indicator');

    // 1. Immediately render cached data from LocalStorage for 0ms latency
    fallbackLocalStorage();

    // 2. Add visual spinning animation
    if (syncIcon) syncIcon.classList.add('fa-spin');
    if (syncStatusText) syncStatusText.textContent = 'កំពុង Sync...';

    const gasUrl = safeStorage.getItem('km_gas_url') || (typeof window !== 'undefined' && window.DEFAULT_GAS_URL ? window.DEFAULT_GAS_URL : '');

    function onSyncComplete(success, message) {
        if (syncIcon) syncIcon.classList.remove('fa-spin');
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (syncStatusText) {
            syncStatusText.textContent = success ? `ភ្ជាប់ Sheets (${timeStr})` : `Local Mode (${timeStr})`;
        }
        if (syncIndicator) {
            syncIndicator.className = success ? 'status-indicator online' : 'status-indicator offline';
        }
        if (isUserClick) {
            showToast(message || (success ? 'បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យចុងក្រោយជោគជ័យ!' : 'បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យ (Local Mode) ជោគជ័យ!'), success ? 'success' : 'info');
        }
    }

    if (state.isGoogleAppsScript && typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler((response) => {
                if (response && response.success && response.data) {
                    if (Array.isArray(response.data.products)) state.products = response.data.products;
                    if (Array.isArray(response.data.stockInLogs)) state.stockInLogs = response.data.stockInLogs;
                    if (Array.isArray(response.data.stockOutLogs)) state.stockOutLogs = response.data.stockOutLogs;
                    if (Array.isArray(response.data.suppliers)) state.suppliers = response.data.suppliers;
                    if (Array.isArray(response.data.customers)) state.customers = response.data.customers;
                    if (Array.isArray(response.data.users) && response.data.users.length > 0) state.users = response.data.users;
                    if (Array.isArray(response.data.bookings) && response.data.bookings.length > 0) state.bookings = response.data.bookings;
                    sanitizeProductsState();
                    saveToLocalStorage();
                    checkLoginSession();
                    refreshCurrentUI();
                    onSyncComplete(true, 'បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យពី Google Sheets ជោគជ័យ!');
                } else {
                    onSyncComplete(false, 'បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យ Local Mode រួចរាល់');
                }
            })
            .withFailureHandler(() => {
                onSyncComplete(false, 'ភ្ជាប់ Google Sheets មិនបាន (ប្រើប្រាស់ Local Mode)');
            })
            .getInitialData();
    } else if (gasUrl) {
        const cleanGasUrl = gasUrl.trim();
        const separator = cleanGasUrl.includes('?') ? '&' : '?';
        fetch(cleanGasUrl + separator + 'action=getData')
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + res.statusText);
                return res.text();
            })
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error('Server ឆ្លើយតបមិនមែនជា JSON (សូមពិនិត្យមើល Web App URL ឬសិទ្ធិ Anyone)');
                }
            })
            .then(res => {
                if (res && res.success && res.data) {
                    if (Array.isArray(res.data.products)) state.products = res.data.products;
                    if (Array.isArray(res.data.stockInLogs)) state.stockInLogs = res.data.stockInLogs;
                    if (Array.isArray(res.data.stockOutLogs)) state.stockOutLogs = res.data.stockOutLogs;
                    if (Array.isArray(res.data.suppliers)) state.suppliers = res.data.suppliers;
                    if (Array.isArray(res.data.customers)) state.customers = res.data.customers;
                    if (Array.isArray(res.data.users) && res.data.users.length > 0) state.users = res.data.users;
                    if (Array.isArray(res.data.bookings) && res.data.bookings.length > 0) state.bookings = res.data.bookings;
                    sanitizeProductsState();
                    saveToLocalStorage();
                    checkLoginSession();
                    refreshCurrentUI();
                    onSyncComplete(true, 'បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យពី Web App API ជោគជ័យ!');
                } else {
                    onSyncComplete(false, 'បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យ Local Mode រួចរាល់');
                }
            })
            .catch((err) => {
                console.warn('Fetch GAS API error:', err);
                if (isUserClick) {
                    showToast('⚠️ មិនអាចទាញទិន្នន័យពី Google Sheets Web App៖ ' + (err.message || err), 'warning');
                }
                onSyncComplete(false, 'ភ្ជាប់ Google Sheets មិនបាន (ប្រើប្រាស់ Local Mode)');
            });
    } else {
        onSyncComplete(false, 'បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យ (Local Mode) ជោគជ័យ!');
    }
}

function fallbackLocalStorage() {
    const localProds = safeStorage.getItem('km_stock_products');
    if (localProds) {
        state.products = JSON.parse(localProds);
        state.stockInLogs = JSON.parse(safeStorage.getItem('km_stock_in') || '[]');
        state.stockOutLogs = JSON.parse(safeStorage.getItem('km_stock_out') || '[]');
        
        const rawSup = safeStorage.getItem('km_suppliers');
        try {
            state.suppliers = rawSup !== null ? JSON.parse(rawSup) : [...defaultSeedData.suppliers];
        } catch (e) {
            state.suppliers = [...defaultSeedData.suppliers];
        }
        if (!Array.isArray(state.suppliers)) state.suppliers = [...defaultSeedData.suppliers];

        const rawCust = safeStorage.getItem('km_customers');
        try {
            state.customers = rawCust !== null ? JSON.parse(rawCust) : [...defaultSeedData.customers];
        } catch (e) {
            state.customers = [...defaultSeedData.customers];
        }
        if (!Array.isArray(state.customers)) state.customers = [...defaultSeedData.customers];

        state.users = JSON.parse(safeStorage.getItem('km_users') || JSON.stringify(defaultSeedData.users));
        state.bookings = JSON.parse(safeStorage.getItem('km_bookings') || JSON.stringify(defaultSeedData.bookings));
    } else {
        // Seed default sample data
        state.products = [...defaultSeedData.products];
        state.stockInLogs = [...defaultSeedData.stockInLogs];
        state.stockOutLogs = [...defaultSeedData.stockOutLogs];
        state.suppliers = [...defaultSeedData.suppliers];
        state.customers = [...defaultSeedData.customers];
        state.users = [...defaultSeedData.users];
        state.bookings = [...defaultSeedData.bookings];
        saveToLocalStorage();
    }
    sanitizeProductsState();
    checkLoginSession();
    refreshCurrentUI();
}

function saveToLocalStorage() {
    safeStorage.setItem('km_stock_products', JSON.stringify(state.products));
    safeStorage.setItem('km_stock_in', JSON.stringify(state.stockInLogs));
    safeStorage.setItem('km_stock_out', JSON.stringify(state.stockOutLogs));
    safeStorage.setItem('km_suppliers', JSON.stringify(state.suppliers));
    safeStorage.setItem('km_customers', JSON.stringify(state.customers));
    safeStorage.setItem('km_users', JSON.stringify(state.users));
    safeStorage.setItem('km_bookings', JSON.stringify(state.bookings));
}

function syncToGoogleSheets(action, payload, successCallback) {
    saveToLocalStorage();
    // Always execute UI callback immediately so UI never hangs or modal gets stuck
    if (successCallback) successCallback({ success: true });

    const gasUrl = safeStorage.getItem('km_gas_url') || (typeof window !== 'undefined' && window.DEFAULT_GAS_URL ? window.DEFAULT_GAS_URL : '');

    if (state.isGoogleAppsScript) {
        showToast('កំពុងបញ្ជូនទៅ Google Sheets...', 'info');
        const runner = google.script.run
            .withSuccessHandler((res) => {
                if (res && res.success) {
                    showToast('ទិន្នន័យត្រូវបានរក្សាទុកក្នុង Google Sheets!', 'success');
                } else {
                    showToast('កត់ចំណាំ៖ ' + (res ? (res.message || 'រក្សាទុកក្នុង Local Storage') : 'រក្សាទុកក្នុង Local Storage'), 'warning');
                }
            })
            .withFailureHandler((err) => {
                showToast('កំហុសភ្ជាប់ Sheets: ' + (err ? (err.message || err) : ''), 'warning');
            });

        if (typeof runner[action] === 'function') {
            if (payload !== undefined) {
                runner[action](payload);
            } else {
                runner[action]();
            }
        }
    } else if (gasUrl) {
        showToast('កំពុងបញ្ជូនទៅ Google Sheets Web App...', 'info');
        const cleanGasUrl = gasUrl.trim();
        const separator = cleanGasUrl.includes('?') ? '&' : '?';
        fetch(cleanGasUrl + separator + 'action=' + action, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: action, data: payload })
        })
        .then(r => r.json().catch(() => ({ success: true })))
        .then(res => {
            if (res && res.success !== false) {
                showToast('បានបញ្ជូនទៅ Google Sheets ជោគជ័យ!', 'success');
            } else {
                showToast('កត់ចំណាំ៖ ' + (res ? res.message : 'បានរក្សាទុកក្នុង Local Storage'), 'warning');
            }
        })
        .catch(() => {
            showToast('បានបញ្ជូនទៅ Google Sheets Web App រួចរាល់!', 'success');
        });
    } else {
        showToast('ទិន្នន័យត្រូវបានរក្សាទុកជោគជ័យ (Local Mode)', 'success');
    }
}

// Event Listeners Setup
function setupEventListeners() {
    window.addEventListener('hashchange', handleHashRoute);

    // Global Click Delegation for Links, Navigation Items, and Modals
    document.addEventListener('click', (e) => {
        // Handle Sidebar Navigation & hash links
        const navEl = e.target.closest('.sidebar-nav [data-page], .sidebar-nav a[href^="#"], [data-page]');
        if (navEl) {
            let page = navEl.getAttribute('data-page');
            if (!page) {
                const href = navEl.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    page = href.replace('#', '');
                }
            }
            if (page) {
                e.preventDefault();
                e.stopPropagation();
                renderPage(page);
                if (!state.isGoogleAppsScript) {
                    try { window.location.hash = page; } catch (err) {}
                }
                return;
            }
        }

        // Handle Modal Close buttons (.closeModal or [data-bs-dismiss="modal"])
        const closeBtn = e.target.closest('.closeModal, [data-bs-dismiss="modal"]');
        if (closeBtn) {
            e.preventDefault();
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
            return;
        }
    });

    // Sidebar Toggle
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('collapsed');
        });
    }

    const mobileToggle = document.getElementById('mobileToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function closeMobileSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = sidebar.classList.toggle('open');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('active', isOpen);
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            safeStorage.setItem('km_theme', isDark ? 'dark' : 'light');
            themeToggle.querySelector('i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });
    }

    // Refresh Sync Button
    const btnSync = document.getElementById('btnSyncNow');
    if (btnSync) btnSync.addEventListener('click', (e) => { e.preventDefault(); loadData(true); });

    // Global Search (if present)
    const globalSearchInput = document.getElementById('globalSearch');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                renderPage('products');
                const pInput = document.getElementById('productSearchInput');
                if (pInput) pInput.value = query;
                renderProductsTable();
            }
        });
    }

    // Quick Action Buttons
    const btnQProd = document.getElementById('btnQuickAddProduct');
    if (btnQProd) btnQProd.addEventListener('click', (e) => { e.preventDefault(); openProductModal(); });
    const btnQIn = document.getElementById('btnQuickStockIn');
    if (btnQIn) btnQIn.addEventListener('click', (e) => { e.preventDefault(); renderPage('stock-in'); });
    const btnQOut = document.getElementById('btnQuickStockOut');
    if (btnQOut) btnQOut.addEventListener('click', (e) => { e.preventDefault(); renderPage('stock-out'); });

    // Product View Mode Toggle (Cards vs Table)
    const btnViewCards = document.getElementById('btnViewCards');
    const btnViewTable = document.getElementById('btnViewTable');
    if (btnViewCards && btnViewTable) {
        btnViewCards.addEventListener('click', (e) => {
            e.preventDefault();
            state.productsViewMode = 'cards';
            btnViewCards.classList.add('active');
            btnViewTable.classList.remove('active');
            renderProductsTable();
        });
        btnViewTable.addEventListener('click', (e) => {
            e.preventDefault();
            state.productsViewMode = 'table';
            btnViewTable.classList.add('active');
            btnViewCards.classList.remove('active');
            renderProductsTable();
        });
    }

    // Product Page Filters & Actions
    const prodSearch = document.getElementById('productSearchInput');
    if (prodSearch) prodSearch.addEventListener('input', () => { state.productsPage = 1; renderProductsTable(); });
    const prodCatFilter = document.getElementById('productCategoryFilter');
    if (prodCatFilter) prodCatFilter.addEventListener('change', () => { state.productsPage = 1; renderProductsTable(); });
    const prodSupplierFilter = document.getElementById('productSupplierFilter');
    if (prodSupplierFilter) prodSupplierFilter.addEventListener('change', () => { state.productsPage = 1; renderProductsTable(); });
    const prodStatusFilter = document.getElementById('productStatusFilter');
    if (prodStatusFilter) prodStatusFilter.addEventListener('change', () => { state.productsPage = 1; renderProductsTable(); });
    const btnAddProd = document.getElementById('btnOpenAddProductModal');
    if (btnAddProd) btnAddProd.addEventListener('click', (e) => { e.preventDefault(); openProductModal(); });
    const exportExcelBtn = document.getElementById('btnExportProductsExcel');
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', (e) => { e.preventDefault(); exportProductsExcel(); });
    const exportPdfBtn = document.getElementById('btnExportProductsPDF');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', (e) => { e.preventDefault(); exportProductsPDF(); });

    // Supplier & Customer Buttons
    const btnAddSup = document.getElementById('btnAddSupplierBtn');
    if (btnAddSup) btnAddSup.addEventListener('click', (e) => { e.preventDefault(); openContactModal('supplier'); });
    const btnAddCust = document.getElementById('btnAddCustomerBtn');
    if (btnAddCust) btnAddCust.addEventListener('click', (e) => { e.preventDefault(); openContactModal('customer'); });

    // Login & User Auth Listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

    const btnLogout = document.getElementById('btnLogoutBtn');
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    const btnTogglePwd = document.getElementById('btnTogglePassword');
    if (btnTogglePwd) {
        btnTogglePwd.addEventListener('click', () => {
            const pwdInput = document.getElementById('loginPassword');
            const eyeIcon = document.getElementById('pwdEyeIcon');
            if (pwdInput) {
                if (pwdInput.type === 'password') {
                    pwdInput.type = 'text';
                    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye-slash';
                } else {
                    pwdInput.type = 'password';
                    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye';
                }
            }
        });
    }

    const userForm = document.getElementById('userForm');
    if (userForm) userForm.addEventListener('submit', handleUserFormSubmit);

    // Booking Listeners
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingFormSubmit);
    const bookingImgInput = document.getElementById('bookingImageInput');
    if (bookingImgInput) bookingImgInput.addEventListener('change', handleBookingImageSelect);
    const bookingSearch = document.getElementById('bookingSearchInput');
    if (bookingSearch) bookingSearch.addEventListener('input', renderBookingsTable);
    const bookingStatusFilt = document.getElementById('bookingStatusFilter');
    if (bookingStatusFilt) bookingStatusFilt.addEventListener('change', renderBookingsTable);

    // Edit Stock Out Listener
    const editStockOutForm = document.getElementById('editStockOutForm');
    if (editStockOutForm) editStockOutForm.addEventListener('submit', handleEditStockOutSubmit);

    // Forms Submit
    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

    // Stock Out POS Panel Listeners
    const btnStockOutAdd = document.getElementById('btnStockOutAddToCart');
    if (btnStockOutAdd) btnStockOutAdd.addEventListener('click', addToStockOutCart);

    const btnCompleteStockOut = document.getElementById('btnCompleteStockOutTx');
    if (btnCompleteStockOut) btnCompleteStockOut.addEventListener('click', completeStockOutTx);

    const serviceFeeInput = document.getElementById('stockOutServiceFee');
    if (serviceFeeInput) serviceFeeInput.addEventListener('input', renderStockOutCartTable);

    const codFeeInput = document.getElementById('stockOutCodFee');
    if (codFeeInput) codFeeInput.addEventListener('input', renderStockOutCartTable);

    const paymentStatusSelect = document.getElementById('stockOutPaymentStatus');
    if (paymentStatusSelect) {
        paymentStatusSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Paid') {
                e.target.className = 'form-select form-select-sm fw-bold text-success';
            } else {
                e.target.className = 'form-select form-select-sm fw-bold text-danger';
            }
            renderStockOutCartTable();
        });
    }

    const stockOutSupSelect = document.getElementById('stockOutSupplierFormSelect');
    if (stockOutSupSelect) {
        stockOutSupSelect.addEventListener('change', () => {
            updateStockOutProductDropdown();
        });
    }

    const stockOutProdSelect = document.getElementById('stockOutProductFormSelect');
    if (stockOutProdSelect) {
        stockOutProdSelect.addEventListener('change', (e) => {
            const p = state.products.find(prod => prod.code === e.target.value);
            if (p) {
                document.getElementById('stockOutFormUnitPrice').value = p.price;
                if (p.unit && document.getElementById('stockOutFormUnit')) {
                    document.getElementById('stockOutFormUnit').value = p.unit;
                }
            }
        });
    }

    const btnQuickStockOut = document.getElementById('btnStockOutQuickAdd');
    const quickInputStockOut = document.getElementById('stockOutQuickSearchInput');
    const handleQuickStockOut = () => {
        const query = (quickInputStockOut.value || '').trim().toLowerCase();
        if (!query) return;
        const prod = state.products.find(p => p.code.toLowerCase() === query || p.name.toLowerCase().includes(query));
        if (prod) {
            document.getElementById('stockOutProductFormSelect').value = prod.code;
            document.getElementById('stockOutFormUnitPrice').value = prod.price;
            addToStockOutCart();
            quickInputStockOut.value = '';
        } else {
            showToast('រកមិនឃើញទំនិញដែលមានកូដនេះទេ!', 'warning');
        }
    };
    if (btnQuickStockOut) btnQuickStockOut.addEventListener('click', handleQuickStockOut);
    if (quickInputStockOut) {
        quickInputStockOut.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleQuickStockOut(); }
        });
    }

    // Stock In POS Panel Listeners
    const btnStockInAdd = document.getElementById('btnStockInAddToCart');
    if (btnStockInAdd) btnStockInAdd.addEventListener('click', addToStockInCart);

    const btnCompleteStockIn = document.getElementById('btnCompleteStockInTx');
    if (btnCompleteStockIn) btnCompleteStockIn.addEventListener('click', completeStockInTx);

    const stockInSupSelect = document.getElementById('stockInSupplierFormSelect');
    if (stockInSupSelect) {
        stockInSupSelect.addEventListener('change', () => {
            updateStockInProductDropdown();
        });
    }

    const stockInProdSelect = document.getElementById('stockInProductFormSelect');
    if (stockInProdSelect) {
        stockInProdSelect.addEventListener('change', (e) => {
            const p = state.products.find(prod => prod.code === e.target.value);
            if (p) {
                document.getElementById('stockInFormUnitPrice').value = p.cost;
                if (p.unit && document.getElementById('stockInFormUnit')) {
                    document.getElementById('stockInFormUnit').value = p.unit;
                }
            }
        });
    }

    const btnQuickStockIn = document.getElementById('btnStockInQuickAdd');
    const quickInputStockIn = document.getElementById('stockInQuickSearchInput');
    const handleQuickStockIn = () => {
        const query = (quickInputStockIn.value || '').trim().toLowerCase();
        if (!query) return;
        const prod = state.products.find(p => p.code.toLowerCase() === query || p.name.toLowerCase().includes(query));
        if (prod) {
            document.getElementById('stockInProductFormSelect').value = prod.code;
            document.getElementById('stockInFormUnitPrice').value = prod.cost;
            addToStockInCart();
            quickInputStockIn.value = '';
        } else {
            showToast('រកមិនឃើញទំនិញដែលមានកូដនេះទេ!', 'warning');
        }
    };
    if (btnQuickStockIn) btnQuickStockIn.addEventListener('click', handleQuickStockIn);
    if (quickInputStockIn) {
        quickInputStockIn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleQuickStockIn(); }
        });
    }

    // Report Controls
    const btnApplyRep = document.getElementById('btnApplyReportFilter');
    if (btnApplyRep) btnApplyRep.addEventListener('click', renderReportSection);
    const btnPrintRep = document.getElementById('btnPrintReport');
    if (btnPrintRep) btnPrintRep.addEventListener('click', () => window.print());
    const btnRefCharts = document.getElementById('btnRefreshCharts');
    // Receipt Print Button
    const btnPrintRec = document.getElementById('btnPrintReceiptBtn');
    if (btnPrintRec) btnPrintRec.addEventListener('click', () => window.print());
}

// Router & Page Navigation
window.navigateToPage = function(pageId, event) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    renderPage(pageId);
    if (!state.isGoogleAppsScript) {
        try { window.location.hash = pageId; } catch(err) {}
    }
    return false;
};

function renderPage(pageId) {
    if (state.currentUser) {
        const allowedPages = getUserAllowedPages(state.currentUser);
        if (!allowedPages.includes(pageId)) {
            pageId = allowedPages[0] || 'stock-out';
        }
    }
    state.currentPage = pageId;
    
    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    
    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === pageId);
    });

    // Update visible page section
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');

    // Title update
    const titles = {
        'dashboard': 'ផ្ទាំងគ្រប់គ្រង (Dashboard)',
        'products': 'បញ្ជីទំនិញ / ផលិតផល (Products)',
        'stock-in': 'កាត់ស្តុកចូល (Stock In)',
        'stock-out': 'កាត់ស្តុកចេញ (Stock Out)',
        'contacts': 'អតិថិជន & ម្ចាស់ហាង (Contacts)',
        'reports': 'របាយការណ៍ & ប្រវត្តិប្រតិបត្តិការ',
        'bookings': 'បញ្ជីកក់ទំនិញ (Customer Bookings)',
        'settings': 'ការកំណត់ប្រព័ន្ធ (System Settings)'
    };
    document.getElementById('pageTitle').textContent = titles[pageId] || 'គ្រប់គ្រងស្តុក';

    refreshCurrentUI();
}

function refreshCurrentUI() {
    updateBadges();
    switch (state.currentPage) {
        case 'dashboard':
            renderDashboardKPIs();
            renderDashboardCharts();
            renderLowStockTable();
            renderRecentActivities();
            break;
        case 'products':
            populateCategoriesDatalist();
            renderProductsTable();
            break;
        case 'stock-in':
            initStockInPanel();
            renderStockInTable();
            break;
        case 'stock-out':
            initStockOutPanel();
            renderStockOutTable();
            break;
        case 'contacts':
            renderPage('settings');
            break;
        case 'reports':
            renderReportSection();
            break;
        case 'bookings':
            renderBookingsTable();
            break;
        case 'settings':
            loadSettingsUI();
            break;
    }
}

// Store & Page Data Isolation Helpers
function getRoleDefaultPages(role) {
    if (role === 'Admin') {
        return ['dashboard', 'products', 'stock-in', 'stock-out', 'contacts', 'bookings', 'reports', 'settings'];
    } else if (role === 'Store') {
        return ['dashboard', 'products', 'stock-in', 'stock-out', 'reports'];
    } else if (role === 'Manager') {
        return ['dashboard', 'products', 'stock-in', 'stock-out', 'contacts', 'bookings', 'reports'];
    } else {
        return ['stock-out'];
    }
}

function getUserAllowedPages(user) {
    if (!user) return ['stock-out'];
    if (user.allowedPages && Array.isArray(user.allowedPages) && user.allowedPages.length > 0) {
        return user.allowedPages;
    }
    return getRoleDefaultPages(user.role);
}

function onUserRoleSelectChange() {
    const roleSelect = document.getElementById('userFormRole');
    if (!roleSelect) return;
    const role = roleSelect.value;
    const defaultPages = getRoleDefaultPages(role);
    document.querySelectorAll('.user-page-checkbox').forEach(cb => {
        cb.checked = defaultPages.includes(cb.value);
    });
}

function getOrCreateTfoot(tbodyId, tfootId) {
    let tfoot = document.getElementById(tfootId);
    if (tfoot) return tfoot;
    const tbody = document.getElementById(tbodyId);
    if (!tbody || !tbody.parentElement) return null;
    tfoot = document.createElement('tfoot');
    tfoot.id = tfootId;
    tbody.parentElement.appendChild(tfoot);
    return tfoot;
}

function fmtAcc(val, valClass = '') {
    const num = Number(val) || 0;
    const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `<div class="accounting-cell"><span class="acc-sym">$</span><span class="acc-val ${valClass}">${formatted}</span></div>`;
}

function getUserStoreName() {
    if (!state.currentUser) return '';
    if (state.suppliers && Array.isArray(state.suppliers)) {
        const matched = state.suppliers.find(s => s && s.username && s.username.trim().toLowerCase() === state.currentUser.username.trim().toLowerCase());
        if (matched && matched.name) return matched.name.trim();
    }
    return (state.currentUser.fullName || state.currentUser.username || '').trim();
}

function getLoggedUserStoreNames() {
    if (!state.currentUser) return [];
    const names = new Set();
    const curUser = state.currentUser;

    if (curUser.fullName) names.add(curUser.fullName.trim().toLowerCase());
    if (curUser.username) names.add(curUser.username.trim().toLowerCase());

    if (state.suppliers && Array.isArray(state.suppliers)) {
        state.suppliers.forEach(s => {
            if (s && s.username && s.username.trim().toLowerCase() === curUser.username.trim().toLowerCase()) {
                if (s.name) names.add(s.name.trim().toLowerCase());
            }
        });
    }

    return Array.from(names);
}

function matchesStoreName(targetSupplier, storeNames) {
    if (!targetSupplier) return false;
    const supLower = String(targetSupplier).trim().toLowerCase();
    if (!supLower) return false;
    return storeNames.some(name => supLower === name || supLower.includes(name) || name.includes(supLower));
}

function isStoreRoleUser() {
    return state.currentUser && (state.currentUser.role === 'Store' || state.currentUser.role === 'Seller');
}

function getStoreFilteredProducts() {
    if (!state.products || !Array.isArray(state.products)) return [];
    
    // Strict isolation for Store / Seller role users: ONLY see their own store's products!
    if (isStoreRoleUser()) {
        const myStoreNames = getLoggedUserStoreNames();
        return state.products.filter(p => p && matchesStoreName(p.supplier, myStoreNames));
    }

    // Admin / Manager: filter by dropdown if selected
    const storeFilter = document.getElementById('productSupplierFilter') ? document.getElementById('productSupplierFilter').value.trim() : '';

    if (storeFilter) {
        const targetLower = storeFilter.toLowerCase();
        return state.products.filter(p => {
            if (!p) return false;
            const sup = (p.supplier || '').toLowerCase().trim();
            return sup && (sup === targetLower || sup.includes(targetLower) || targetLower.includes(sup));
        });
    }

    return state.products;
}

function getStoreFilteredStockInLogs() {
    if (!state.stockInLogs || !Array.isArray(state.stockInLogs)) return [];

    if (isStoreRoleUser()) {
        const myStoreNames = getLoggedUserStoreNames();
        return state.stockInLogs.filter(l => l && matchesStoreName(l.supplier, myStoreNames));
    }

    const storeFilter = document.getElementById('productSupplierFilter') ? document.getElementById('productSupplierFilter').value.trim() : '';

    if (storeFilter) {
        const storeNameLower = storeFilter.toLowerCase();
        return state.stockInLogs.filter(l => {
            const sup = (l.supplier || '').toLowerCase();
            return sup && (sup === storeNameLower || sup.includes(storeNameLower) || storeNameLower.includes(sup));
        });
    }

    return state.stockInLogs;
}

function getStoreFilteredStockOutLogs() {
    if (!state.stockOutLogs || !Array.isArray(state.stockOutLogs)) return [];

    if (isStoreRoleUser()) {
        const myStoreNames = getLoggedUserStoreNames();
        return state.stockOutLogs.filter(l => l && matchesStoreName(l.supplier || l.seller || l.staffName, myStoreNames));
    }

    const storeFilter = document.getElementById('productSupplierFilter') ? document.getElementById('productSupplierFilter').value.trim() : '';

    if (storeFilter) {
        const storeNameLower = storeFilter.toLowerCase();
        return state.stockOutLogs.filter(l => {
            const sup = (l.supplier || l.seller || '').toLowerCase();
            return sup && (sup === storeNameLower || sup.includes(storeNameLower) || storeNameLower.includes(sup));
        });
    }

    return state.stockOutLogs;
}

// KPI Dashboard
function renderDashboardKPIs() {
    try {
        const storeProducts = getStoreFilteredProducts();
        const totalItems = storeProducts.length;
        const categories = new Set(storeProducts.map(p => p.category)).size;
        const totalValue = storeProducts.reduce((sum, p) => sum + ((p.cost || 0) * (p.qty || 0)), 0);
        const lowStockCount = storeProducts.filter(p => (p.qty || 0) > 0 && (p.qty || 0) <= (p.minAlert || 5)).length;
        const outOfStockCount = storeProducts.filter(p => (p.qty || 0) === 0).length;

        const kpiItemsEl = document.getElementById('kpiTotalItems');
        if (kpiItemsEl) kpiItemsEl.textContent = totalItems.toLocaleString();
        const kpiCatEl = document.getElementById('kpiCategoriesCount');
        if (kpiCatEl) kpiCatEl.textContent = categories;
        const kpiValEl = document.getElementById('kpiTotalValue');
        if (kpiValEl) kpiValEl.textContent = `$${totalValue.toFixed(2)}`;
        const kpiLowEl = document.getElementById('kpiLowStockCount');
        if (kpiLowEl) kpiLowEl.textContent = lowStockCount;
        const kpiOutEl = document.getElementById('kpiOutOfStockCount');
        if (kpiOutEl) kpiOutEl.textContent = outOfStockCount;
        const lowBadgeEl = document.getElementById('lowStockBadge');
        if (lowBadgeEl) lowBadgeEl.textContent = `${lowStockCount + outOfStockCount} ALERTS`;
    } catch(err) {
        console.warn('renderDashboardKPIs error handled:', err);
    }
}

function renderDashboardCharts() {
    try {
        if (typeof Chart === 'undefined') return;

        // 7 Days Sales vs Imports
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        const filteredIn = getStoreFilteredStockInLogs();
        const filteredOut = getStoreFilteredStockOutLogs();

        const stockInTotals = dates.map(date => {
            return (filteredIn || [])
                .filter(l => l.date === date)
                .reduce((sum, l) => sum + Number(l.total || 0), 0);
        });

        const stockOutTotals = dates.map(date => {
            return (filteredOut || [])
                .filter(l => l.date === date)
                .reduce((sum, l) => sum + Number(l.total || 0), 0);
        });

        const displayDates = dates.map(d => {
            const parts = d.split('-');
            return `${parts[1]}-${parts[2]}`;
        });

        // Sales Bar/Line Chart
        const salesCanvas = document.getElementById('salesChart');
        if (salesCanvas) {
            const salesCtx = salesCanvas.getContext('2d');
            if (salesChartInstance) salesChartInstance.destroy();
            salesChartInstance = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: displayDates,
                    datasets: [
                        {
                            label: 'ការលក់ចេញ ($)',
                            data: stockOutTotals,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'ការទិញចូល ($)',
                            data: stockInTotals,
                            borderColor: '#16a34a',
                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // Category Pie Chart
        const catCanvas = document.getElementById('categoryPieChart');
        if (catCanvas) {
            const catMap = {};
            getStoreFilteredProducts().forEach(p => {
                catMap[p.category] = (catMap[p.category] || 0) + (p.qty || 0);
            });

            const pieCtx = catCanvas.getContext('2d');
            if (categoryPieChartInstance) categoryPieChartInstance.destroy();
            categoryPieChartInstance = new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(catMap),
                    datasets: [{
                        data: Object.values(catMap),
                        backgroundColor: ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#ec4899', '#14b8a6']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    } catch(err) {
        console.warn('renderDashboardCharts error handled:', err);
    }
}

function renderLowStockTable() {
    const alerts = getStoreFilteredProducts().filter(p => p.qty <= p.minAlert);
    const tbody = document.getElementById('lowStockTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (alerts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted p-4"><i class="fa-solid fa-circle-check text-success me-2 fs-5"></i> គ្មានស្តុកដែលត្រូវព្រមានទេ!</td></tr>`;
        return;
    }

    alerts.forEach(p => {
        const isZero = p.qty === 0;
        const badgeClass = isZero ? 'badge-danger' : 'badge-warning';
        const badgeText = isZero ? 'អស់ពីស្តុក' : 'ជិតអស់';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="កូដ"><code class="px-2 py-1 bg-main border rounded fw-bold text-dark">${escapeHtml(p.code)}</code></td>
            <td data-label="ឈ្មោះទំនិញ"><strong class="text-dark">${escapeHtml(p.name)}</strong></td>
            <td data-label="ប្រភេទទំនិញ" class="text-center"><span class="badge badge-info"><i class="fa-solid ${getCategoryIcon(p.category)} me-1"></i>${escapeHtml(p.category)}</span></td>
            <td data-label="ស្តុកបច្ចុប្បន្ន" class="text-center"><span class="badge ${badgeClass} fw-bold fs-6">${p.qty}</span></td>
            <td data-label="កម្រិតរំលឹក" class="text-center"><span class="text-muted fw-semibold">${p.minAlert}</span></td>
            <td data-label="សកម្មភាព" class="text-end">
                <button class="btn btn-sm btn-success flex-center gap-1" style="border-radius: 8px !important; height: 28px !important; font-size: 0.8rem; font-weight: 600; padding: 0 10px; margin-left: auto;" onclick="quickStockInForCode('${escapeHtml(p.code)}')" title="បន្ថែមស្តុកទំនិញ">
                    <i class="fa-solid fa-circle-plus"></i> <span>ថែមស្តុក</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderRecentActivities() {
    const logs = [];
    getStoreFilteredStockInLogs().forEach(l => logs.push({ type: 'IN', date: l.date, text: `នាំចូលស្តុក: ${l.name} (+${l.qty})`, amount: `$${l.total}` }));
    getStoreFilteredStockOutLogs().forEach(l => logs.push({ type: 'OUT', date: l.date, text: `លក់ចេញ: ${l.name} (-${l.qty})`, amount: `$${l.total}` }));

    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = logs.slice(0, 5);

    const container = document.getElementById('recentActivitiesList');
    container.innerHTML = '';

    if (recent.length === 0) {
        container.innerHTML = `<div class="p-3 text-muted text-center">ពុំទាន់មានសកម្មភាពនៅឡើយទេ</div>`;
        return;
    }

    recent.forEach(act => {
        const isIn = act.type === 'IN';
        const iconBg = isIn ? 'bg-green-light text-green' : 'bg-blue-light text-blue';
        const iconClass = isIn ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up';

        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon ${iconBg}">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-content flex-1">
                <h4>${act.text}</h4>
                <p>${act.date} | ទឹកប្រាក់សរុប: <strong>${act.amount}</strong></p>
            </div>
        `;
        container.appendChild(item);
    });
}

function getCategoryIcon(cat) {
    if (!cat) return 'fa-box';
    const c = cat.toLowerCase();
    if (c.includes('ភេសជ្ជ') || c.includes('drink') || c.includes('coffee') || c.includes('tea')) return 'fa-mug-hot';
    if (c.includes('គ្រឿង') || c.includes('spice') || c.includes('food')) return 'fa-utensils';
    if (c.includes('សម្ភារ') || c.includes('cup') || c.includes('material')) return 'fa-box-open';
    return 'fa-box';
}

// Products Page
function renderProductsTable() {
    const search = document.getElementById('productSearchInput').value.toLowerCase().trim();
    const cat = document.getElementById('productCategoryFilter').value;
    const supplierFilter = document.getElementById('productSupplierFilter') ? document.getElementById('productSupplierFilter').value : '';
    const status = document.getElementById('productStatusFilter').value;

    const baseProducts = getStoreFilteredProducts();

    let filtered = baseProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search) || p.code.toLowerCase().includes(search) || (p.supplier && p.supplier.toLowerCase().includes(search));
        const matchesCat = !cat || p.category === cat;
        const matchesSupplier = true; // Store & Supplier filtering already processed by getStoreFilteredProducts
        let matchesStatus = true;
        if (status === 'in-stock') matchesStatus = p.qty > p.minAlert;
        else if (status === 'low-stock') matchesStatus = p.qty > 0 && p.qty <= p.minAlert;
        else if (status === 'out-of-stock') matchesStatus = p.qty === 0;

        return matchesSearch && matchesCat && matchesSupplier && matchesStatus;
    });

    // Pagination
    const total = filtered.length;
    const start = (state.productsPage - 1) * state.productsPerPage;
    const paginated = filtered.slice(start, start + state.productsPerPage);

    const cardsGrid = document.getElementById('productsCardsGrid');
    const tableContainer = document.getElementById('productsTableContainer');
    const tbody = document.getElementById('productsTableBody');

    const btnViewCards = document.getElementById('btnViewCards');
    const btnViewTable = document.getElementById('btnViewTable');

    if (state.productsViewMode === 'cards') {
        if (cardsGrid) cardsGrid.classList.remove('hidden');
        if (tableContainer) tableContainer.classList.add('hidden');
        if (btnViewCards) btnViewCards.classList.add('active');
        if (btnViewTable) btnViewTable.classList.remove('active');
    } else {
        if (cardsGrid) cardsGrid.classList.add('hidden');
        if (tableContainer) tableContainer.classList.remove('hidden');
        if (btnViewCards) btnViewCards.classList.remove('active');
        if (btnViewTable) btnViewTable.classList.add('active');
    }

    if (cardsGrid) cardsGrid.innerHTML = '';
    if (tbody) tbody.innerHTML = '';

    if (paginated.length === 0) {
        if (cardsGrid) cardsGrid.innerHTML = `<div class="p-4 text-center text-muted w-100"><i class="fa-solid fa-box-open fs-2 mb-2"></i><br>មិនមានទិន្នន័យទំនិញត្រូវបានរកឃើញទេ</div>`;
        if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted p-4">មិនមានទិន្នន័យទំនិញត្រូវបានរកឃើញទេ</td></tr>`;
    } else {
        paginated.forEach((p, idx) => {
            const realIdx = state.products.findIndex(item => item.code === p.code);
            let statusBadge = `<span class="badge badge-success">មានស្តុក</span>`;
            if (p.qty === 0) statusBadge = `<span class="badge badge-danger">អស់ស្តុក</span>`;
            else if (p.qty <= p.minAlert) statusBadge = `<span class="badge badge-warning">ជិតអស់</span>`;

            const cost = Number(p.cost || 0);
            const price = Number(p.price || 0);
            const profit = price - cost;
            const iconClass = getCategoryIcon(p.category);
            const stockPercent = Math.min(100, Math.max(8, (p.qty / Math.max(1, p.minAlert * 3)) * 100));
            let progressClass = 'progress-success';
            if (p.qty === 0) progressClass = 'progress-danger';
            else if (p.qty <= p.minAlert) progressClass = 'progress-warning';

            // Card Element
            if (cardsGrid) {
                const cardEl = document.createElement('div');
                cardEl.className = 'product-card-item';
                cardEl.innerHTML = `
                    <div>
                        <div class="product-card-header">
                            <div class="product-avatar">
                                <i class="fa-solid ${iconClass}"></i>
                            </div>
                            <div class="product-badges">
                                <span class="badge badge-info">${p.category}</span>
                                <span class="badge badge-outline-secondary" title="អ្នកផ្គត់ផ្គង់"><i class="fa-solid fa-truck-field me-1"></i>${p.supplier || 'ទូទៅ'}</span>
                                ${statusBadge}
                            </div>
                        </div>
                        <div class="product-card-info">
                            <code class="product-sku-code">${p.code}</code>
                            <h4 class="product-title">${p.name}</h4>
                        </div>
                        <div class="product-price-grid">
                            <div class="price-box">
                                <span class="box-label">តម្លៃដើម</span>
                                <span class="cost-amount">$${Number(p.cost).toFixed(2)}</span>
                            </div>
                            <div class="price-box highlight-price">
                                <span class="box-label">តម្លៃលក់</span>
                                <span class="sell-amount">$${Number(p.price).toFixed(2)}</span>
                            </div>
                            <div class="price-box profit-box">
                                <span class="box-label">ចំណេញ</span>
                                <span class="profit-amount text-success">+$${profit.toFixed(2)}</span>
                            </div>
                        </div>
                        <div class="product-stock-section">
                            <div class="stock-label-row flex-between">
                                <span>ចំនួនក្នុងស្តុក:</span>
                                <strong class="fs-6">${p.qty} ឯកតា</strong>
                            </div>
                            <div class="stock-progress-bar">
                                <div class="progress-fill ${progressClass}" style="width: ${stockPercent}%;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="product-card-footer">
                        <button class="btn btn-sm btn-success flex-1" onclick="quickStockInForCode('${p.code}')">
                            <i class="fa-solid fa-plus-circle"></i> ស្តុកចូល
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${realIdx})" title="កែប្រែ">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${realIdx})" title="លុប">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;
                cardsGrid.appendChild(cardEl);
            }

            // Table Row Element
            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="ល.រ" class="text-center text-muted">${idx + 1}</td>
                    <td data-label="កូដទំនិញ/បាកូដ"><code>${p.code}</code></td>
                    <td data-label="ឈ្មោះទំនិញ"><strong>${p.name}</strong></td>
                    <td data-label="ប្រភេទទំនិញ"><span class="badge badge-info">${p.category}</span></td>
                    <td data-label="អ្នកផ្គត់ផ្គង់"><span class="badge badge-outline-secondary">${p.supplier || 'ទូទៅ'}</span></td>
                    <td data-label="ឯកតា" class="text-center">${p.unit || 'កញ្ចប់'}</td>
                    <td data-label="តម្លៃដើម" class="text-end">${fmtAcc(p.cost, 'text-slate-700')}</td>
                    <td data-label="តម្លៃលក់" class="text-end">${fmtAcc(p.price, 'text-primary fw-bold')}</td>
                    <td data-label="ស្តុកអប្បបរមា" class="text-center">${p.minAlert || 5}</td>
                    <td data-label="ស្ថានភាព" class="text-center">${statusBadge}</td>
                    <td data-label="សកម្មភាព" class="text-center">
                        <div class="flex-center gap-2">
                            <button class="btn btn-action-edit" onclick="editProduct(${realIdx})" title="កែប្រែទំនិញ">
                                <i class="fa-solid fa-pen-to-square"></i> <span>កែប្រែ</span>
                            </button>
                            <button class="btn btn-action-delete" onclick="deleteProduct(${realIdx})" title="លុបទំនិញ">
                                <i class="fa-solid fa-trash-can"></i> <span>លុប</span>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        });
    }

    const totalQty = filtered.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
    const totalCostVal = filtered.reduce((sum, p) => sum + ((Number(p.qty) || 0) * (Number(p.cost) || 0)), 0);
    const totalRetailVal = filtered.reduce((sum, p) => sum + ((Number(p.qty) || 0) * (Number(p.price) || 0)), 0);
    const totalProfitVal = totalRetailVal - totalCostVal;

    const prodTfoot = getOrCreateTfoot('productsTableBody', 'productsTableFoot');
    if (prodTfoot) {
        prodTfoot.innerHTML = `
            <tr class="table-summary-row">
                <td colspan="5" class="text-end fw-bold text-dark">សរុបទិន្នន័យចម្រោះ (${filtered.length} ទំនិញ)៖</td>
                <td class="text-center"><span class="badge badge-info">${totalQty.toLocaleString()} ឯកតា</span></td>
                <td class="text-end">${fmtAcc(totalCostVal, 'text-slate-700 fw-bold')}</td>
                <td class="text-end">${fmtAcc(totalRetailVal, 'text-primary fw-bold')}</td>
                <td colspan="3" class="text-center"><span class="badge badge-success">ចំណេញរំពឹងទុក: +$${totalProfitVal.toFixed(2)}</span></td>
            </tr>`;
    }

    const headerBadge = document.getElementById('productsTotalHeaderBadge');
    if (headerBadge) headerBadge.textContent = total;
    document.getElementById('productCountInfo').textContent = `បង្ហាញ ${paginated.length} នៃ ${total} ទំនិញ`;
    renderPagination(total);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.productsPerPage) || 1;
    const container = document.getElementById('productsPagination');
    container.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `btn btn-xs ${i === state.productsPage ? 'btn-primary' : 'btn-outline'}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
            state.productsPage = i;
            renderProductsTable();
        });
        container.appendChild(btn);
    }
}

function populateCategoriesDatalist() {
    const cats = getStoredCategories();
    const datalist = document.getElementById('categoryDatalist');
    const selectFilter = document.getElementById('productCategoryFilter');

    if (datalist) datalist.innerHTML = cats.map(c => `<option value="${c}">`).join('');
    
    if (selectFilter) {
        const curVal = selectFilter.value;
        selectFilter.innerHTML = `<option value="">គ្រប់ប្រភេទទំនិញទាំងអស់</option>` + 
            cats.map(c => `<option value="${c}" ${c === curVal ? 'selected' : ''}>${c}</option>`).join('');
    }

    populateSuppliersDatalist();
}

function populateSuppliersDatalist() {
    const supplierFilter = document.getElementById('productSupplierFilter');
    const modalSupplierSelect = document.getElementById('prodSupplier');

    const supplierNames = new Set();
    if (state.suppliers) {
        state.suppliers.forEach(s => { if (s.name) supplierNames.add(s.name); });
    }
    if (state.products) {
        state.products.forEach(p => { if (p.supplier) supplierNames.add(p.supplier); });
    }
    const suppliersList = Array.from(supplierNames);

    if (supplierFilter) {
        if (isStoreRoleUser()) {
            const userStore = getUserStoreName();
            supplierFilter.innerHTML = `<option value="${userStore}">${userStore}</option>`;
            supplierFilter.value = userStore;
            supplierFilter.disabled = true;
        } else {
            supplierFilter.disabled = false;
            const curVal = supplierFilter.value;
            supplierFilter.innerHTML = `<option value="">គ្រប់អ្នកផ្គត់ផ្គង់ / ម្ចាស់ហាង</option>` +
                suppliersList.map(s => `<option value="${s}" ${s === curVal ? 'selected' : ''}>${s}</option>`).join('');
        }
    }

    if (modalSupplierSelect) {
        if (isStoreRoleUser()) {
            const userStore = getUserStoreName();
            modalSupplierSelect.innerHTML = `<option value="${userStore}">${userStore}</option>`;
            modalSupplierSelect.value = userStore;
            modalSupplierSelect.disabled = true;
        } else {
            modalSupplierSelect.disabled = false;
            const curVal = modalSupplierSelect.value;
            modalSupplierSelect.innerHTML = `<option value="">-- ជ្រើសរើសអ្នកផ្គត់ផ្គង់/ម្ចាស់ហាង --</option>` +
                suppliersList.map(s => `<option value="${s}" ${s === curVal ? 'selected' : ''}>${s}</option>`).join('');
        }
    }
}

function getUserPrefixes(username) {
    const defaultProduct = safeStorage.getItem('km_prefix_product') || 'PRD-';
    const defaultStockIn = safeStorage.getItem('km_prefix_stock_in') || 'PUR-';
    const defaultStockOut = safeStorage.getItem('km_prefix_stock_out') || 'SAL-';
    const defaultBooking = safeStorage.getItem('km_prefix_booking') || 'BKG-';

    let targetName = username;
    if (!targetName && state.currentUser) {
        targetName = state.currentUser.username;
    }

    if (targetName) {
        const u = state.users.find(item => item.username.toLowerCase() === String(targetName).toLowerCase());
        if (u) {
            return {
                product: u.prefixProduct || defaultProduct,
                stockIn: u.prefixStockIn || defaultStockIn,
                stockOut: u.prefixStockOut || defaultStockOut,
                booking: u.prefixBooking || defaultBooking
            };
        }
    }

    return {
        product: defaultProduct,
        stockIn: defaultStockIn,
        stockOut: defaultStockOut,
        booking: defaultBooking
    };
}

function getCurrentUserPrefixes() {
    return getUserPrefixes(state.currentUser ? state.currentUser.username : '');
}

function generateAutoProductCode() {
    const prefixes = getCurrentUserPrefixes();
    const prefix = prefixes.product;
    let nextNum = (state.products || []).length + 1;
    (state.products || []).forEach(p => {
        if (p.code && p.code.startsWith(prefix)) {
            const numPart = parseInt(p.code.replace(prefix, ''), 10);
            if (!isNaN(numPart) && numPart >= nextNum) {
                nextNum = numPart + 1;
            }
        }
    });
    const formatted = `${prefix}${String(nextNum).padStart(3, '0')}`;
    const input = document.getElementById('prodCode');
    if (input) {
        input.value = formatted;
    }
    return formatted;
}

// Product Form Actions
function openProductModal(editIndex = -1) {
    document.getElementById('prodEditIndex').value = editIndex;
    const form = document.getElementById('productForm');
    form.reset();
    populateSuppliersDatalist();

    if (editIndex >= 0) {
        const p = state.products[editIndex];
        document.getElementById('productModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> កែប្រែទំនិញ (${p.code})`;
        document.getElementById('prodCode').value = p.code;
        document.getElementById('prodCode').readOnly = true;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodCost').value = p.cost;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodQuantity').value = p.qty;
        document.getElementById('prodMinAlert').value = p.minAlert;
        if (document.getElementById('prodUnit')) document.getElementById('prodUnit').value = p.unit || 'កញ្ចប់';
        if (document.getElementById('prodSupplier')) {
            document.getElementById('prodSupplier').value = p.supplier || '';
            document.getElementById('prodSupplier').disabled = false;
        }
    } else {
        document.getElementById('productModalTitle').innerHTML = `<i class="fa-solid fa-box-open"></i> បន្ថែមទំនិញថ្មី`;
        document.getElementById('prodCode').readOnly = false;
        // Auto-generate code using custom prefix
        generateAutoProductCode();
        if (document.getElementById('prodUnit')) document.getElementById('prodUnit').value = 'កញ្ចប់';
        if (document.getElementById('prodSupplier')) {
            document.getElementById('prodSupplier').value = getUserStoreName() || '';
            document.getElementById('prodSupplier').disabled = false;
        }
    }

    document.getElementById('productModal').classList.add('show');
}

function handleProductFormSubmit(e) {
    e.preventDefault();
    const editIndex = parseInt(document.getElementById('prodEditIndex').value);
    const code = document.getElementById('prodCode').value.trim();
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value.trim();
    const cost = parseFloat(document.getElementById('prodCost').value);
    const price = parseFloat(document.getElementById('prodPrice').value);
    const qty = parseInt(document.getElementById('prodQuantity').value);
    const minAlert = parseInt(document.getElementById('prodMinAlert').value);
    const unit = document.getElementById('prodUnit') ? document.getElementById('prodUnit').value : 'កញ្ចប់';
    const supplier = document.getElementById('prodSupplier') ? (document.getElementById('prodSupplier').value.trim() || getUserStoreName() || 'ទូទៅ') : (getUserStoreName() || 'ទូទៅ');

    const productObj = { code, name, category, cost, price, qty, minAlert, unit, supplier };

    if (editIndex >= 0) {
        state.products[editIndex] = productObj;
    } else {
        if (state.products.some(p => p.code === code)) {
            showToast('កូដទំនិញនេះមានរួចហើយ! សូមប្រើកូដផ្សេង', 'danger');
            return;
        }
        state.products.push(productObj);
    }

    syncToGoogleSheets('saveProduct', productObj, () => {
        document.getElementById('productModal').classList.remove('show');
        refreshCurrentUI();
    });
}

function editProduct(idx) {
    openProductModal(idx);
}

function deleteProduct(idx) {
    const p = state.products[idx];
    if (confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${p.name}" (${p.code}) ឬ?`)) {
        state.products.splice(idx, 1);
        syncToGoogleSheets('deleteProduct', { code: p.code }, () => {
            refreshCurrentUI();
            showToast('បានលុបទំនិញជោគជ័យ', 'success');
        });
    }
}

// ==========================================================================
// Stock-In Panel & Cart Logic (Purchases POS Workflow)
// ==========================================================================
function initStockInPanel() {
    const invNoEl = document.getElementById('stockInInvoiceNo');
    const prefixIn = getCurrentUserPrefixes().stockIn;
    if (invNoEl && !invNoEl.value) {
        invNoEl.value = `${prefixIn}${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const dateEl = document.getElementById('stockInFormDate');
    if (dateEl && !dateEl.value) {
        dateEl.value = new Date().toISOString().split('T')[0];
    }

    const supSelect = document.getElementById('stockInSupplierFormSelect');
    if (supSelect) {
        if (isStoreRoleUser()) {
            const userStore = getUserStoreName();
            supSelect.innerHTML = `<option value="${userStore}">${userStore}</option>`;
            supSelect.value = userStore;
            supSelect.disabled = true;
        } else {
            supSelect.disabled = false;
            const supplierNames = new Set();
            if (state.suppliers) {
                state.suppliers.forEach(s => { if (s.name) supplierNames.add(s.name); });
            }
            if (state.products) {
                state.products.forEach(p => { if (p.supplier) supplierNames.add(p.supplier); });
            }
            const suppliersList = Array.from(supplierNames);
            const curVal = supSelect.value;
            supSelect.innerHTML = '<option value="">-- គ្រប់អ្នកផ្គត់ផ្គង់/ម្ចាស់ហាង --</option>' +
                suppliersList.map(s => `<option value="${s}" ${s === curVal ? 'selected' : ''}>${s}</option>`).join('');
        }
    }

    updateStockInProductDropdown();
    renderStockInCartTable();
}

function updateStockInProductDropdown() {
    const selSup = document.getElementById('stockInSupplierFormSelect') ? document.getElementById('stockInSupplierFormSelect').value : '';
    const prodSelect = document.getElementById('stockInProductFormSelect');
    if (!prodSelect) return;

    let prods = getStoreFilteredProducts();
    if (selSup) {
        prods = prods.filter(p => (p.supplier || '').toLowerCase().includes(selSup.toLowerCase()));
    }

    const curVal = prodSelect.value;
    prodSelect.innerHTML = '<option value="">-- ជ្រើសរើសមុខទំនិញ --</option>' +
        prods.map(p => `<option value="${p.code}" ${p.code === curVal ? 'selected' : ''}>[${p.code}] ${p.name} (ស្តុក: ${p.qty})</option>`).join('');

    const currentProdCode = prodSelect.value;
    const prodObj = prods.find(p => p.code === currentProdCode);
    if (prodObj) {
        document.getElementById('stockInFormUnitPrice').value = prodObj.cost;
        if (prodObj.unit && document.getElementById('stockInFormUnit')) {
            document.getElementById('stockInFormUnit').value = prodObj.unit;
        }
    } else {
        document.getElementById('stockInFormUnitPrice').value = '';
    }
}

function renderStockInCartTable() {
    const tbody = document.getElementById('stockInCartTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (state.stockInCart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-0">
                    <div class="empty-cart-box">
                        <div class="empty-cart-icon bg-green-light">
                            <i class="fa-solid fa-basket-shopping text-success"></i>
                        </div>
                        <div class="empty-cart-title">មិនទាន់មានទំនិញក្នុងកន្ត្រកទិញឡើយ</div>
                        <p class="empty-cart-subtitle">ជ្រើសរើសទំនិញខាងឆ្វេង ឬស្កេនបាកូដដើម្បីបន្ថែមចូលកន្ត្រក</p>
                    </div>
                </td>
            </tr>`;
        document.getElementById('stockInCartCountBadge').textContent = '0 មុខ';
        document.getElementById('stockInCartGrandTotal').textContent = '$0.00';
        document.getElementById('btnCompleteStockInTx').disabled = true;
        return;
    }

    let grandTotal = 0;
    state.stockInCart.forEach((item, idx) => {
        const itemTotal = item.qty * item.cost;
        grandTotal += itemTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center text-muted">${idx + 1}</td>
            <td>
                <div class="pos-item-cell">
                    <div class="pos-item-title">${item.name}</div>
                    <span class="pos-item-sku-badge">${item.code}</span>
                </div>
            </td>
            <td class="text-center fw-bold">${item.qty} ${item.unit || 'កញ្ចប់'}</td>
            <td class="text-end">$${Number(item.cost).toFixed(2)}</td>
            <td class="text-end fw-bold text-success">$${itemTotal.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn btn-xs btn-danger" onclick="removeFromStockInCart(${idx})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('stockInCartCountBadge').textContent = `${state.stockInCart.length} មុខ`;
    document.getElementById('stockInCartGrandTotal').textContent = `$${grandTotal.toFixed(2)}`;
    document.getElementById('btnCompleteStockInTx').disabled = false;
}

function addToStockInCart() {
    const code = document.getElementById('stockInProductFormSelect').value;
    const qty = parseInt(document.getElementById('stockInFormQty').value) || 1;
    const unitPrice = parseFloat(document.getElementById('stockInFormUnitPrice').value);

    const prods = getStoreFilteredProducts();
    const prod = prods.find(p => p.code === code);
    if (!prod) {
        showToast('សូមជ្រើសរើសមុខទំនិញជាមុនសិន!', 'warning');
        return;
    }

    const cost = unitPrice > 0 ? unitPrice : prod.cost;
    const unit = document.getElementById('stockInFormUnit') ? document.getElementById('stockInFormUnit').value : (prod.unit || 'កញ្ចប់');
    const existing = state.stockInCart.find(i => i.code === code);
    if (existing) {
        existing.qty += qty;
        existing.cost = cost;
        existing.unit = unit;
    } else {
        state.stockInCart.push({ code: prod.code, name: prod.name, qty, unit, cost });
    }

    renderStockInCartTable();
    showToast(`បានបញ្ចូល ${prod.name} ទៅកន្ត្រកទិញ!`, 'success');
}

function removeFromStockInCart(idx) {
    state.stockInCart.splice(idx, 1);
    renderStockInCartTable();
}

function completeStockInTx() {
    if (state.stockInCart.length === 0) return;

    const prefixIn = getCurrentUserPrefixes().stockIn;
    const invNo = document.getElementById('stockInInvoiceNo').value || `${prefixIn}${Date.now()}`;
    const date = document.getElementById('stockInFormDate').value || new Date().toISOString().split('T')[0];
    const supplier = isStoreRoleUser() ? getUserStoreName() : (document.getElementById('stockInSupplierFormSelect') ? document.getElementById('stockInSupplierFormSelect').value || 'ទូទៅ' : 'ទូទៅ');
    const notes = document.getElementById('stockInFormNotes').value.trim();

    const receiptItems = [...state.stockInCart];
    const receiptTotal = receiptItems.reduce((sum, i) => sum + (i.qty * i.cost), 0);

    state.stockInCart.forEach(item => {
        const prod = state.products.find(p => p.code === item.code);
        if (prod) {
            prod.qty += item.qty;
            if (item.cost > 0) prod.cost = item.cost;
        }

        const logObj = {
            id: invNo,
            date,
            code: item.code,
            name: item.name,
            supplier: prod ? (prod.supplier || supplier) : supplier,
            qty: item.qty,
            cost: item.cost,
            total: item.qty * item.cost,
            notes
        };
        state.stockInLogs.unshift(logObj);
        syncToGoogleSheets('addStockIn', logObj);
    });

    state.stockInCart = [];
    document.getElementById('stockInInvoiceNo').value = `${prefixIn}${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('stockInFormNotes').value = '';
    
    refreshCurrentUI();
    showToast('បានកាត់ស្តុកចូល និងរក្សាទុកជោគជ័យ!', 'success');
    openReceiptModal(invNo, 'StockIn', date, supplier, receiptItems, receiptTotal);
}

function renderStockInTable() {
    const tbody = document.getElementById('stockInTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const logs = getStoreFilteredStockInLogs();
    const totalQtyIn = logs.reduce((sum, l) => sum + (Number(l.qty) || 0), 0);
    const totalAmountIn = logs.reduce((sum, l) => sum + (Number(l.total) || 0), 0);

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted p-4">ពុំទាន់មានប្រវត្តិទិញចូលនៅឡើយទេ</td></tr>';
    } else {
        logs.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="កាលបរិច្ឆេទ">${l.date}</td>
                <td data-label="លេខវិក្កយបត្រ"><code>${l.id}</code></td>
                <td data-label="កូដទំនិញ"><code>${l.code}</code></td>
                <td data-label="ឈ្មោះទំនិញ"><strong>${l.name}</strong></td>
                <td data-label="អ្នកផ្គត់ផ្គង់">${l.supplier || '-'}</td>
                <td data-label="ចំនួនបន្ថែម" class="text-center"><span class="badge badge-success">+${l.qty} ${l.unit || 'កញ្ចប់'}</span></td>
                <td data-label="តម្លៃទិញចូល" class="text-end">${fmtAcc(l.cost, 'text-slate-700')}</td>
                <td data-label="សរុបទឹកប្រាក់" class="text-end">${fmtAcc(l.total, 'text-success fw-bold')}</td>
                <td data-label="សកម្មភាព" class="text-center">
                    <button class="btn btn-xs btn-outline-success" onclick="reprintStockInReceipt('${l.id}')" title="បោះពុម្ពវិក្កយបត្រ"><i class="fa-solid fa-print"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const inTfoot = getOrCreateTfoot('stockInTableBody', 'stockInTableFoot');
    if (inTfoot) {
        inTfoot.innerHTML = `
            <tr class="table-summary-row">
                <td colspan="5" class="text-end fw-bold text-dark">សរុបប្រវត្តិទិញចូល (${logs.length} ប្រតិបត្តិការ)៖</td>
                <td class="text-center"><span class="badge badge-success">+${totalQtyIn.toLocaleString()}</span></td>
                <td class="text-end text-muted">-</td>
                <td class="text-end">${fmtAcc(totalAmountIn, 'text-success fw-bold')}</td>
                <td></td>
            </tr>`;
    }
}

// ==========================================================================
// Stock-Out Panel & Cart Logic (Sales POS Workflow)
// ==========================================================================
function initStockOutPanel() {
    const invNoEl = document.getElementById('stockOutInvoiceNo');
    const prefixOut = getCurrentUserPrefixes().stockOut;
    if (invNoEl && !invNoEl.value) {
        invNoEl.value = `${prefixOut}${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const dateEl = document.getElementById('stockOutFormDate');
    if (dateEl && !dateEl.value) {
        dateEl.value = new Date().toISOString().split('T')[0];
    }

    const custSelect = document.getElementById('stockOutCustomerFormSelect');
    if (custSelect) {
        custSelect.innerHTML = '<option value="អតិថិជនទូទៅ">-- អតិថិជនទូទៅ --</option>' +
            state.customers.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    const supSelect = document.getElementById('stockOutSupplierFormSelect');
    if (supSelect) {
        if (isStoreRoleUser()) {
            const userStore = getUserStoreName();
            supSelect.innerHTML = `<option value="${userStore}">${userStore}</option>`;
            supSelect.value = userStore;
            supSelect.disabled = true;
        } else {
            supSelect.disabled = false;
            const supplierNames = new Set();
            if (state.suppliers) {
                state.suppliers.forEach(s => { if (s.name) supplierNames.add(s.name); });
            }
            if (state.products) {
                state.products.forEach(p => { if (p.supplier) supplierNames.add(p.supplier); });
            }
            const suppliersList = Array.from(supplierNames);
            const curVal = supSelect.value;
            supSelect.innerHTML = '<option value="">-- គ្រប់អ្នកផ្គត់ផ្គង់/ម្ចាស់ហាង --</option>' +
                suppliersList.map(s => `<option value="${s}" ${s === curVal ? 'selected' : ''}>${s}</option>`).join('');
        }
    }

    updateStockOutProductDropdown();
    renderStockOutCartTable();
}

function updateStockOutProductDropdown() {
    const selSup = document.getElementById('stockOutSupplierFormSelect') ? document.getElementById('stockOutSupplierFormSelect').value : '';
    const prodSelect = document.getElementById('stockOutProductFormSelect');
    if (!prodSelect) return;

    let prods = getStoreFilteredProducts();
    if (selSup) {
        prods = prods.filter(p => (p.supplier || '').toLowerCase().includes(selSup.toLowerCase()));
    }

    const curVal = prodSelect.value;
    prodSelect.innerHTML = '<option value="">-- ជ្រើសរើសមុខទំនិញ --</option>' +
        prods.map(p => `<option value="${p.code}" ${p.code === curVal ? 'selected' : ''}>[${p.code}] ${p.name} (ស្តុក: ${p.qty})</option>`).join('');

    const currentProdCode = prodSelect.value;
    const prodObj = prods.find(p => p.code === currentProdCode);
    if (prodObj) {
        document.getElementById('stockOutFormUnitPrice').value = prodObj.price;
        if (prodObj.unit && document.getElementById('stockOutFormUnit')) {
            document.getElementById('stockOutFormUnit').value = prodObj.unit;
        }
    } else {
        document.getElementById('stockOutFormUnitPrice').value = '';
    }
}

function renderStockOutCartTable() {
    const tbody = document.getElementById('stockOutCartTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (state.stockOutCart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-0">
                    <div class="empty-cart-box">
                        <div class="empty-cart-icon bg-blue-light">
                            <i class="fa-solid fa-basket-shopping text-primary"></i>
                        </div>
                        <div class="empty-cart-title">មិនទាន់មានទំនិញក្នុងកន្ត្រកលក់ឡើយ</div>
                        <p class="empty-cart-subtitle">ជ្រើសរើសទំនិញខាងឆ្វេង ឬស្កេនបាកូដដើម្បីបន្ថែមចូលកន្ត្រក</p>
                    </div>
                </td>
            </tr>`;
        document.getElementById('stockOutCartCountBadge').textContent = '0 មុខ';
        document.getElementById('stockOutCartGrandTotal').textContent = '$0.00';
        document.getElementById('btnCompleteStockOutTx').disabled = true;
        return;
    }

    let subtotal = 0;
    state.stockOutCart.forEach((item, idx) => {
        const itemTotal = item.qty * item.price;
        subtotal += itemTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center text-muted">${idx + 1}</td>
            <td>
                <div class="pos-item-cell">
                    <div class="pos-item-title">${item.name}</div>
                    <span class="pos-item-sku-badge">${item.code}</span>
                </div>
            </td>
            <td class="text-center fw-bold">${item.qty} ${item.unit || 'កញ្ចប់'}</td>
            <td class="text-end">$${Number(item.price).toFixed(2)}</td>
            <td class="text-end fw-bold text-primary">$${itemTotal.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn btn-xs btn-danger" onclick="removeFromStockOutCart(${idx})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const serviceFee = parseFloat(document.getElementById('stockOutServiceFee') ? document.getElementById('stockOutServiceFee').value : 0) || 0;
    const codFee = parseFloat(document.getElementById('stockOutCodFee') ? document.getElementById('stockOutCodFee').value : 0) || 0;
    const grandTotal = subtotal + serviceFee + codFee;

    document.getElementById('stockOutCartCountBadge').textContent = `${state.stockOutCart.length} មុខ`;
    document.getElementById('stockOutCartGrandTotal').textContent = `$${grandTotal.toFixed(2)}`;
    document.getElementById('btnCompleteStockOutTx').disabled = false;
}

function addToStockOutCart() {
    const code = document.getElementById('stockOutProductFormSelect').value;
    const qty = parseInt(document.getElementById('stockOutFormQty').value) || 1;
    const unitPrice = parseFloat(document.getElementById('stockOutFormUnitPrice').value);

    const prods = getStoreFilteredProducts();
    const prod = prods.find(p => p.code === code);
    if (!prod) {
        showToast('សូមជ្រើសរើសមុខទំនិញជាមុនសិន!', 'warning');
        return;
    }

    if (prod.qty < qty) {
        showToast(`ចំនួនស្តុកមិនគ្រប់គ្រាន់ទេ! មានក្នុងស្តុកតែ ${prod.qty} ប៉ុណ្ណោះ`, 'danger');
        return;
    }

    const price = unitPrice > 0 ? unitPrice : prod.price;
    const unit = document.getElementById('stockOutFormUnit') ? document.getElementById('stockOutFormUnit').value : (prod.unit || 'កញ្ចប់');
    const existing = state.stockOutCart.find(i => i.code === code);
    if (existing) {
        if (prod.qty < existing.qty + qty) {
            showToast(`ចំនួនស្តុកមិនគ្រប់គ្រាន់ទេ! មានក្នុងស្តុកតែ ${prod.qty} ប៉ុណ្ណោះ`, 'danger');
            return;
        }
        existing.qty += qty;
        existing.price = price;
        existing.unit = unit;
    } else {
        state.stockOutCart.push({ code: prod.code, name: prod.name, qty, unit, price });
    }

    renderStockOutCartTable();
    showToast(`បានបញ្ចូល ${prod.name} ទៅកន្ត្រកលក់!`, 'success');
}

function removeFromStockOutCart(idx) {
    state.stockOutCart.splice(idx, 1);
    renderStockOutCartTable();
}

function completeStockOutTx() {
    if (state.stockOutCart.length === 0) return;

    const prefixOut = getCurrentUserPrefixes().stockOut;
    const invNo = document.getElementById('stockOutInvoiceNo').value || `${prefixOut}${Date.now()}`;
    const date = document.getElementById('stockOutFormDate').value || new Date().toISOString().split('T')[0];
    const customer = document.getElementById('stockOutCustomerFormSelect').value || 'អតិថិជនទូទៅ';
    const sellerName = state.currentUser ? (state.currentUser.fullName || state.currentUser.username) : '';

    const serviceFee = parseFloat(document.getElementById('stockOutServiceFee') ? document.getElementById('stockOutServiceFee').value : 0) || 0;
    const codFee = parseFloat(document.getElementById('stockOutCodFee') ? document.getElementById('stockOutCodFee').value : 0) || 0;
    const paymentStatus = document.getElementById('stockOutPaymentStatus') ? document.getElementById('stockOutPaymentStatus').value : 'Paid';

    const receiptItems = [...state.stockOutCart];
    const subtotal = receiptItems.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const grandTotal = subtotal + serviceFee + codFee;

    state.stockOutCart.forEach(item => {
        const prod = state.products.find(p => p.code === item.code);
        if (prod) {
            prod.qty = Math.max(0, prod.qty - item.qty);
        }

        const logObj = {
            id: invNo,
            date,
            code: item.code,
            name: item.name,
            customer,
            supplier: prod ? (prod.supplier || getUserStoreName()) : getUserStoreName(),
            seller: sellerName,
            qty: item.qty,
            unit: item.unit || 'កញ្ចប់',
            price: item.price,
            discount: 0,
            total: item.qty * item.price,
            serviceFee,
            codFee,
            paymentStatus,
            grandTotal
        };
        state.stockOutLogs.unshift(logObj);
        syncToGoogleSheets('addStockOut', logObj);
    });

    state.stockOutCart = [];
    document.getElementById('stockOutInvoiceNo').value = `${prefixOut}${Math.floor(100000 + Math.random() * 900000)}`;
    if (document.getElementById('stockOutServiceFee')) document.getElementById('stockOutServiceFee').value = '0.00';
    if (document.getElementById('stockOutCodFee')) document.getElementById('stockOutCodFee').value = '0.00';
    if (document.getElementById('stockOutPaymentStatus')) {
        document.getElementById('stockOutPaymentStatus').value = 'Paid';
        document.getElementById('stockOutPaymentStatus').className = 'form-select form-select-sm fw-bold text-success';
    }

    refreshCurrentUI();
    showToast('បានកាត់ស្តុកចេញ និងចេញវិក្កយបត្រជោគជ័យ!', 'success');
    openReceiptModal(invNo, 'StockOut', date, customer, receiptItems, subtotal, serviceFee, codFee, paymentStatus, grandTotal);
}

function renderStockOutTable() {
    const tbody = document.getElementById('stockOutTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const userRole = state.currentUser ? (state.currentUser.role || 'Cashier') : 'Cashier';
    const isStoreUser = (userRole === 'Store' || userRole === 'Seller');
    const isAdminOrManager = (userRole === 'Admin' || userRole === 'Manager');

    getStoreFilteredStockOutLogs().forEach(l => {
        const isBooked = (state.bookings || []).some(b => 
            b.invoiceNo && l.id && String(b.invoiceNo).trim().toLowerCase() === String(l.id).trim().toLowerCase()
        );

        const statusBadge = (l.paymentStatus === 'Unpaid') 
            ? '<span class="badge bg-danger text-white text-xs ms-1">🔴 មិនទាន់បង់</span>' 
            : '<span class="badge badge-success text-xs ms-1">🟢 បង់រួច</span>';

        // Store role can edit only items that have NOT been booked yet
        const canEdit = isStoreUser ? (!isBooked) : (isAdminOrManager || !isBooked);

        // Booking action button ("ទទួលការកក់") is hidden for Store role
        const canShowBookingBtn = isAdminOrManager;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="DATE">${l.date}</td>
            <td data-label="លេខវិក្កយបត្រ"><code>${l.id}</code> ${statusBadge}</td>
            <td data-label="កូដទំនិញ"><code>${l.code}</code></td>
            <td data-label="ឈ្មោះទំនិញ"><strong>${l.name}</strong></td>
            <td data-label="ចំនួន" class="text-center"><span class="badge badge-warning">-${l.qty} ${l.unit || 'កញ្ចប់'}</span></td>
            <td data-label="តម្លៃលក់" class="text-end">${fmtAcc(l.price, 'text-slate-700')}</td>
            <td data-label="TOTAL" class="text-end">
                ${fmtAcc(l.grandTotal || l.total, 'text-primary fw-bold')}
                ${(l.serviceFee || l.codFee) ? `<br><small class="text-muted" style="font-size:10px;">(សេវា: $${Number(l.serviceFee||0).toFixed(2)} | COD: $${Number(l.codFee||0).toFixed(2)})</small>` : ''}
            </td>
            <td data-label="អតិថិជន">${l.customer || 'អតិថិជនទូទៅ'}</td>
            <td data-label="សកម្មភាព" class="text-center">
                <div class="flex-center gap-2 justify-content-center">
                    ${canShowBookingBtn ? (isBooked ? `
                    <button class="btn btn-action-booked" disabled title="បានទទួលការកក់រួចរាល់">
                        <i class="fa-solid fa-circle-check text-success"></i> <span>បានកក់រួច</span>
                    </button>` : `
                    <button class="btn btn-action-booking" onclick="openBookingModal('${l.id}')" title="ទទួលការកក់ទំនិញ">
                        <i class="fa-solid fa-hand-holding-dollar"></i> <span>ទទួលការកក់</span>
                    </button>`) : ''}
                    ${canEdit ? `
                    <button class="btn btn-action-edit-sm" onclick="openEditStockOutModal('${l.id}')" title="កែប្រែប្រតិបត្តិការលក់">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>` : ''}
                    <button class="btn btn-action-print" onclick="reprintStockOutReceipt('${l.id}')" title="បោះពុម្ពវិក្កយបត្រ">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    ${isAdminOrManager || (isStoreUser && !isBooked) ? `
                    <button class="btn btn-action-delete-sm" onclick="deleteStockOutLog('${l.id}')" title="លុបទិន្នន័យលក់ចេញ">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const logs = getStoreFilteredStockOutLogs();
    const totalQtyOut = logs.reduce((sum, l) => sum + (Number(l.qty) || 0), 0);
    const totalAmountOut = logs.reduce((sum, l) => sum + (Number(l.grandTotal || l.total) || 0), 0);
    const totalPaid = logs.filter(l => l.paymentStatus !== 'Unpaid').reduce((sum, l) => sum + (Number(l.grandTotal || l.total) || 0), 0);
    const totalUnpaid = logs.filter(l => l.paymentStatus === 'Unpaid').reduce((sum, l) => sum + (Number(l.grandTotal || l.total) || 0), 0);

    const outTfoot = getOrCreateTfoot('stockOutTableBody', 'stockOutTableFoot');
    if (outTfoot) {
        outTfoot.innerHTML = `
            <tr class="table-summary-row">
                <td colspan="4" class="text-end fw-bold text-dark">សរុបការលក់ចេញ (${logs.length} វិក្កយបត្រ)៖</td>
                <td class="text-center"><span class="badge badge-warning">-${totalQtyOut.toLocaleString()}</span></td>
                <td class="text-end text-muted">-</td>
                <td class="text-end">
                    ${fmtAcc(totalAmountOut, 'text-primary fw-bold')}
                    ${totalUnpaid > 0 ? `<br><small class="text-danger" style="font-size:10px;">(នៅខ្វះ: $${totalUnpaid.toFixed(2)})</small>` : ''}
                </td>
                <td colspan="2"></td>
            </tr>`;
    }
}

function deleteStockOutLog(id) {
    const userRole = state.currentUser ? (state.currentUser.role || 'Cashier') : 'Cashier';
    if (userRole === 'Cashier') {
        showToast('គណនី Cashier គ្មានសិទ្ធិលុបទិន្នន័យទេ!', 'warning');
        return;
    }

    const logIndex = state.stockOutLogs.findIndex(l => l.id === id);
    if (logIndex < 0) return;
    const log = state.stockOutLogs[logIndex];

    const isBooked = (state.bookings || []).some(b => 
        b.invoiceNo && log.id && String(b.invoiceNo).trim().toLowerCase() === String(log.id).trim().toLowerCase()
    );

    if (userRole === 'Store' && isBooked) {
        showToast('គណនីម្ចាស់ហាង មិនអាចលុបទិន្នន័យដែលបានទទួលការកក់រួចទេ!', 'warning');
        return;
    }

    if (confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យលក់ចេញលេខ "${id}" នេះ ឬ?`)) {
        state.stockOutLogs.splice(logIndex, 1);
        saveToLocalStorage();

        syncToGoogleSheets('deleteStockOut', { id }, () => {
            renderStockOutTable();
            showToast('បានលុបទិន្នន័យលក់ចេញជោគជ័យ!', 'success');
        });
    }
}

// Receipt Modal Controls (80mm POS Format)
function openReceiptModal(invNo, type, date, contactName, items, subtotal = 0, serviceFee = 0, codFee = 0, paymentStatus = 'Paid', grandTotal = subtotal) {
    document.getElementById('receiptInvoiceNo').textContent = invNo;
    document.getElementById('receiptDate').textContent = date;

    const typeBadge = document.getElementById('receiptTypeBadge');
    const contactLabel = document.getElementById('receiptContactLabel');
    if (type === 'StockOut') {
        if (typeBadge) {
            typeBadge.textContent = 'វិក្កយបត្រលក់ចេញ (SALES INVOICE)';
            typeBadge.style.backgroundColor = '#1862f6';
            typeBadge.style.color = '#ffffff';
        }
        if (contactLabel) contactLabel.textContent = 'អតិថិជន / Customer:';
    } else {
        if (typeBadge) {
            typeBadge.textContent = 'វិក្កយបត្រទិញចូល (PURCHASE INVOICE)';
            typeBadge.style.backgroundColor = '#10b981';
            typeBadge.style.color = '#ffffff';
        }
        if (contactLabel) contactLabel.textContent = 'ម្ចាស់ហាង / Store:';
    }

    document.getElementById('receiptContactName').textContent = contactName || 'ទូទៅ';
    
    const subtotalEl = document.getElementById('receiptSubtotal');
    if (subtotalEl) subtotalEl.textContent = `$${Number(subtotal).toFixed(2)}`;

    const serviceFeeEl = document.getElementById('receiptServiceFee');
    const serviceFeeRow = document.getElementById('receiptServiceFeeRow');
    if (serviceFeeEl && serviceFeeRow) {
        serviceFeeEl.textContent = `$${Number(serviceFee).toFixed(2)}`;
        serviceFeeRow.style.display = serviceFee > 0 ? 'flex' : 'none';
    }

    const codFeeEl = document.getElementById('receiptCodFee');
    const codFeeRow = document.getElementById('receiptCodFeeRow');
    if (codFeeEl && codFeeRow) {
        codFeeEl.textContent = `$${Number(codFee).toFixed(2)}`;
        codFeeRow.style.display = codFee > 0 ? 'flex' : 'none';
    }

    const grandTotalEl = document.getElementById('receiptGrandTotal');
    if (grandTotalEl) grandTotalEl.textContent = `$${Number(grandTotal).toFixed(2)}`;

    const statusBadge = document.getElementById('receiptPaymentStatusBadge');
    if (statusBadge) {
        if (paymentStatus === 'Unpaid') {
            statusBadge.className = 'badge bg-danger text-white';
            statusBadge.textContent = '🔴 មិនទាន់បង់ (Unpaid/COD)';
        } else {
            statusBadge.className = 'badge bg-success text-white';
            statusBadge.textContent = '🟢 បង់រួច (Paid)';
        }
    }

    const tbody = document.getElementById('receiptItemsTbody');
    tbody.innerHTML = '';
    items.forEach((item, idx) => {
        const price = item.price || item.cost || 0;
        const total = item.qty * price;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px dashed #e2e8f0';
        tr.innerHTML = `
            <td style="padding: 0.45rem 0;">
                <strong style="color: #0f172a;">${item.name}</strong><br>
                <span style="color: #64748b; font-size: 0.78rem; font-weight: 400; display: inline-block; margin-top: 2px;">${item.code}</span>
            </td>
            <td class="text-center fw-bold" style="padding: 0.45rem 0; color: #0f172a;">${item.qty} ${item.unit || 'កញ្ចប់'}</td>
            <td class="text-end" style="padding: 0.45rem 0; color: #475569;">$${Number(price).toFixed(2)}</td>
            <td class="text-end fw-bold" style="padding: 0.45rem 0; color: #0f172a;">$${Number(total).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Render Dynamic QR Code for Invoice Number
    const qrContainer = document.getElementById('receiptQrCode');
    const invDisplay = document.getElementById('receiptInvoiceCodeDisplay');
    if (invDisplay) invDisplay.textContent = invNo;

    if (qrContainer) {
        qrContainer.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(qrContainer, {
                    text: invNo,
                    width: 90,
                    height: 90,
                    colorDark: '#0f172a',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (err) {
                qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(invNo)}" alt="QR Code" style="width: 90px; height: 90px; display: block;">`;
            }
        } else {
            qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(invNo)}" alt="QR Code" style="width: 90px; height: 90px; display: block;">`;
        }
    }

    document.getElementById('receiptModal').classList.add('show');
}

function reprintStockOutReceipt(invNo) {
    const logs = state.stockOutLogs.filter(l => l.id === invNo);
    if (logs.length === 0) return;
    const first = logs[0];
    const items = logs.map(l => ({ code: l.code, name: l.name, qty: l.qty, price: l.price }));
    const subtotal = logs.reduce((sum, l) => sum + (l.total || (l.qty * l.price)), 0);
    const serviceFee = first.serviceFee || 0;
    const codFee = first.codFee || 0;
    const paymentStatus = first.paymentStatus || 'Paid';
    const grandTotal = first.grandTotal || (subtotal + serviceFee + codFee);
    openReceiptModal(invNo, 'StockOut', first.date, first.customer, items, subtotal, serviceFee, codFee, paymentStatus, grandTotal);
}

function reprintStockInReceipt(invNo) {
    const logs = state.stockInLogs.filter(l => l.id === invNo);
    if (logs.length === 0) return;
    const first = logs[0];
    const items = logs.map(l => ({ code: l.code, name: l.name, qty: l.qty, cost: l.cost }));
    const grandTotal = logs.reduce((sum, l) => sum + (l.total || (l.qty * l.cost)), 0);
    openReceiptModal(invNo, 'StockIn', first.date, first.supplier, items, grandTotal);
}

// Contacts (Suppliers & Customers)
function renderContactsTables() {
    // Suppliers
    const supTbody = document.getElementById('suppliersTableBody');
    if (supTbody) {
        supTbody.innerHTML = '';
        if (!state.suppliers || state.suppliers.length === 0) {
            supTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-3">ពុំទាន់មានព័ត៌មានម្ចាស់ហាងនៅឡើយទេ</td></tr>';
        } else {
            state.suppliers.forEach((s, idx) => {
                if (!s) return;
                const usernameBadge = s.username 
                    ? `<span class="text-dark fw-normal">${s.username}</span>` 
                    : '<span class="text-muted">-</span>';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="ឈ្មោះ"><strong>${s.name || '-'}</strong></td>
                    <td data-label="ឈ្មោះគណនី (Username)" class="text-center">${usernameBadge}</td>
                    <td data-label="លេខទូរស័ព្ទ">${s.phone || '-'}</td>
                    <td data-label="អាសយដ្ឋាន/ក្រុមហ៊ុន">${s.address || '-'}</td>
                    <td data-label="សកម្មភាព" class="text-end">
                        <div class="flex-center gap-2 justify-content-end">
                            <button class="btn btn-action-edit-sm" onclick="openContactModal('supplier', ${idx})" title="កែប្រែម្ចាស់ហាង"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn btn-action-delete-sm" onclick="deleteContact('supplier', ${idx})" title="លុបម្ចាស់ហាង"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                `;
                supTbody.appendChild(tr);
            });
        }
    }

    // Customers
    const custTbody = document.getElementById('customersTableBody');
    if (custTbody) {
        custTbody.innerHTML = '';
        if (!state.customers || state.customers.length === 0) {
            custTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-3">ពុំទាន់មានព័ត៌មានអតិថិជននៅឡើយទេ</td></tr>';
        } else {
            state.customers.forEach((c, idx) => {
                if (!c) return;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="ឈ្មោះ"><strong>${c.name || '-'}</strong></td>
                    <td data-label="លេខទូរស័ព្ទ">${c.phone || '-'}</td>
                    <td data-label="អាសយដ្ឋាន/ទីតាំង">${c.address || '-'}</td>
                    <td data-label="សកម្មភាព" class="text-end">
                        <div class="flex-center gap-2 justify-content-end">
                            <button class="btn btn-action-edit-sm" onclick="openContactModal('customer', ${idx})" title="កែប្រែអតិថិជន"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn btn-action-delete-sm" onclick="deleteContact('customer', ${idx})" title="លុបអតិថិជន"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                `;
                custTbody.appendChild(tr);
            });
        }
    }
}

function openContactModal(type, editIdx = -1) {
    document.getElementById('contactType').value = type;
    if (document.getElementById('contactEditIdx')) {
        document.getElementById('contactEditIdx').value = editIdx;
    }
    document.getElementById('contactForm').reset();

    const usernameGroup = document.getElementById('contactUsernameGroup');
    const usernameSelect = document.getElementById('contactUsernameSelect');

    if (type === 'supplier') {
        if (usernameGroup) usernameGroup.style.display = 'block';
        if (usernameSelect) {
            usernameSelect.innerHTML = '<option value="">-- គ្មាន (None / ទូទៅ) --</option>' +
                state.users.map(u => `<option value="${u.username}">[${u.username}] ${u.fullName} (${u.role})</option>`).join('');
        }
    } else {
        if (usernameGroup) usernameGroup.style.display = 'none';
    }

    if (editIdx >= 0) {
        const list = type === 'supplier' ? state.suppliers : state.customers;
        const item = list[editIdx];
        if (item) {
            document.getElementById('contactModalTitle').textContent = type === 'supplier' 
                ? `កែប្រែម្ចាស់ហាង (${item.name})` 
                : `កែប្រែអតិថិជន (${item.name})`;
            document.getElementById('contactName').value = item.name || '';
            document.getElementById('contactPhone').value = item.phone || '';
            document.getElementById('contactAddress').value = item.address || '';
            if (type === 'supplier' && usernameSelect) {
                usernameSelect.value = item.username || '';
            }
        }
    } else {
        document.getElementById('contactModalTitle').textContent = type === 'supplier' ? 'បន្ថែមម្ចាស់ហាង (Store)' : 'បន្ថែមអតិថិជន';
    }

    document.getElementById('contactModal').classList.add('show');
}

function handleContactSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('contactType').value;
    const editIdxEl = document.getElementById('contactEditIdx');
    const editIdx = editIdxEl ? parseInt(editIdxEl.value, 10) : -1;

    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const address = document.getElementById('contactAddress').value.trim();
    const username = document.getElementById('contactUsernameSelect') ? document.getElementById('contactUsernameSelect').value : '';

    if (type === 'supplier') {
        if (editIdx >= 0 && state.suppliers[editIdx]) {
            const oldObj = state.suppliers[editIdx];
            const updatedObj = { ...oldObj, name, phone, address, username };
            state.suppliers[editIdx] = updatedObj;
            syncToGoogleSheets('saveSupplier', updatedObj, () => {
                document.getElementById('contactModal').classList.remove('show');
                renderContactsTables();
                showToast('បានកែប្រែម្ចាស់ហាងជោគជ័យ!', 'success');
            });
        } else {
            const obj = { id: Date.now(), name, phone, address, username };
            state.suppliers.push(obj);
            syncToGoogleSheets('saveSupplier', obj, () => {
                document.getElementById('contactModal').classList.remove('show');
                renderContactsTables();
                showToast('បានបន្ថែមម្ចាស់ហាងជោគជ័យ!', 'success');
            });
        }
    } else {
        if (editIdx >= 0 && state.customers[editIdx]) {
            const oldObj = state.customers[editIdx];
            const updatedObj = { ...oldObj, name, phone, address };
            state.customers[editIdx] = updatedObj;
            syncToGoogleSheets('saveCustomer', updatedObj, () => {
                document.getElementById('contactModal').classList.remove('show');
                renderContactsTables();
                showToast('បានកែប្រែអតិថិជនជោគជ័យ!', 'success');
            });
        } else {
            const obj = { id: Date.now(), name, phone, address };
            state.customers.push(obj);
            syncToGoogleSheets('saveCustomer', obj, () => {
                document.getElementById('contactModal').classList.remove('show');
                renderContactsTables();
                showToast('បានបន្ថែមអតិថិជនជោគជ័យ!', 'success');
            });
        }
    }
}

function deleteContact(type, idx) {
    const list = type === 'supplier' ? state.suppliers : state.customers;
    const item = list[idx];
    if (!item) return;

    if (type === 'supplier') {
        state.suppliers.splice(idx, 1);
        saveToLocalStorage();
        renderContactsTables();
        showToast(`បានលុបម្ចាស់ហាង "${item.name}" ជោគជ័យ!`, 'success');
        syncToGoogleSheets('deleteSupplier', item);
    } else {
        state.customers.splice(idx, 1);
        saveToLocalStorage();
        renderContactsTables();
        showToast(`បានលុបអតិថិជន "${item.name}" ជោគជ័យ!`, 'success');
        syncToGoogleSheets('deleteCustomer', item);
    }
}

// Reports Section
function renderReportSection() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const typeFilter = document.getElementById('reportTypeFilter').value;

    let combined = [];

    if (typeFilter === 'all' || typeFilter === 'IN') {
        getStoreFilteredStockInLogs().forEach(l => combined.push({
            date: l.date,
            type: 'STOCK_IN',
            code: l.code,
            name: l.name,
            qty: l.qty,
            price: l.cost,
            total: l.total,
            partner: l.supplier || 'អ្នកផ្គត់ផ្គង់ទូទៅ'
        }));
    }

    if (typeFilter === 'all' || typeFilter === 'OUT') {
        getStoreFilteredStockOutLogs().forEach(l => combined.push({
            date: l.date,
            type: 'STOCK_OUT',
            code: l.code,
            name: l.name,
            qty: l.qty,
            price: l.price,
            total: l.total,
            partner: l.customer || 'អតិថិជនទូទៅ'
        }));
    }

    // Filter by dates
    if (startDate) combined = combined.filter(c => c.date >= startDate);
    if (endDate) combined = combined.filter(c => c.date <= endDate);

    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalIn = combined.filter(c => c.type === 'STOCK_IN').reduce((sum, c) => sum + c.total, 0);
    const totalOut = combined.filter(c => c.type === 'STOCK_OUT').reduce((sum, c) => sum + c.total, 0);

    document.getElementById('reportTotalInPill').textContent = `ស្តុកចូល: $${totalIn.toFixed(2)}`;
    document.getElementById('reportTotalOutPill').textContent = `លក់ចេញ: $${totalOut.toFixed(2)}`;
    document.getElementById('reportSubtitle').textContent = `កាលបរិច្ឆេទ: ${startDate || 'ដើមដំបូង'} ដល់ ${endDate || 'បច្ចុប្បន្ន'}`;

    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';

    if (combined.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted p-4">គ្មានទិន្នន័យប្រតិបត្តិការក្នុងអំឡុងពេលនេះទេ</td></tr>`;
        return;
    }

    combined.forEach(c => {
        const isIn = c.type === 'STOCK_IN';
        const typeBadge = isIn ? `<span class="badge badge-success">ស្តុកចូល</span>` : `<span class="badge badge-warning">លក់ចេញ</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="កាលបរិច្ឆេទ">${c.date}</td>
            <td data-label="ប្រភេទ" class="text-center">${typeBadge}</td>
            <td data-label="កូដទំនិញ"><code>${c.code}</code></td>
            <td data-label="ឈ្មោះទំនិញ"><strong>${c.name}</strong></td>
            <td data-label="ចំនួន" class="text-center fw-bold">${isIn ? '+' : '-'}${c.qty}</td>
            <td data-label="តម្លៃឯកតា" class="text-end">${fmtAcc(c.price, 'text-slate-700')}</td>
            <td data-label="សរុប ($)" class="text-end">${fmtAcc(c.total, 'text-primary fw-bold')}</td>
            <td data-label="ដៃគូពាក់ព័ន្ធ">${c.partner}</td>
        `;
        tbody.appendChild(tr);
    });

    const qtyIn = combined.filter(c => c.type === 'STOCK_IN').reduce((sum, c) => sum + (Number(c.qty) || 0), 0);
    const qtyOut = combined.filter(c => c.type === 'STOCK_OUT').reduce((sum, c) => sum + (Number(c.qty) || 0), 0);
    const netProfit = totalOut - totalIn;

    const repTfoot = getOrCreateTfoot('reportTableBody', 'reportTableFoot');
    if (repTfoot) {
        repTfoot.innerHTML = `
            <tr class="table-summary-row">
                <td colspan="4" class="text-end fw-bold text-dark">សរុបប្រតិបត្តិការ (${combined.length} ច្រក)៖</td>
                <td class="text-center">
                    <span class="badge badge-success me-1">+${qtyIn}</span>
                    <span class="badge badge-warning">-${qtyOut}</span>
                </td>
                <td class="text-end text-muted">-</td>
                <td class="text-end">${fmtAcc(totalIn + totalOut, 'text-primary fw-bold')}</td>
                <td class="text-start">
                    <span class="badge badge-success me-1">ចូល: $${totalIn.toFixed(2)}</span>
                    <span class="badge badge-amber me-1">ចេញ: $${totalOut.toFixed(2)}</span>
                    <span class="badge ${netProfit >= 0 ? 'badge-info' : 'badge-danger'}">ចំណេញសុទ្ធ: $${netProfit.toFixed(2)}</span>
                </td>
            </tr>`;
    }
}

// Utility Helpers
function updateBadges() {
    const storeProds = getStoreFilteredProducts();
    document.getElementById('totalProductsBadge').textContent = storeProds.length;
    const bBadge = document.getElementById('totalBookingsBadge');
    if (bBadge) bBadge.textContent = state.bookings.length;
}

function exportProductsExcel() {
    try {
        let content = `\uFEFFកូដទំនិញ,ឈ្មោះទំនិញ,ប្រភេទទំនិញ,អ្នកផ្គត់ផ្គង់/ម្ចាស់ហាង,តម្លៃដើម ($),តម្លៃលក់ ($),ចំនួនក្នុងស្តុក,កម្រិតព្រមានស្តុក\n`;
        const productsToExport = getStoreFilteredProducts();
        productsToExport.forEach(p => {
            const cleanName = (p.name || '').replace(/"/g, '""');
            const cleanCat = (p.category || '').replace(/"/g, '""');
            const cleanSup = (p.supplier || 'ទូទៅ').replace(/"/g, '""');
            content += `"${p.code}","${cleanName}","${cleanCat}","${cleanSup}",${p.cost},${p.price},${p.qty},${p.minAlert}\n`;
        });

        const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `stock_products_${new Date().toISOString().split('T')[0]}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('បានទាញយកឯកសារ Excel ជោគជ័យ!', 'success');
    } catch (err) {
        console.error('Export Excel Error:', err);
        showToast('មានបញ្ហាក្នុងការទាញយក Excel', 'danger');
    }
}

function exportProductsPDF() {
    try {
        const today = new Date().toISOString().split('T')[0];
        let rowsHTML = '';
        const productsToExport = getStoreFilteredProducts();
        productsToExport.forEach((p, i) => {
            rowsHTML += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${i + 1}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;"><code>${p.code}</code></td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${p.name}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.category}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.supplier || 'ទូទៅ'}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">$${Number(p.cost).toFixed(2)}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #2563eb;">$${Number(p.price).toFixed(2)}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${p.qty}</td>
                </tr>
            `;
        });

        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>របាយការណ៍បញ្ជីទំនិញ - ${today}</title>
                <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Kantumruy Pro', sans-serif; padding: 20px; color: #1e293b; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
                    .header h2 { margin: 0; color: #2563eb; font-size: 22px; }
                    .header p { margin: 5px 0 0 0; color: #64748b; font-size: 13px; }
                    .meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; color: #475569; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
                    th { background-color: #0f172a; color: white; padding: 10px; border: 1px solid #0f172a; text-align: left; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>របាយការណ៍បញ្ជីទំនិញក្នុងស្តុក (Stock Products Report)</h2>
                    <p>ស្តុកខ្មែរ Pro - Inventory Sheets System</p>
                </div>
                <div class="meta">
                    <span>កាលបរិច្ឆេទទាញយក: <strong>${today}</strong></span>
                    <span>ទំនិញសរុប: <strong>${state.products.length} ប្រភេទ</strong></span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">ល.រ</th>
                            <th>កូដទំនិញ</th>
                            <th>ឈ្មោះទំនិញ / ផលិតផល</th>
                            <th>ប្រភេទទំនិញ</th>
                            <th>អ្នកផ្គត់ផ្គង់</th>
                            <th style="text-align: right;">តម្លៃដើម</th>
                            <th style="text-align: right;">តម្លៃលក់</th>
                            <th style="text-align: center;">ចំនួនស្តុក</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        let iframe = document.getElementById('printIframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'printIframe';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
        }
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(printHTML);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            showToast('បានបើកផ្ទាំង Export/Save PDF ជោគជ័យ!', 'success');
        }, 300);
    } catch (err) {
        console.error('Export PDF Error:', err);
        showToast('មានបញ្ហាក្នុងការបង្កើត PDF', 'danger');
    }
}

function updateThemeFromPreferences() {
    const savedTheme = safeStorage.getItem('km_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = 'fa-solid fa-sun';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-solid fa-circle-check text-success',
        danger: 'fa-solid fa-circle-xmark text-danger',
        warning: 'fa-solid fa-triangle-exclamation text-warning',
        info: 'fa-solid fa-circle-info text-primary'
    };

    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// System Settings Functions
function loadSettingsUI() {
    const gasUrl = safeStorage.getItem('km_gas_url') || '';
    const sheetId = safeStorage.getItem('km_sheet_id') || '';
    const storeName = safeStorage.getItem('km_store_name') || 'ហាងទំនិញ ខ្មែរ Pro';
    const currency = safeStorage.getItem('km_currency') || '$';
    const defaultMinAlert = safeStorage.getItem('km_default_min_alert') || '5';
    const theme = safeStorage.getItem('km_theme') || 'light';

    const prefixProduct = safeStorage.getItem('km_prefix_product') || 'PRD-';
    const prefixStockIn = safeStorage.getItem('km_prefix_stock_in') || 'PUR-';
    const prefixStockOut = safeStorage.getItem('km_prefix_stock_out') || 'SAL-';
    const prefixBooking = safeStorage.getItem('km_prefix_booking') || 'BKG-';

    if (document.getElementById('settingGasUrl')) document.getElementById('settingGasUrl').value = gasUrl;
    if (document.getElementById('settingSheetId')) document.getElementById('settingSheetId').value = sheetId;
    if (document.getElementById('settingStoreName')) document.getElementById('settingStoreName').value = storeName;
    if (document.getElementById('settingCurrency')) document.getElementById('settingCurrency').value = currency;
    if (document.getElementById('settingDefaultMinAlert')) document.getElementById('settingDefaultMinAlert').value = defaultMinAlert;
    if (document.getElementById('settingThemeSelect')) document.getElementById('settingThemeSelect').value = theme;

    populateUserPrefixSelect();
    renderUsersTable();
    updateConnectionStatusDisplay();
    renderSettingsCategories();
    renderSettingsProductsTable();
    renderContactsTables();
}

function populateUserPrefixSelect() {
    const select = document.getElementById('settingPrefixUserSelect');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '';

    const curUser = state.currentUser ? state.currentUser.username : '';
    state.users.forEach(u => {
        const option = document.createElement('option');
        option.value = u.username;
        const isCurrent = u.username.toLowerCase() === curUser.toLowerCase();
        option.textContent = `${u.fullName || u.username} (@${u.username}) ${isCurrent ? ' [កំពុងប្រើប្រាស់ - Active]' : ''}`;
        select.appendChild(option);
    });

    if (currentVal && state.users.some(u => u.username === currentVal)) {
        select.value = currentVal;
    } else if (curUser && state.users.some(u => u.username.toLowerCase() === curUser.toLowerCase())) {
        const match = state.users.find(u => u.username.toLowerCase() === curUser.toLowerCase());
        select.value = match.username;
    } else if (state.users.length > 0) {
        select.value = state.users[0].username;
    }

    onPrefixUserSelectChange();
}

function onPrefixUserSelectChange() {
    const select = document.getElementById('settingPrefixUserSelect');
    if (!select) return;
    const username = select.value;
    const prefixes = getUserPrefixes(username);

    if (document.getElementById('settingPrefixProduct')) document.getElementById('settingPrefixProduct').value = prefixes.product;
    if (document.getElementById('settingPrefixStockIn')) document.getElementById('settingPrefixStockIn').value = prefixes.stockIn;
    if (document.getElementById('settingPrefixStockOut')) document.getElementById('settingPrefixStockOut').value = prefixes.stockOut;
    if (document.getElementById('settingPrefixBooking')) document.getElementById('settingPrefixBooking').value = prefixes.booking;
}

function getStoredCategories() {
    const customCats = JSON.parse(safeStorage.getItem('km_custom_categories') || '[]');
    const productCats = state.products.map(p => p.category);
    const combined = new Set([...customCats, ...productCats]);
    return Array.from(combined).filter(Boolean);
}

function renderSettingsCategories() {
    const container = document.getElementById('settingsCategoryList');
    if (!container) return;

    const categories = getStoredCategories();
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<small class="text-muted p-2">ពុំទាន់មានប្រភេទទំនិញនៅឡើយទេ</small>';
        return;
    }

    categories.forEach(cat => {
        const prodCount = state.products.filter(p => p.category === cat).length;
        const iconClass = getCategoryIcon(cat);
        const card = document.createElement('div');
        card.className = 'category-chip-card';
        card.innerHTML = `
            <div class="chip-avatar">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="chip-info">
                <span class="chip-name" title="${cat}">${cat}</span>
                <span class="chip-count">${prodCount} ទំនិញ</span>
            </div>
            <button class="chip-delete-btn" onclick="deleteCategoryFromSettings('${cat}')" title="លុបប្រភេទទំនិញ">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        container.appendChild(card);
    });
}

function renderSettingsProductsTable() {
    const tbody = document.getElementById('settingsProductsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
}

function addNewCategoryFromSettings() {
    const input = document.getElementById('newCategoryInput');
    if (!input) return;

    const catName = input.value.trim();
    if (!catName) {
        showToast('សូមបញ្ចូលឈ្មោះប្រភេទទំនិញ!', 'warning');
        return;
    }

    const customCats = JSON.parse(localStorage.getItem('km_custom_categories') || '[]');
    if (!customCats.includes(catName)) {
        customCats.push(catName);
        localStorage.setItem('km_custom_categories', JSON.stringify(customCats));
    }

    input.value = '';
    populateCategoriesDatalist();
    renderSettingsCategories();
    showToast(`បានបន្ថែមប្រភេទទំនិញ «${catName}» ជោគជ័យ!`, 'success');
}

function deleteCategoryFromSettings(catName) {
    const count = state.products.filter(p => p.category === catName).length;
    if (count > 0) {
        showToast(`មិនអាចលុបបានទេ! មានទំនិញចំនួន ${count} កំពុងប្រើប្រាស់ប្រភេទទំនិញ «${catName}» នេះ`, 'warning');
        return;
    }

    let customCats = JSON.parse(safeStorage.getItem('km_custom_categories') || '[]');
    customCats = customCats.filter(c => c !== catName);
    safeStorage.setItem('km_custom_categories', JSON.stringify(customCats));

    populateCategoriesDatalist();
    renderSettingsCategories();
    showToast(`បានលុបប្រភេទទំនិញ «${catName}» ជោគជ័យ!`, 'success');
}

function renderSettingsProductsTable() {
    const tbody = document.getElementById('settingsProductListTbody');
    const countText = document.getElementById('settingsProductCountText');
    const searchInput = document.getElementById('settingsProductSearchInput');
    if (!tbody) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filtered = state.products.filter(p => p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || (p.supplier && p.supplier.toLowerCase().includes(query)));

    if (countText) countText.textContent = `ទំនិញសរុប៖ ${filtered.length} / ${state.products.length} ប្រភេទ`;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted p-4"><i class="fa-solid fa-box-open me-2 fs-4"></i><br>ពុំទាន់មានទំនិញក្នុងស្តុកទេ</td></tr>';
        return;
    }

    filtered.forEach((p) => {
        const realIdx = state.products.findIndex(item => item.code === p.code);
        let badgeClass = 'badge-success';
        if (p.qty === 0) badgeClass = 'badge-danger';
        else if (p.qty <= p.minAlert) badgeClass = 'badge-warning';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code class="px-2 py-1 bg-main border rounded fw-bold text-dark">${p.code}</code></td>
            <td><strong class="text-primary fs-6">${p.name}</strong></td>
            <td class="text-center"><span class="badge badge-info"><i class="fa-solid ${getCategoryIcon(p.category)} me-1"></i>${p.category}</span></td>
            <td class="text-center"><span class="badge badge-outline-secondary"><i class="fa-solid fa-truck-field me-1"></i>${p.supplier || 'ទូទៅ'}</span></td>
            <td class="text-end"><span class="text-muted">$${Number(p.cost || 0).toFixed(2)}</span></td>
            <td class="text-end"><strong class="text-success">$${Number(p.price || 0).toFixed(2)}</strong></td>
            <td class="text-center"><span class="badge ${badgeClass}">${p.qty}</span></td>
            <td class="text-center">
                <div class="flex-center gap-2">
                    <button class="btn btn-action-edit" onclick="editProduct(${realIdx})" title="កែប្រែទំនិញ">
                        <i class="fa-solid fa-pen-to-square"></i> <span>កែប្រែ</span>
                    </button>
                    <button class="btn btn-action-delete" onclick="deleteProduct(${realIdx})" title="លុបទំនិញ">
                        <i class="fa-solid fa-trash-can"></i> <span>លុប</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateConnectionStatusDisplay() {
    const dot = document.getElementById('settingStatusDot');
    const text = document.getElementById('settingStatusText');
    const gasUrl = safeStorage.getItem('km_gas_url');

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        if (dot) dot.className = 'status-indicator online';
        if (text) text.textContent = 'ស្ថានភាព៖ ភ្ជាប់ Google Apps Script (Server Mode)';
    } else if (gasUrl) {
        if (dot) dot.className = 'status-indicator online';
        if (text) text.textContent = 'ស្ថានភាព៖ ភ្ជាប់ Web App URL រក្សាទុកបាន';
    } else {
        if (dot) dot.className = 'status-indicator offline';
        if (text) text.textContent = 'ស្ថានភាព៖ Local Mode (Offline)';
    }
}

function saveSystemSettings() {
    const gasUrl = document.getElementById('settingGasUrl').value.trim();
    const sheetId = document.getElementById('settingSheetId').value.trim();
    const storeName = document.getElementById('settingStoreName').value.trim();
    const currency = document.getElementById('settingCurrency').value;
    const defaultMinAlert = document.getElementById('settingDefaultMinAlert').value;
    const theme = document.getElementById('settingThemeSelect').value;

    const prefixProduct = document.getElementById('settingPrefixProduct') ? document.getElementById('settingPrefixProduct').value.trim() : 'PRD-';
    const prefixStockIn = document.getElementById('settingPrefixStockIn') ? document.getElementById('settingPrefixStockIn').value.trim() : 'PUR-';
    const prefixStockOut = document.getElementById('settingPrefixStockOut') ? document.getElementById('settingPrefixStockOut').value.trim() : 'SAL-';
    const prefixBooking = document.getElementById('settingPrefixBooking') ? document.getElementById('settingPrefixBooking').value.trim() : 'BKG-';

    const selectedUsername = document.getElementById('settingPrefixUserSelect') ? document.getElementById('settingPrefixUserSelect').value : '';
    if (selectedUsername) {
        const targetUser = state.users.find(u => u.username.toLowerCase() === selectedUsername.toLowerCase());
        if (targetUser) {
            targetUser.prefixProduct = prefixProduct || 'PRD-';
            targetUser.prefixStockIn = prefixStockIn || 'PUR-';
            targetUser.prefixStockOut = prefixStockOut || 'SAL-';
            targetUser.prefixBooking = prefixBooking || 'BKG-';
            if (state.currentUser && state.currentUser.username.toLowerCase() === selectedUsername.toLowerCase()) {
                state.currentUser.prefixProduct = targetUser.prefixProduct;
                state.currentUser.prefixStockIn = targetUser.prefixStockIn;
                state.currentUser.prefixStockOut = targetUser.prefixStockOut;
                state.currentUser.prefixBooking = targetUser.prefixBooking;
            }
            syncToGoogleSheets('saveUser', targetUser);
        }
    }

    safeStorage.setItem('km_gas_url', gasUrl);
    safeStorage.setItem('km_sheet_id', sheetId);
    safeStorage.setItem('km_store_name', storeName);
    safeStorage.setItem('km_currency', currency);
    safeStorage.setItem('km_default_min_alert', defaultMinAlert);
    safeStorage.setItem('km_theme', theme);

    safeStorage.setItem('km_prefix_product', prefixProduct || 'PRD-');
    safeStorage.setItem('km_prefix_stock_in', prefixStockIn || 'PUR-');
    safeStorage.setItem('km_prefix_stock_out', prefixStockOut || 'SAL-');
    safeStorage.setItem('km_prefix_booking', prefixBooking || 'BKG-');

    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    updateConnectionStatusDisplay();
    renderUsersTable();
    showToast('បានរក្សាទុកការកំណត់ប្រព័ន្ធ និងក្បាលលេខគណនីជោគជ័យ!', 'success');
}

function pushDataToGoogleSheets() {
    const gasUrl = safeStorage.getItem('km_gas_url') || (document.getElementById('settingGasUrl') ? document.getElementById('settingGasUrl').value.trim() : '');
    
    if (typeof google === 'undefined' && !gasUrl) {
        showToast('សូមបញ្ចូល Google Apps Script Web App URL ជាមុនសិន!', 'warning');
        return;
    }

    if (!confirm('តើអ្នកពិតជាចង់បញ្ជូនទិន្នន័យ Local ទាំងអស់ទៅរក្សាទុកក្នុង Google Sheets មែនទេ?')) {
        return;
    }

    showToast('កំពុងបញ្ជូនទិន្នន័យ Local ទាំងអស់ទៅ Google Sheets...', 'info');

    const payload = {
        products: state.products || [],
        stockInLogs: state.stockInLogs || [],
        stockOutLogs: state.stockOutLogs || [],
        suppliers: state.suppliers || [],
        customers: state.customers || [],
        users: state.users || [],
        bookings: state.bookings || []
    };

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(res => {
                if (res && res.success) {
                    showToast(res.message || 'បានបញ្ជូនទិន្នន័យ Local ទៅ Google Sheets ជោគជ័យ!', 'success');
                    updateConnectionStatusDisplay();
                } else {
                    showToast('កំហុសបញ្ជូនទិន្នន័យ៖ ' + (res ? res.message : ''), 'danger');
                }
            })
            .withFailureHandler(err => {
                showToast('ការភ្ជាប់មានបញ្ហា៖ ' + (err ? err.message : ''), 'danger');
            })
            .pushAllData(payload);
    } else if (gasUrl) {
        const cleanGasUrl = gasUrl.trim();
        const separator = cleanGasUrl.includes('?') ? '&' : '?';
        fetch(cleanGasUrl + separator + 'action=pushAllData', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'pushAllData', data: payload })
        })
        .then(r => r.json().catch(() => ({ success: true })))
        .then(res => {
            if (res && res.success !== false) {
                showToast('បានបញ្ជូនទិន្នន័យ Local ទៅ Google Sheets ជោគជ័យ!', 'success');
                updateConnectionStatusDisplay();
            } else if (res && res.message && (res.message.includes('Unknown action') || res.message.includes('unknown action'))) {
                showToast('កំពុងបញ្ជូនទិន្នន័យតាម Legacy API (Individual Sync)...', 'info');
                fallbackIndividualPush(cleanGasUrl, payload);
            } else {
                showToast('កត់ចំណាំ៖ ' + (res ? res.message : 'បានបញ្ជូនទិន្នន័យ'), 'info');
            }
        })
        .catch(() => {
            showToast('បានបញ្ជូនទិន្នន័យទៅ Google Sheets Web App រួចរាល់!', 'success');
            updateConnectionStatusDisplay();
        });
    }
}

function fallbackIndividualPush(gasUrl, payload) {
    const separator = gasUrl.includes('?') ? '&' : '?';
    
    if (payload.users && Array.isArray(payload.users)) {
        payload.users.forEach(u => {
            fetch(gasUrl + separator + 'action=saveUser', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'saveUser', data: u })
            }).catch(() => {});
        });
    }

    if (payload.products && Array.isArray(payload.products)) {
        payload.products.forEach(p => {
            fetch(gasUrl + separator + 'action=saveProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'saveProduct', data: p })
            }).catch(() => {});
        });
    }

    if (payload.suppliers && Array.isArray(payload.suppliers)) {
        payload.suppliers.forEach(s => {
            fetch(gasUrl + separator + 'action=saveSupplier', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'saveSupplier', data: s })
            }).catch(() => {});
        });
    }

    if (payload.customers && Array.isArray(payload.customers)) {
        payload.customers.forEach(c => {
            fetch(gasUrl + separator + 'action=saveCustomer', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'saveCustomer', data: c })
            }).catch(() => {});
        });
    }

    showToast('បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យទាំងអស់ទៅ Google Sheets ជោគជ័យ!', 'success');
    updateConnectionStatusDisplay();
}

function pullDataFromGoogleSheets() {
    const gasUrl = document.getElementById('settingGasUrl') ? document.getElementById('settingGasUrl').value.trim() : safeStorage.getItem('km_gas_url');
    showToast('កំពុងទាញយកទិន្នន័យពី Google Sheets...', 'info');

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(res => {
                if (res && res.success && res.data) {
                    state.products = res.data.products || [];
                    state.stockInLogs = res.data.stockInLogs || [];
                    state.stockOutLogs = res.data.stockOutLogs || [];
                    state.suppliers = res.data.suppliers || [];
                    state.customers = res.data.customers || [];
                    if (res.data.users && res.data.users.length > 0) state.users = res.data.users;
                    if (res.data.bookings && res.data.bookings.length > 0) state.bookings = res.data.bookings;
                    saveToLocalStorage();
                    refreshCurrentUI();
                    showToast(`បានទាញយកទិន្នន័យពី Google Sheets ជោគជ័យ! (${state.products.length} ទំនិញ, ${state.users.length} គណនី)`, 'success');
                    updateConnectionStatusDisplay();
                } else {
                    showToast('ទាញយកមិនបានសម្រេច: ' + (res ? res.message : ''), 'danger');
                }
            })
            .withFailureHandler(err => {
                showToast('ការភ្ជាប់មានបញ្ហា: ' + err.message, 'danger');
            })
            .getInitialData();
    } else if (gasUrl) {
        const cleanGasUrl = gasUrl.trim();
        const separator = cleanGasUrl.includes('?') ? '&' : '?';
        fetch(cleanGasUrl + separator + 'action=getData')
            .then(res => res.json())
            .then(res => {
                if (res && res.success && res.data) {
                    state.products = res.data.products || [];
                    state.stockInLogs = res.data.stockInLogs || [];
                    state.stockOutLogs = res.data.stockOutLogs || [];
                    state.suppliers = res.data.suppliers || [];
                    state.customers = res.data.customers || [];
                    if (res.data.users && res.data.users.length > 0) state.users = res.data.users;
                    if (res.data.bookings && res.data.bookings.length > 0) state.bookings = res.data.bookings;
                    saveToLocalStorage();
                    refreshCurrentUI();
                    showToast(`បានទាញយកទិន្នន័យពី Google Sheets ជោគជ័យ! (${state.products.length} ទំនិញ, ${state.users.length} គណនី)`, 'success');
                    updateConnectionStatusDisplay();
                } else {
                    showToast('បានរក្សាទុក URL (អាចប្រើជាមួយ Google Apps Script)', 'info');
                }
            })
            .catch(() => {
                showToast('បានទាញយកទិន្នន័យ និងរក្សាទុក URL ភ្ជាប់រួចរាល់!', 'success');
                updateConnectionStatusDisplay();
            });
    } else {
        showToast('សូមបញ្ចូល Google Apps Script Web App URL ជាមុនសិន!', 'warning');
    }
}

function testGoogleSheetsConnection() {
    const gasUrl = document.getElementById('settingGasUrl').value.trim();
    showToast('កំពុងតេស្តការភ្ជាប់ទៅ Google Sheets...', 'info');

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(res => {
                showToast('ភ្ជាប់ Google Sheets Server ជោគជ័យ!', 'success');
                updateConnectionStatusDisplay();
            })
            .withFailureHandler(err => {
                showToast('ការភ្ជាប់មានបញ្ហា: ' + err.message, 'danger');
            })
            .getInitialData();
    } else if (gasUrl) {
        fetch(gasUrl + '?action=ping')
            .then(res => res.json())
            .then(data => {
                showToast('ភ្ជាប់ Google Sheets Web App ជោគជ័យ!', 'success');
                updateConnectionStatusDisplay();
            })
            .catch(() => {
                showToast('បានរក្សាទុក Web App URL រួចរាល់!', 'success');
                updateConnectionStatusDisplay();
            });
    } else {
        showToast('ពុំទាន់មាន Web App URL ទេ (ប្រព័ន្ធដំណើរការជា Local Mode)', 'warning');
    }
}

function backupSystemData() {
    const backupObj = {
        app: 'Khmer Stock Pro',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        products: state.products,
        stockInLogs: state.stockInLogs,
        stockOutLogs: state.stockOutLogs,
        suppliers: state.suppliers,
        customers: state.customers
    };

    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('បានទាញយកឯកសារ Backup ជោគជ័យ!', 'success');
}

function restoreSystemData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.products && Array.isArray(data.products)) {
                state.products = data.products;
                if (data.stockInLogs) state.stockInLogs = data.stockInLogs;
                if (data.stockOutLogs) state.stockOutLogs = data.stockOutLogs;
                if (data.suppliers) state.suppliers = data.suppliers;
                if (data.customers) state.customers = data.customers;

                saveToLocalStorage();
                refreshCurrentUI();
                showToast('បានបញ្ចូលទិន្នន័យ Backup ជោគជ័យ!', 'success');
            } else {
                showToast('ឯកសារ Backup មិនត្រឹមត្រូវទេ!', 'danger');
            }
        } catch (err) {
            showToast('មានបញ្ហាក្នុងការអានឯកសារ JSON', 'danger');
        }
    };
    reader.readAsText(file);
}

function resetAllSystemData() {
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យទាំងអស់ក្នុងប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ!')) {
        safeStorage.clear();
        state.products = [];
        state.stockInLogs = [];
        state.stockOutLogs = [];
        state.suppliers = [];
        state.customers = [];
        refreshCurrentUI();
        showToast('បានលុបទិន្នន័យទាំងអស់ក្នុងប្រព័ន្ធ!', 'warning');
    }
}

// ==========================================================================
// User Authentication & Role-Based Access Control (RBAC) Logic
// ==========================================================================
function checkLoginSession() {
    let savedUserJson = safeSessionStorage.getItem('km_logged_user');
    if (!savedUserJson) {
        savedUserJson = safeStorage.getItem('km_logged_user');
        if (savedUserJson) {
            safeSessionStorage.setItem('km_logged_user', savedUserJson);
            safeStorage.removeItem('km_logged_user');
        }
    }

    const loginOverlay = document.getElementById('loginOverlay');

    if (savedUserJson) {
        try {
            const userObj = JSON.parse(savedUserJson);
            let matched = state.users.find(u => u.username.toLowerCase() === userObj.username.toLowerCase());
            if (!matched && defaultSeedData.users) {
                matched = defaultSeedData.users.find(u => u.username.toLowerCase() === userObj.username.toLowerCase());
            }
            if (matched && matched.status !== 'Inactive') {
                state.currentUser = matched;
                if (loginOverlay) loginOverlay.classList.add('hidden');
                updateUserHeaderBadge();
                applyRolePermissions();
                return true;
            }
        } catch (e) {}
    }

    state.currentUser = null;
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    updateUserHeaderBadge();
    return false;
}

function updateUserHeaderBadge() {
    const roleBadge = document.getElementById('headerUserRoleBadge');
    const nameText = document.getElementById('headerUserNameText');
    const profileBar = document.getElementById('userProfileHeaderBar');

    if (state.currentUser) {
        if (profileBar) profileBar.classList.remove('hidden');
        if (roleBadge) {
            roleBadge.textContent = state.currentUser.role === 'Store' ? 'ម្ចាស់ហាង (Store)' : state.currentUser.role;
            if (state.currentUser.role === 'Admin') {
                roleBadge.className = 'badge badge-primary user-role-badge';
            } else if (state.currentUser.role === 'Store') {
                roleBadge.className = 'badge badge-purple user-role-badge';
            } else if (state.currentUser.role === 'Manager') {
                roleBadge.className = 'badge badge-success user-role-badge';
            } else if (state.currentUser.role === 'Customer') {
                roleBadge.className = 'badge badge-info user-role-badge';
            } else {
                roleBadge.className = 'badge badge-warning user-role-badge';
            }
        }
        if (nameText) nameText.textContent = state.currentUser.fullName || state.currentUser.username;
    } else {
        if (profileBar) profileBar.classList.add('hidden');
    }
}

function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const userEl = document.getElementById('loginUsername');
    const pwdEl = document.getElementById('loginPassword');
    const alertBox = document.getElementById('loginAlertBox');
    const alertText = document.getElementById('loginAlertText');

    const username = (userEl ? userEl.value : '').trim();
    const password = (pwdEl ? pwdEl.value : '').trim();

    if (!username || !password) {
        if (alertText) alertText.textContent = 'សូមបញ្ចូល ឈ្មោះគណនី និង លេខសម្ងាត់!';
        if (alertBox) alertBox.classList.remove('hidden');
        return;
    }

    let matchedUser = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!matchedUser && defaultSeedData.users) {
        matchedUser = defaultSeedData.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    if (!matchedUser || matchedUser.password !== password) {
        if (alertText) alertText.textContent = 'ឈ្មោះគណនី ឬ ពាក្យសម្ងាត់ មិនត្រឹមត្រូវឡើយ!';
        if (alertBox) alertBox.classList.remove('hidden');
        return;
    }

    if (matchedUser.status === 'Inactive') {
        if (alertText) alertText.textContent = 'គណនីនេះត្រូវបានផ្អាកដំណើរការ! សូមទាក់ទង Admin';
        if (alertBox) alertBox.classList.remove('hidden');
        return;
    }

    if (alertBox) alertBox.classList.add('hidden');
    state.currentUser = matchedUser;
    safeSessionStorage.setItem('km_logged_user', JSON.stringify(matchedUser));
    safeStorage.removeItem('km_logged_user');

    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) loginOverlay.classList.add('hidden');

    if (userEl) userEl.value = '';
    if (pwdEl) pwdEl.value = '';

    updateUserHeaderBadge();
    applyRolePermissions();
    refreshCurrentUI();
    showToast(`ជម្រាបសួរ ${matchedUser.fullName}! បានចូលប្រើប្រាស់ប្រព័ន្ធជោគជ័យ`, 'success');
}

function handleLogout(e) {
    if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    state.currentUser = null;
    safeSessionStorage.removeItem('km_logged_user');
    safeStorage.removeItem('km_logged_user');
    try { if (window.localStorage) window.localStorage.removeItem('km_logged_user'); } catch (err) {}
    try { if (window.sessionStorage) window.sessionStorage.removeItem('km_logged_user'); } catch (err) {}

    const loginUser = document.getElementById('loginUsername');
    const loginPwd = document.getElementById('loginPassword');
    if (loginUser) loginUser.value = '';
    if (loginPwd) loginPwd.value = '';

    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        loginOverlay.classList.remove('hidden');
        loginOverlay.style.display = 'flex';
    }

    updateUserHeaderBadge();
    showToast('បានចាកចេញពីប្រព័ន្ធជោគជ័យ!', 'info');
    return false;
}
window.handleLogout = handleLogout;

function applyRolePermissions() {
    if (!state.currentUser) return;

    const allowedPages = getUserAllowedPages(state.currentUser);
    const navItems = document.querySelectorAll('.sidebar-nav li[data-page]');
    const quickActions = document.querySelector('.quick-actions');
    const userMgmtCard = document.getElementById('userManagementCard');

    navItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (allowedPages.includes(page)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    if (userMgmtCard) {
        if (state.currentUser.role === 'Admin' || allowedPages.includes('settings')) {
            userMgmtCard.style.display = 'block';
            renderUsersTable();
        } else {
            userMgmtCard.style.display = 'none';
        }
    }

    if (quickActions) {
        const canQuickAction = allowedPages.includes('products') || allowedPages.includes('stock-in');
        quickActions.style.display = canQuickAction ? 'flex' : 'none';
    }

    if (!allowedPages.includes(state.currentPage)) {
        renderPage(allowedPages[0] || 'stock-out');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersListTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (state.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-3">ពុំទាន់មានគណនីប្រើប្រាស់នៅឡើយទេ</td></tr>';
        return;
    }

    state.users.forEach((u) => {
        const isSelf = state.currentUser && state.currentUser.username.toLowerCase() === u.username.toLowerCase();
        let roleBadge = '<span class="badge badge-warning">Cashier</span>';
        if (u.role === 'Admin') roleBadge = '<span class="badge badge-primary">Admin</span>';
        else if (u.role === 'Store') roleBadge = '<span class="badge badge-purple">ម្ចាស់ហាង (Store)</span>';
        else if (u.role === 'Manager') roleBadge = '<span class="badge badge-success">Manager</span>';
        else if (u.role === 'Customer') roleBadge = '<span class="badge badge-info">Customer</span>';

        let statusBadge = u.status === 'Active' 
            ? '<span class="badge badge-success"><i class="fa-solid fa-check me-1"></i>Active</span>'
            : '<span class="badge badge-danger"><i class="fa-solid fa-ban me-1"></i>Inactive</span>';

        const userPages = getUserAllowedPages(u);
        const pagesBadge = `<span class="badge badge-info" title="ទំព័រដែលអនុញ្ញាត៖ ${userPages.join(', ')}">${userPages.length} ទំព័រ</span>`;

        const prefs = getUserPrefixes(u.username);
        const prefixBadge = `<div class="d-flex flex-wrap justify-content-center gap-1" style="font-size: 0.75rem;"><span class="badge bg-light text-primary border" title="កូដទំនិញ">${prefs.product}</span><span class="badge bg-light text-success border" title="ទិញចូល">${prefs.stockIn}</span><span class="badge bg-light text-secondary border" title="លក់ចេញ">${prefs.stockOut}</span><span class="badge bg-light text-warning border" title="កក់">${prefs.booking}</span></div>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="ឈ្មោះគណនី"><code>${u.username}</code> ${isSelf ? '<span class="badge badge-info ms-1">អ្នក</span>' : ''}</td>
            <td data-label="ឈ្មោះពេញ"><strong>${u.fullName || u.username}</strong></td>
            <td data-label="តួនាទី" class="text-center">${roleBadge}</td>
            <td data-label="សិទ្ធិចូលទំព័រ" class="text-center">${pagesBadge}</td>
            <td data-label="ក្បាលលេខ (Prefixes)" class="text-center">${prefixBadge}</td>
            <td data-label="ស្ថានភាព" class="text-center">${statusBadge}</td>
            <td data-label="សកម្មភាព" class="text-center">
                <div class="flex-center gap-2">
                    <button class="btn btn-action-edit" onclick="openUserModal('${u.username}')" title="កែប្រែគណនី">
                        <i class="fa-solid fa-pen-to-square"></i> <span>កែប្រែ</span>
                    </button>
                    ${!isSelf ? `
                    <button class="btn btn-action-delete" onclick="deleteUserByUsername('${u.username}')" title="លុបគណនី">
                        <i class="fa-solid fa-trash-can"></i> <span>លុប</span>
                    </button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openUserModal(username = '') {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    if (!modal || !form) return;
    form.reset();

    if (username) {
        const u = state.users.find(item => item.username.toLowerCase() === username.toLowerCase());
        if (u) {
            document.getElementById('userModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> កែប្រែគណនី (${u.username})`;
            document.getElementById('userEditUsername').value = u.username;
            document.getElementById('userFormUsername').value = u.username;
            document.getElementById('userFormUsername').readOnly = true;
            document.getElementById('userFormPassword').value = u.password;
            document.getElementById('userFormFullName').value = u.fullName || u.username;
            document.getElementById('userFormRole').value = u.role || 'Cashier';
            document.getElementById('userFormStatus').value = u.status || 'Active';

            const userPages = getUserAllowedPages(u);
            document.querySelectorAll('.user-page-checkbox').forEach(cb => {
                cb.checked = userPages.includes(cb.value);
            });

            const prefs = getUserPrefixes(u.username);
            if (document.getElementById('userFormPrefixProduct')) document.getElementById('userFormPrefixProduct').value = prefs.product;
            if (document.getElementById('userFormPrefixStockIn')) document.getElementById('userFormPrefixStockIn').value = prefs.stockIn;
            if (document.getElementById('userFormPrefixStockOut')) document.getElementById('userFormPrefixStockOut').value = prefs.stockOut;
            if (document.getElementById('userFormPrefixBooking')) document.getElementById('userFormPrefixBooking').value = prefs.booking;
        }
    } else {
        document.getElementById('userModalTitle').innerHTML = `<i class="fa-solid fa-user-plus"></i> បន្ថែមគណនីថ្មី`;
        document.getElementById('userEditUsername').value = '';
        document.getElementById('userFormUsername').readOnly = false;
        document.getElementById('userFormRole').value = 'Cashier';
        document.getElementById('userFormStatus').value = 'Active';

        const defaultPages = getRoleDefaultPages('Cashier');
        document.querySelectorAll('.user-page-checkbox').forEach(cb => {
            cb.checked = defaultPages.includes(cb.value);
        });

        if (document.getElementById('userFormPrefixProduct')) document.getElementById('userFormPrefixProduct').value = 'PRD-';
        if (document.getElementById('userFormPrefixStockIn')) document.getElementById('userFormPrefixStockIn').value = 'PUR-';
        if (document.getElementById('userFormPrefixStockOut')) document.getElementById('userFormPrefixStockOut').value = 'SAL-';
        if (document.getElementById('userFormPrefixBooking')) document.getElementById('userFormPrefixBooking').value = 'BKG-';
    }

    modal.classList.add('show');
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) modal.classList.remove('show');
}

function handleUserFormSubmit(e) {
    e.preventDefault();
    const editUsername = document.getElementById('userEditUsername').value.trim();
    const username = document.getElementById('userFormUsername').value.trim();
    const password = document.getElementById('userFormPassword').value.trim();
    const fullName = document.getElementById('userFormFullName').value.trim();
    const role = document.getElementById('userFormRole').value;
    const status = document.getElementById('userFormStatus').value;

    const allowedPages = Array.from(document.querySelectorAll('.user-page-checkbox:checked')).map(cb => cb.value);

    const prefixProduct = document.getElementById('userFormPrefixProduct') ? document.getElementById('userFormPrefixProduct').value.trim() : 'PRD-';
    const prefixStockIn = document.getElementById('userFormPrefixStockIn') ? document.getElementById('userFormPrefixStockIn').value.trim() : 'PUR-';
    const prefixStockOut = document.getElementById('userFormPrefixStockOut') ? document.getElementById('userFormPrefixStockOut').value.trim() : 'SAL-';
    const prefixBooking = document.getElementById('userFormPrefixBooking') ? document.getElementById('userFormPrefixBooking').value.trim() : 'BKG-';

    const userObj = {
        username,
        password,
        fullName,
        role,
        status,
        allowedPages,
        prefixProduct: prefixProduct || 'PRD-',
        prefixStockIn: prefixStockIn || 'PUR-',
        prefixStockOut: prefixStockOut || 'SAL-',
        prefixBooking: prefixBooking || 'BKG-'
    };

    if (editUsername) {
        const idx = state.users.findIndex(u => u.username.toLowerCase() === editUsername.toLowerCase());
        if (idx >= 0) state.users[idx] = userObj;
        if (state.currentUser && state.currentUser.username.toLowerCase() === editUsername.toLowerCase()) {
            state.currentUser = userObj;
        }
    } else {
        if (state.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            showToast('ឈ្មោះគណនីនេះមានរួចហើយ! សូមប្រើឈ្មោះផ្សេង', 'danger');
            return;
        }
        state.users.push(userObj);
    }

    syncToGoogleSheets('saveUser', userObj, () => {
        closeUserModal();
        renderUsersTable();
        populateUserPrefixSelect();
        showToast('បានរក្សាទុកគណនីប្រើប្រាស់ជោគជ័យ!', 'success');
    });
}

function deleteUserByUsername(username) {
    if (state.currentUser && state.currentUser.username.toLowerCase() === username.toLowerCase()) {
        showToast('មិនអាចលុបគណនីខ្លួនឯងដែលកំពុង Login បានទេ!', 'warning');
        return;
    }

    if (confirm(`តើអ្នកពិតជាចង់លុបគណនី "${username}" នេះ ឬ?`)) {
        const idx = state.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
        if (idx >= 0) {
            state.users.splice(idx, 1);
            syncToGoogleSheets('deleteUser', { username }, () => {
                renderUsersTable();
                populateUserPrefixSelect();
                showToast('បានលុបគណនីជោគជ័យ!', 'success');
            });
        }
    }
}

// ==========================================================================
// Receive Booking (ទទួលការកក់) & Bookings Management Logic
// ==========================================================================
let currentBookingImages = [];

function openBookingModal(logId) {
    if (state.currentUser && state.currentUser.role === 'Cashier') {
        showToast('គណនី Cashier គ្មានសិទ្ធិប្រើប្រាស់មុខងារទទួលការកក់ទេ!', 'warning');
        return;
    }

    if (state.bookings.some(b => b.invoiceNo === logId)) {
        showToast('ប្រតិបត្តិការនេះបានទទួលការកក់រួចរាល់ហើយ!', 'warning');
        return;
    }

    const log = state.stockOutLogs.find(l => l.id === logId);
    if (!log) {
        showToast('ពុំរកឃើញប្រវត្តិលក់នេះទេ!', 'danger');
        return;
    }

    const modal = document.getElementById('bookingModal');
    const form = document.getElementById('bookingForm');
    if (!modal || !form) return;
    form.reset();

    currentBookingImages = [];
    renderBookingImagePreviews();

    const now = new Date();
    const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    document.getElementById('bookingSalesLogId').value = log.id;
    document.getElementById('bookingProdCode').value = log.code || '';
    document.getElementById('bookingAutoTimestampText').textContent = formattedNow;
    document.getElementById('bookingInvoiceNoText').textContent = log.id;
    document.getElementById('bookingProductNameText').textContent = log.name;
    document.getElementById('bookingCustomerNameText').textContent = log.customer || 'អតិថិជនទូទៅ';
    document.getElementById('bookingTotalAmountText').textContent = `$${Number(log.total).toFixed(2)}`;

    document.getElementById('bookingNotes').value = '';

    modal.classList.add('show');
}

window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('show');
}

function handleBookingImageSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (currentBookingImages.length >= 5) {
        showToast('លោកអ្នកបានជ្រើសរើសរូបភាពគ្រប់ចំនួន ៥ សន្លឹកហើយ!', 'warning');
        return;
    }

    const availableSlots = 5 - currentBookingImages.length;
    const selectedFiles = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
        showToast(`ប្រព័ន្ធបានជ្រើសយកត្រឹមតែ ${availableSlots} រូបភាពដំបូង (អតិបរមា ៥ សន្លឹក)`, 'info');
    }

    let processedCount = 0;

    selectedFiles.forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast('សូមជ្រើសរើសប្រភេទរូបភាព (JPG, PNG, WebP)!', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDimension = 800;

                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                currentBookingImages.push(dataUrl);

                processedCount++;
                if (processedCount === selectedFiles.length) {
                    renderBookingImagePreviews();
                    const fileInput = document.getElementById('bookingImageInput');
                    if (fileInput) fileInput.value = '';
                }
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function renderBookingImagePreviews() {
    const container = document.getElementById('bookingImagePreviewContainer');
    if (!container) return;
    container.innerHTML = '';

    if (currentBookingImages.length === 0) return;

    currentBookingImages.forEach((img, idx) => {
        const item = document.createElement('div');
        item.className = 'position-relative d-inline-block m-1';
        item.style.cssText = 'width: 75px; height: 75px;';
        item.innerHTML = `
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px; border: 1px solid #cbd5e1; cursor: pointer;" onclick="openImageViewerModal('${img}', 'រូបភាពទី ${idx + 1}')">
            <button type="button" class="btn btn-sm btn-danger p-0 flex-center" onclick="removeBookingImageAt(${idx})" title="លុបរូបភាព" style="position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        container.appendChild(item);
    });

    const info = document.createElement('div');
    info.className = 'w-100 text-muted text-xs mt-1 fw-semibold';
    info.innerHTML = `រូបភាពបង្កាន់ដៃបានជ្រើសរើស៖ <span class="text-primary fw-bold">${currentBookingImages.length}</span> / 5 សន្លឹក`;
    container.appendChild(info);
}

function removeBookingImageAt(index) {
    if (index >= 0 && index < currentBookingImages.length) {
        currentBookingImages.splice(index, 1);
        renderBookingImagePreviews();
    }
}

function handleBookingFormSubmit(e) {
    e.preventDefault();
    const logId = document.getElementById('bookingSalesLogId').value;
    const prodCode = document.getElementById('bookingProdCode').value;
    const timestamp = document.getElementById('bookingAutoTimestampText').textContent;
    const invoiceNo = document.getElementById('bookingInvoiceNoText').textContent;
    const productName = document.getElementById('bookingProductNameText').textContent;
    const customerName = document.getElementById('bookingCustomerNameText').textContent;
    const totalAmount = parseFloat(document.getElementById('bookingTotalAmountText').textContent.replace('$', '')) || 0;
    const notes = document.getElementById('bookingNotes').value.trim();
    const staffName = state.currentUser ? (state.currentUser.fullName || state.currentUser.username) : 'Staff';

    const prefixBkg = getCurrentUserPrefixes().booking;
    const bookingObj = {
        id: `${prefixBkg}${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp,
        invoiceNo,
        productCode: prodCode,
        productName,
        customerName,
        totalAmount,
        notes,
        images: [...currentBookingImages],
        imageUrl: currentBookingImages[0] || '',
        staffName,
        status: 'Pending'
    };

    state.bookings.unshift(bookingObj);
    saveToLocalStorage();

    syncToGoogleSheets('addBooking', bookingObj, () => {
        closeBookingModal();
        updateBadges();
        renderBookingsTable();
        showToast('បានទទួល និង រក្សាទុកការកក់ទំនិញជោគជ័យ!', 'success');
    });
}

function renderBookingsTable() {
    const tbody = document.getElementById('bookingsTableBody');
    const searchInput = document.getElementById('bookingSearchInput');
    const statusFilter = document.getElementById('bookingStatusFilter');
    if (!tbody) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selStatus = statusFilter ? statusFilter.value : '';

    const pendingCount = (state.bookings || []).filter(b => b.status === 'Pending').length;
    const completedCount = (state.bookings || []).filter(b => b.status === 'Completed').length;

    const pendingSummaryEl = document.getElementById('bookingPendingCountSummary');
    if (pendingSummaryEl) pendingSummaryEl.innerHTML = `<i class="fa-solid fa-clock text-amber me-1"></i> កំពុងកក់: <strong>${pendingCount}</strong>`;
    
    const completedSummaryEl = document.getElementById('bookingCompletedCountSummary');
    if (completedSummaryEl) completedSummaryEl.innerHTML = `<i class="fa-solid fa-circle-check text-green me-1"></i> បង្ហើយ: <strong>${completedCount}</strong>`;

    let filtered = (state.bookings || []).filter(b => {
        const matchesQuery = (b.invoiceNo && b.invoiceNo.toLowerCase().includes(query)) ||
                             (b.productName && b.productName.toLowerCase().includes(query)) ||
                             (b.customerName && b.customerName.toLowerCase().includes(query)) ||
                             (b.notes && b.notes.toLowerCase().includes(query));
        const matchesStatus = !selStatus || b.status === selStatus;
        return matchesQuery && matchesStatus;
    });

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted p-5">
                    <div class="empty-cart-box">
                        <div class="empty-cart-icon bg-amber-light">
                            <i class="fa-solid fa-bookmark text-warning"></i>
                        </div>
                        <div class="empty-cart-title">ពុំទាន់មានទិន្នន័យការកក់ទំនិញនៅឡើយទេ</div>
                        <p class="empty-cart-subtitle">ការកក់ពីអតិថិជននឹងបង្ហាញនៅទីនេះពេលមានការទទួលកក់</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    filtered.forEach((b) => {
        const isCompleted = b.status === 'Completed';
        
        const statusBadge = isCompleted
            ? '<span class="badge-status-completed"><i class="fa-solid fa-circle-check"></i> បង្ហើយ</span>'
            : '<span class="badge-status-pending"><span class="pulse-dot"></span> កំពុងកក់</span>';

        const imgs = (b.images && Array.isArray(b.images) && b.images.length > 0) ? b.images : (b.imageUrl ? [b.imageUrl] : []);
        let imageCell = '<span class="text-muted text-xs">-</span>';
        if (imgs.length > 0) {
            imageCell = `
                <button class="btn btn-receipt-preview flex-center gap-1 mx-auto" onclick="openImageViewerModalGroup('${b.id}')">
                    <i class="fa-solid fa-images text-primary"></i>
                    <span>រូបភាព (${imgs.length})</span>
                </button>`;
        }

        const iconClass = getCategoryIcon(b.productCategory || '');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="ថ្ងៃខែម៉ោង">
                <div class="booking-date-pill">
                    <i class="fa-regular fa-clock text-muted me-1"></i>
                    <span>${b.timestamp}</span>
                </div>
            </td>
            <td data-label="លេខវិក្កយបត្រ">
                <code class="booking-inv-badge">${b.invoiceNo}</code>
            </td>
            <td data-label="ឈ្មោះទំនិញ / ផលិតផល">
                <div class="d-flex align-items-center gap-1 text-nowrap">
                    <i class="fa-solid ${iconClass} text-primary me-1" style="font-size: 0.85rem;"></i>
                    <strong class="text-dark fw-semibold" style="font-size: 0.84rem;">${b.productName}</strong>
                    ${b.productCode ? `<code class="text-muted text-xs ms-1">(${b.productCode})</code>` : ''}
                </div>
            </td>
            <td data-label="អតិថិជន">
                <div class="d-flex align-items-center gap-1 text-slate-700 fw-semibold">
                    <i class="fa-solid fa-user-circle text-secondary fs-6 me-1"></i>
                    <span>${b.customerName}</span>
                </div>
            </td>
            <td data-label="តម្លៃសរុប" class="text-end">
                ${fmtAcc(b.totalAmount, 'text-primary fw-bold')}
            </td>
            <td data-label="រូបភាពបង្កាន់ដៃ" class="text-center">
                ${imageCell}
            </td>
            <td data-label="អ្នកទទួលកក់">
                <span class="badge badge-outline-secondary font-monospace" style="font-size: 0.78rem;">
                    <i class="fa-solid fa-user-shield me-1 text-primary"></i>${b.staffName || 'Admin'}
                </span>
            </td>
            <td data-label="ស្ថានភាព" class="text-center">
                ${statusBadge}
            </td>
            <td data-label="សកម្មភាព" class="text-center">
                <button class="btn ${isCompleted ? 'btn-reopen-action' : 'btn-success-action'} flex-center gap-1 mx-auto" onclick="toggleBookingStatus('${b.id}')" title="ប្តូរស្ថានភាពកក់">
                    <i class="fa-solid ${isCompleted ? 'fa-rotate-left' : 'fa-check'} me-1"></i>
                    <span>${isCompleted ? 'កក់ឡើងវិញ' : 'បង្ហើយកក់'}</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const totalBookedAmount = filtered.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const pendingAmount = filtered.filter(b => b.status === 'Pending').reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const completedAmount = filtered.filter(b => b.status === 'Completed').reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const bkgTfoot = getOrCreateTfoot('bookingsTableBody', 'bookingsTableFoot');
    if (bkgTfoot) {
        bkgTfoot.innerHTML = `
            <tr class="table-summary-row">
                <td colspan="4" class="text-end fw-bold text-dark">សរុបការកក់តាមការជ្រើសរើស (${filtered.length} ការកក់)៖</td>
                <td class="text-end">${fmtAcc(totalBookedAmount, 'text-primary fw-bold')}</td>
                <td colspan="2" class="text-center">
                    <span class="badge badge-warning me-1">កំពុងកក់: $${pendingAmount.toFixed(2)}</span>
                    <span class="badge badge-success">បង្ហើយ: $${completedAmount.toFixed(2)}</span>
                </td>
                <td colspan="2"></td>
            </tr>`;
    }
}

function toggleBookingStatus(id) {
    const b = state.bookings.find(item => item.id === id);
    if (!b) return;

    b.status = (b.status === 'Completed') ? 'Pending' : 'Completed';
    saveToLocalStorage();

    syncToGoogleSheets('updateBookingStatus', { id: b.id, status: b.status }, () => {
        renderBookingsTable();
        showToast(`បានប្តូរស្ថានភាពកក់ទៅ «${b.status === 'Completed' ? 'បានបង្ហើយ' : 'កំពុងកក់'}» ជោគជ័យ!`, 'success');
    });
}

function openImageViewerModal(imgSrc, title = '') {
    const modal = document.getElementById('imageViewerModal');
    const imgEl = document.getElementById('imageViewerSrc');
    const titleEl = document.getElementById('imageViewerTitle');
    const thumbsContainer = document.getElementById('imageViewerThumbnails');

    if (imgEl) imgEl.src = imgSrc;
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-image"></i> រូបភាពបង្កាន់ដៃកក់ (${title})`;
    if (thumbsContainer) thumbsContainer.innerHTML = '';
    if (modal) modal.classList.add('show');
}

function openImageViewerModalGroup(bookingId) {
    const b = state.bookings.find(item => item.id === bookingId);
    if (!b) return;

    const imgs = (b.images && Array.isArray(b.images) && b.images.length > 0) ? b.images : (b.imageUrl ? [b.imageUrl] : []);
    if (imgs.length === 0) return;

    const modal = document.getElementById('imageViewerModal');
    const imgEl = document.getElementById('imageViewerSrc');
    const titleEl = document.getElementById('imageViewerTitle');
    const thumbsContainer = document.getElementById('imageViewerThumbnails');

    if (imgEl) imgEl.src = imgs[0];
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-images"></i> រូបភាពបង្កាន់ដៃកក់ (${b.invoiceNo}) - ${imgs.length} សន្លឹក`;

    if (thumbsContainer) {
        thumbsContainer.innerHTML = '';
        imgs.forEach((src, idx) => {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.style.cssText = `width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid ${idx === 0 ? '#1862f6' : '#cbd5e1'}; cursor: pointer; transition: all 0.2s;`;
            thumb.onclick = () => {
                imgEl.src = src;
                Array.from(thumbsContainer.children).forEach(c => c.style.borderColor = '#cbd5e1');
                thumb.style.borderColor = '#1862f6';
            };
            thumbsContainer.appendChild(thumb);
        });
    }

    if (modal) modal.classList.add('show');
}

function closeImageViewerModal() {
    const modal = document.getElementById('imageViewerModal');
    if (modal) modal.classList.remove('show');
}

// Edit Stock Out Transaction Handlers
function openEditStockOutModal(id) {
    const log = state.stockOutLogs.find(l => l.id === id);
    if (!log) {
        showToast('ពុំរកឃើញទិន្នន័យលក់នេះទេ!', 'warning');
        return;
    }

    const userRole = state.currentUser ? (state.currentUser.role || 'Admin') : 'Admin';
    const isBooked = (state.bookings || []).some(b => 
        b.invoiceNo && id && String(b.invoiceNo).trim().toLowerCase() === String(id).trim().toLowerCase()
    );

    if ((userRole === 'Cashier' || userRole === 'Customer') && isBooked) {
        showToast('ប្រតិបត្តិការនេះត្រូវអ្នកគ្រប់គ្រងទទួលការកក់រួចហើយ! គណនីរបស់អ្នកពុំអាចកែប្រែបានទេ', 'warning');
        return;
    }

    const modal = document.getElementById('editStockOutModal');
    const form = document.getElementById('editStockOutForm');
    if (!modal || !form) return;
    form.reset();

    document.getElementById('editStockOutLogId').value = log.id;
    document.getElementById('editStockOutInfoDisplay').value = `${log.id} - ${log.name} (${log.code})`;
    document.getElementById('editStockOutCustomer').value = log.customer || 'អតិថិជនទូទៅ';
    document.getElementById('editStockOutQty').value = log.qty;
    document.getElementById('editStockOutPrice').value = log.price;

    modal.classList.add('show');
}

window.openEditStockOutModal = openEditStockOutModal;
window.closeEditStockOutModal = closeEditStockOutModal;

function closeEditStockOutModal() {
    const modal = document.getElementById('editStockOutModal');
    if (modal) modal.classList.remove('show');
}

function handleEditStockOutSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editStockOutLogId').value;
    const customer = document.getElementById('editStockOutCustomer').value.trim();
    const newQty = parseInt(document.getElementById('editStockOutQty').value) || 1;
    const newPrice = parseFloat(document.getElementById('editStockOutPrice').value) || 0;

    const logIndex = state.stockOutLogs.findIndex(l => l.id === id);
    if (logIndex < 0) return;
    const oldLog = state.stockOutLogs[logIndex];

    const qtyDiff = newQty - oldLog.qty;

    // Adjust product stock
    const prod = state.products.find(p => p.code === oldLog.code);
    if (prod) {
        prod.qty = Math.max(0, prod.qty - qtyDiff);
        syncToGoogleSheets('saveProduct', prod);
    }

    oldLog.customer = customer;
    oldLog.qty = newQty;
    oldLog.price = newPrice;
    oldLog.total = newQty * newPrice;

    saveToLocalStorage();

    syncToGoogleSheets('updateStockOut', oldLog, () => {
        closeEditStockOutModal();
        refreshCurrentUI();
        showToast('បានកែប្រែប្រតិបត្តិការលក់ចេញជោគជ័យ!', 'success');
    });
}
