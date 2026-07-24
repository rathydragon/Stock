/**
 * ============================================================================
 * Stock Management System - Ultra-Reliable Google Apps Script Backend
 * Attach this file to Google Sheets Apps Script (Extensions > Apps Script)
 * ============================================================================
 */

// Global Sheet Names
const SHEETS = {
  PRODUCTS: 'Products',
  STOCK_IN: 'StockIn',
  STOCK_OUT: 'StockOut',
  SUPPLIERS: 'Suppliers',
  CUSTOMERS: 'Customers',
  USERS: 'Users',
  BOOKINGS: 'Bookings'
};

// Optional: Fill only if using standalone script at script.google.com
const SPREADSHEET_ID = '';

/**
 * Gets the active or configured Spreadsheet safely
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {}
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}
  throw new Error("ពុំទាន់បានភ្ជាប់ Google Sheet ទេ! សូមបើក Google Sheet > Extensions > Apps Script ឬបំពេញ SPREADSHEET_ID ក្នុង Code.gs");
}

/**
 * Serves HTML Web App or GET API
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }
  return renderWebApp();
}

/**
 * Handles POST API requests
 */
function doPost(e) {
  try {
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (parseErr) {}
    }
    var action = (e && e.parameter && e.parameter.action) || contents.action;
    var payload = (contents.data !== undefined) ? contents.data : contents;
    return handleApiRequest(action, payload);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles API actions
 */
function handleApiRequest(action, payload) {
  var result = { success: false, message: 'Unknown action: ' + action };
  try {
    if (action === 'ping') {
      result = { success: true, message: 'Google Sheets Connected' };
    } else if (action === 'getData' || action === 'getInitialData') {
      result = getInitialData();
    } else if (action === 'setupDatabase') {
      result = setupDatabase();
    } else if (action === 'saveProduct') {
      result = saveProduct(payload);
    } else if (action === 'deleteProduct') {
      result = deleteProduct(payload);
    } else if (action === 'addStockIn') {
      result = addStockIn(payload);
    } else if (action === 'addStockOut') {
      result = addStockOut(payload);
    } else if (action === 'saveSupplier') {
      result = saveSupplier(payload);
    } else if (action === 'deleteSupplier') {
      result = deleteSupplier(payload);
    } else if (action === 'saveCustomer') {
      result = saveCustomer(payload);
    } else if (action === 'deleteCustomer') {
      result = deleteCustomer(payload);
    } else if (action === 'updateStockOut') {
      result = updateStockOut(payload);
    } else if (action === 'deleteStockOut') {
      result = deleteStockOut(payload);
    } else if (action === 'saveUser' || action === 'updateUserTable') {
      result = saveUser(payload);
    } else if (action === 'updateAllUsers' || action === 'syncUsers') {
      result = updateAllUsers(payload);
    } else if (action === 'deleteUser') {
      result = deleteUser(payload);
    } else if (action === 'addBooking') {
      result = addBooking(payload);
    } else if (action === 'updateBookingStatus') {
      result = updateBookingStatus(payload);
    } else if (action === 'pushAllData' || action === 'syncAllData') {
      result = pushAllData(payload);
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Serves HTML Web App UI with safe fallback
 */
function renderWebApp() {
  var filenames = ['index', 'index_gas', 'gas_bundle', 'Index'];
  var htmlOutput = null;

  for (var i = 0; i < filenames.length; i++) {
    try {
      htmlOutput = HtmlService.createTemplateFromFile(filenames[i]).evaluate();
      if (htmlOutput) break;
    } catch (e) {
      try {
        htmlOutput = HtmlService.createHtmlOutputFromFile(filenames[i]);
        if (htmlOutput) break;
      } catch (e2) {}
    }
  }

  if (!htmlOutput) {
    htmlOutput = HtmlService.createHtmlOutput(
      '<div style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; line-height: 1.6; max-width: 600px; margin: 50px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">' +
      '<h2 style="color: #e11d48; margin-bottom: 10px;">⚠️ រកមិនឃើញឯកសារ HTML ក្នុង Apps Script ទេ!</h2>' +
      '<p style="color: #475569; font-size: 0.95rem;">សូមបង្កើតឯកសារ HTML ក្នុង Apps Script Editor (Files + ➔ HTML) ៖<br><br>' +
      '<b>១. ឈ្មោះ index</b> (ចម្លងពី index_gas.html ឬ gas_bundle.html)<br>' +
      '<b>២. ឈ្មោះ styles</b> (ចម្លងពី styles.html)<br>' +
      '<b>៣. ឈ្មោះ app</b> (ចម្លងពី app.html)</p>' +
      '</div>'
    );
  }

  return htmlOutput
    .setTitle('ប្រព័ន្ធគ្រប់គ្រងស្តុក - Inventory Management System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper to include sub-HTML files cleanly
 */
function include(filename) {
  if (!filename) return '';
  var cleanName = filename.replace(/\.html$/i, '');
  try {
    return HtmlService.createHtmlOutputFromFile(cleanName).getContent();
  } catch (e1) {
    try {
      return HtmlService.createHtmlOutputFromFile(cleanName + '.html').getContent();
    } catch (e2) {
      return '<!-- Included file missing: ' + filename + ' -->';
    }
  }
}

/**
 * Initializes Database Tabs & Headers
 */
function setupDatabase() {
  var ss = getSpreadsheet();
  
  var sheetDefs = [
    {
      name: SHEETS.PRODUCTS,
      headers: ['Code', 'Name', 'Category', 'CostPrice', 'SalePrice', 'Quantity', 'MinAlert', 'Unit', 'Supplier'],
      defaultRows: [
        ['PRD-001', 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', 'ភេសជ្ជៈ', 12.50, 18.00, 25, 10, 'កញ្ចប់', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ'],
        ['PRD-002', 'ទឹកដោះគោឆៅ (Fresh Milk 1L)', 'ភេសជ្ជៈ', 1.80, 2.50, 4, 10, 'ប្រអប់', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ'],
        ['PRD-003', 'ស្ករស (White Sugar 1kg)', 'គ្រឿងទេស', 0.90, 1.30, 50, 15, 'កញ្ចប់', 'ផ្សារអូរឫស្សី ស្តង់A12'],
        ['PRD-004', 'កែវក្រដាស 16oz (Paper Cups 50pcs)', 'សម្ភារៈ', 2.20, 3.50, 0, 5, 'កេស', 'ផ្សារអូរឫស្សី ស្តង់A12'],
        ['PRD-005', 'តែបៃតងជប៉ុន (Matcha Green Tea 500g)', 'ភេសជ្ជៈ', 15.00, 22.00, 8, 5, 'កញ្ចប់', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ'],
        ['PRD-006', 'ស៊ីរ៉ូរសជាតិវ៉ានីឡា (Vanilla Syrup 750ml)', 'គ្រឿងទេស', 6.50, 9.50, 3, 5, 'ដប', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ']
      ]
    },
    {
      name: SHEETS.STOCK_IN,
      headers: ['ID', 'Date', 'ProductCode', 'ProductName', 'Supplier', 'Quantity', 'CostPrice', 'TotalCost', 'Notes', 'Unit'],
      defaultRows: [
        ['IN-1001', '2026-07-15', 'PRD-001', 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', 20, 12.50, 250.00, 'ទិញចូលស្តុកដើមខែ', 'កញ្ចប់'],
        ['IN-1002', '2026-07-18', 'PRD-003', 'ស្ករស (White Sugar 1kg)', 'ផ្សារអូរឫស្សី', 30, 0.90, 27.00, 'ថែមស្តុក', 'កញ្ចប់']
      ]
    },
    {
      name: SHEETS.STOCK_OUT,
      headers: ['ID', 'Date', 'ProductCode', 'ProductName', 'Customer', 'Quantity', 'SalePrice', 'Discount', 'TotalAmount', 'Unit', 'ServiceFee', 'CodFee', 'PaymentStatus', 'GrandTotal'],
      defaultRows: [
        ['OUT-2001', '2026-07-19', 'PRD-001', 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', 'ហាងកាហ្វេ ជ័យជំនះ', 5, 18.00, 0, 90.00, 'កញ្ចប់', 0, 0, 'Paid', 90.00],
        ['OUT-2002', '2026-07-20', 'PRD-005', 'តែបៃតងជប៉ុន (Matcha Green Tea 500g)', 'អតិថិជនទូទៅ', 2, 22.00, 2.00, 42.00, 'កញ្ចប់', 0, 0, 'Paid', 42.00]
      ]
    },
    {
      name: SHEETS.SUPPLIERS,
      headers: ['ID', 'Name', 'Phone', 'Address'],
      defaultRows: [
        ['SUP-001', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', '012 345 678', 'ភ្នំពេញ'],
        ['SUP-002', 'ផ្សារអូរឫស្សី ស្តង់A12', '098 765 432', 'ភ្នំពេញ']
      ]
    },
    {
      name: SHEETS.USERS,
      headers: ['Username', 'Password', 'FullName', 'Role', 'Status', 'PrefixProduct', 'PrefixStockIn', 'PrefixStockOut', 'PrefixBooking', 'AllowedPages'],
      defaultRows: [
        ['admin', '123456', 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)', 'Admin', 'Active', 'PRD-', 'PUR-', 'SAL-', 'BKG-', '["dashboard","products","stock-in","stock-out","contacts","bookings","reports","settings"]'],
        ['manager', '123456', 'អ្នកគ្រប់គ្រងស្តុក (Manager)', 'Manager', 'Active', 'PRD-', 'PUR-', 'SAL-', 'BKG-', '["dashboard","products","stock-in","stock-out","contacts","bookings","reports"]'],
        ['cashier', '123456', 'បុគ្គលិករៀបចំការលក់ (Cashier)', 'Cashier', 'Active', 'PRD-', 'PUR-', 'SAL-', 'BKG-', '["stock-out"]']
      ]
    },
    {
      name: SHEETS.BOOKINGS,
      headers: ['ID', 'Timestamp', 'InvoiceNo', 'ProductCode', 'ProductName', 'CustomerName', 'DepositAmount', 'TotalAmount', 'Notes', 'ImageUrl', 'StaffName', 'Status'],
      defaultRows: [
        ['BKG-1001', '2026-07-23 11:30:15', 'SAL-600995', 'PRD-001', 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', 'អតិថិជនទូទៅ', 10.00, 18.00, 'កក់ 50% តាម ABA', '', 'Admin', 'Pending']
      ]
    },
    {
      name: SHEETS.CUSTOMERS,
      headers: ['ID', 'Name', 'Phone', 'Address'],
      defaultRows: [
        ['CUST-1', 'ហាងកាហ្វេ ជ័យជំនះ', '010 333 444', 'ទួលគោក'],
        ['CUST-2', 'អតិថិជនទូទៅ', 'N/A', 'ភ្នំពេញ']
      ]
    }
  ];

  sheetDefs.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setFontWeight('bold')
                 .setBackground('#0f172a')
                 .setFontColor('#ffffff');
      sheet.setFrozenRows(1);

      if (def.defaultRows && def.defaultRows.length > 0) {
        def.defaultRows.forEach(function(row) {
          sheet.appendRow(row);
        });
      }
    } else {
      if (def.name === SHEETS.USERS) {
        var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
        headerRange.setValues([def.headers])
                   .setFontWeight('bold')
                   .setBackground('#0f172a')
                   .setFontColor('#ffffff');
        
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          for (var r = 2; r <= lastRow; r++) {
            var rowVals = sheet.getRange(r, 1, 1, 10).getValues()[0];
            if (!rowVals[5]) sheet.getRange(r, 6).setValue('PRD-');
            if (!rowVals[6]) sheet.getRange(r, 7).setValue('PUR-');
            if (!rowVals[7]) sheet.getRange(r, 8).setValue('SAL-');
            if (!rowVals[8]) sheet.getRange(r, 9).setValue('BKG-');
          }
        }
      }
    }
  });

  return { success: true, message: 'កំណត់ទិន្នន័យ Google Sheets និងធ្វើបច្ចុប្បន្នភាពតារាង Users រួចរាល់!' };
}

/**
 * Returns all initial data from Sheets to Web App UI
 */
function getInitialData() {
  try {
    var ss = getSpreadsheet();
    setupDatabase();

    var products = getSheetDataAsJson(ss.getSheetByName(SHEETS.PRODUCTS), function(row) {
      return {
        code: String(row[0] || ''),
        name: String(row[1] || ''),
        category: String(row[2] || ''),
        cost: Number(row[3] || 0),
        price: Number(row[4] || 0),
        qty: Number(row[5] || 0),
        minAlert: Number(row[6] || 5),
        unit: String(row[7] || 'កញ្ចប់'),
        supplier: String(row[8] || 'ទូទៅ')
      };
    });

    var stockInLogs = getSheetDataAsJson(ss.getSheetByName(SHEETS.STOCK_IN), function(row) {
      return {
        id: String(row[0] || ''),
        date: formatDate(row[1]),
        code: String(row[2] || ''),
        name: String(row[3] || ''),
        supplier: String(row[4] || ''),
        qty: Number(row[5] || 0),
        cost: Number(row[6] || 0),
        total: Number(row[7] || 0),
        notes: String(row[8] || ''),
        unit: String(row[9] || 'កញ្ចប់')
      };
    });

    var stockOutLogs = getSheetDataAsJson(ss.getSheetByName(SHEETS.STOCK_OUT), function(row) {
      return {
        id: String(row[0] || ''),
        date: formatDate(row[1]),
        code: String(row[2] || ''),
        name: String(row[3] || ''),
        customer: String(row[4] || ''),
        qty: Number(row[5] || 0),
        price: Number(row[6] || 0),
        discount: Number(row[7] || 0),
        total: Number(row[8] || 0),
        unit: String(row[9] || 'កញ្ចប់'),
        serviceFee: Number(row[10] || 0),
        codFee: Number(row[11] || 0),
        paymentStatus: String(row[12] || 'Paid'),
        grandTotal: Number(row[13] || (Number(row[8] || 0) + Number(row[10] || 0) + Number(row[11] || 0)))
      };
    });

    var suppliers = getSheetDataAsJson(ss.getSheetByName(SHEETS.SUPPLIERS), function(row) {
      return {
        id: row[0],
        name: String(row[1] || ''),
        phone: String(row[2] || ''),
        address: String(row[3] || '')
      };
    });

    var customers = getSheetDataAsJson(ss.getSheetByName(SHEETS.CUSTOMERS), function(row) {
      return {
        id: row[0],
        name: String(row[1] || ''),
        phone: String(row[2] || ''),
        address: String(row[3] || '')
      };
    });

    var users = getSheetDataAsJson(ss.getSheetByName(SHEETS.USERS), function(row) {
      var allowed = [];
      if (row[9]) {
        try {
          var raw = String(row[9]).trim();
          allowed = raw.startsWith('[') ? JSON.parse(raw) : raw.split(',').map(function(s){return s.trim();}).filter(Boolean);
        } catch (e) {
          allowed = [];
        }
      }
      return {
        username: String(row[0] || ''),
        password: String(row[1] || ''),
        fullName: String(row[2] || ''),
        role: String(row[3] || 'Cashier'),
        status: String(row[4] || 'Active'),
        prefixProduct: String(row[5] || 'PRD-'),
        prefixStockIn: String(row[6] || 'PUR-'),
        prefixStockOut: String(row[7] || 'SAL-'),
        prefixBooking: String(row[8] || 'BKG-'),
        allowedPages: allowed
      };
    });

    var bookings = getSheetDataAsJson(ss.getSheetByName(SHEETS.BOOKINGS), function(row) {
      return {
        id: String(row[0] || ''),
        timestamp: String(row[1] || ''),
        invoiceNo: String(row[2] || ''),
        productCode: String(row[3] || ''),
        productName: String(row[4] || ''),
        customerName: String(row[5] || ''),
        depositAmount: Number(row[6] || 0),
        totalAmount: Number(row[7] || 0),
        notes: String(row[8] || ''),
        imageUrl: String(row[9] || ''),
        staffName: String(row[10] || ''),
        status: String(row[11] || 'Pending')
      };
    });

    return {
      success: true,
      data: {
        products: products,
        stockInLogs: stockInLogs,
        stockOutLogs: stockOutLogs,
        suppliers: suppliers,
        customers: customers,
        users: users,
        bookings: bookings
      }
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Save or Update Product
 */
function saveProduct(product) {
  try {
    if (!product || !product.code) return { success: false, message: 'Invalid product payload' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.PRODUCTS);
    if (!sheet) { setupDatabase(); sheet = getSpreadsheet().getSheetByName(SHEETS.PRODUCTS); }
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(product.code)) {
        foundIndex = i + 1;
        break;
      }
    }

    var rowValues = [
      product.code,
      product.name,
      product.category,
      product.cost,
      product.price,
      product.qty,
      product.minAlert,
      product.unit || 'កញ្ចប់',
      product.supplier || 'ទូទៅ'
    ];

    if (foundIndex > 0) {
      sheet.getRange(foundIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Delete Product
 */
function deleteProduct(payload) {
  try {
    if (!payload || !payload.code) return { success: false, message: 'Invalid code' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.PRODUCTS);
    if (!sheet) return { success: false, message: 'Products sheet not found' };
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(payload.code)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Add Stock In Record
 */
function addStockIn(log) {
  try {
    if (!log || !log.code) return { success: false, message: 'Invalid log' };
    var ss = getSpreadsheet();
    var inSheet = ss.getSheetByName(SHEETS.STOCK_IN);
    var prodSheet = ss.getSheetByName(SHEETS.PRODUCTS);
    if (!inSheet || !prodSheet) { setupDatabase(); inSheet = ss.getSheetByName(SHEETS.STOCK_IN); prodSheet = ss.getSheetByName(SHEETS.PRODUCTS); }

    inSheet.appendRow([
      log.id,
      log.date,
      log.code,
      log.name,
      log.supplier,
      log.qty,
      log.cost,
      log.total,
      log.notes,
      log.unit || 'កញ្ចប់'
    ]);

    updateProductQty(prodSheet, log.code, log.qty, true, log.cost);

    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Add Stock Out Record
 */
function addStockOut(log) {
  try {
    if (!log || !log.code) return { success: false, message: 'Invalid log' };
    var ss = getSpreadsheet();
    var outSheet = ss.getSheetByName(SHEETS.STOCK_OUT);
    var prodSheet = ss.getSheetByName(SHEETS.PRODUCTS);
    if (!outSheet || !prodSheet) { setupDatabase(); outSheet = ss.getSheetByName(SHEETS.STOCK_OUT); prodSheet = ss.getSheetByName(SHEETS.PRODUCTS); }

    outSheet.appendRow([
      log.id,
      log.date,
      log.code,
      log.name,
      log.customer,
      log.qty,
      log.price,
      log.discount,
      log.total,
      log.unit || 'កញ្ចប់',
      log.serviceFee || 0,
      log.codFee || 0,
      log.paymentStatus || 'Paid',
      log.grandTotal || log.total
    ]);

    updateProductQty(prodSheet, log.code, log.qty, false);

    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function updateStockOut(log) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.STOCK_OUT);
    if (!sheet) return { success: false, message: 'ពុំមាន Sheet StockOut' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(log.id)) {
        sheet.getRange(i + 1, 5).setValue(log.customer || '');
        sheet.getRange(i + 1, 6).setValue(log.qty || 0);
        sheet.getRange(i + 1, 7).setValue(log.price || 0);
        sheet.getRange(i + 1, 9).setValue(log.total || 0);
        if (log.unit) sheet.getRange(i + 1, 10).setValue(log.unit);
        return { success: true };
      }
    }
    return { success: false, message: 'ពុំរកឃើញទិន្នន័យនេះទេ' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function deleteStockOut(log) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.STOCK_OUT);
    if (!sheet) return { success: false, message: 'ពុំមាន Sheet StockOut' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(log.id)) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, message: 'ពុំរកឃើញកំណត់ត្រានេះទេ' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Save Supplier (Add or Update)
 */
function saveSupplier(supplier) {
  try {
    if (!supplier) return { success: false, message: 'Invalid supplier' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SUPPLIERS);
    if (!sheet) { setupDatabase(); sheet = getSpreadsheet().getSheetByName(SHEETS.SUPPLIERS); }
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(supplier.id) || (supplier.name && String(data[i][1]).trim() === String(supplier.name).trim())) {
        foundIndex = i + 1;
        break;
      }
    }

    var rowValues = [supplier.id || Date.now(), supplier.name || '', supplier.phone || '', supplier.address || '', supplier.username || ''];

    if (foundIndex > 0) {
      sheet.getRange(foundIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Delete Supplier
 */
function deleteSupplier(supplier) {
  try {
    if (!supplier) return { success: false, message: 'Invalid payload' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SUPPLIERS);
    if (!sheet) return { success: false, message: 'Suppliers sheet not found' };
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(supplier.id) || (supplier.name && String(data[i][1]).trim() === String(supplier.name).trim())) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Save Customer (Add or Update)
 */
function saveCustomer(customer) {
  try {
    if (!customer) return { success: false, message: 'Invalid customer' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.CUSTOMERS);
    if (!sheet) { setupDatabase(); sheet = getSpreadsheet().getSheetByName(SHEETS.CUSTOMERS); }
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(customer.id) || (customer.name && String(data[i][1]).trim() === String(customer.name).trim())) {
        foundIndex = i + 1;
        break;
      }
    }

    var rowValues = [customer.id || Date.now(), customer.name || '', customer.phone || '', customer.address || ''];

    if (foundIndex > 0) {
      sheet.getRange(foundIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Delete Customer
 */
function deleteCustomer(customer) {
  try {
    if (!customer) return { success: false, message: 'Invalid payload' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.CUSTOMERS);
    if (!sheet) return { success: false, message: 'Customers sheet not found' };
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(customer.id) || (customer.name && String(data[i][1]).trim() === String(customer.name).trim())) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// ---------------- Helper Functions ----------------

function updateProductQty(prodSheet, code, deltaQty, isAdd, newCostPrice) {
  var data = prodSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(code)) {
      var currentQty = Number(data[i][5] || 0);
      var newQty = isAdd ? (currentQty + deltaQty) : Math.max(0, currentQty - deltaQty);
      
      prodSheet.getRange(i + 1, 6).setValue(newQty);

      if (isAdd && newCostPrice && newCostPrice > 0) {
        prodSheet.getRange(i + 1, 4).setValue(newCostPrice);
      }
      break;
    }
  }
}

function getSheetDataAsJson(sheet, rowMapper) {
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(rowMapper);
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(val);
}

function saveUser(user) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.USERS);
    if (!sheet) return { success: false, message: 'ពុំមាន Sheet Users' };

    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === String(user.username).toLowerCase()) {
        foundIndex = i + 1;
        break;
      }
    }

    var allowedStr = '';
    if (user.allowedPages && Array.isArray(user.allowedPages)) {
      allowedStr = JSON.stringify(user.allowedPages);
    }

    var rowValues = [
      user.username,
      user.password,
      user.fullName,
      user.role || 'Cashier',
      user.status || 'Active',
      user.prefixProduct || 'PRD-',
      user.prefixStockIn || 'PUR-',
      user.prefixStockOut || 'SAL-',
      user.prefixBooking || 'BKG-',
      allowedStr
    ];

    if (foundIndex > 0) {
      sheet.getRange(foundIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return { success: true, message: 'បានធ្វើបច្ចុប្បន្នភាពគណនី ' + user.username + ' ក្នុង Google Sheets ជោគជ័យ' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function updateAllUsers(usersList) {
  try {
    var ss = getSpreadsheet();
    setupDatabase();
    var sheet = ss.getSheetByName(SHEETS.USERS);
    if (!sheet) return { success: false, message: 'ពុំមាន Sheet Users' };

    var list = (usersList && Array.isArray(usersList)) ? usersList : (usersList && usersList.users ? usersList.users : []);
    if (list.length > 0) {
      list.forEach(function(u) {
        saveUser(u);
      });
    }
    return { success: true, message: 'បានធ្វើបច្ចុប្បន្នភាពតារាង Users ទាំងអស់ក្នុង Google Sheets ជោគជ័យ!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function deleteUser(user) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.USERS);
    if (!sheet) return { success: false, message: 'ពុំមាន Sheet Users' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === String(user.username).toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, message: 'ពុំរកឃើញ User នេះទេ' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function addBooking(booking) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.BOOKINGS);
    if (!sheet) return { success: false, message: 'ពុំមាន Sheet Bookings' };

    var imagesStr = '';
    if (booking.images && Array.isArray(booking.images) && booking.images.length > 0) {
      imagesStr = JSON.stringify(booking.images);
    } else if (booking.imageUrl) {
      imagesStr = booking.imageUrl;
    }

    var rowValues = [
      booking.id || ('BKG-' + Math.floor(100000 + Math.random() * 900000)),
      booking.timestamp || formatDate(new Date()),
      booking.invoiceNo || '',
      booking.productCode || '',
      booking.productName || '',
      booking.customerName || '',
      booking.totalAmount || 0,
      booking.notes || '',
      imagesStr,
      booking.staffName || '',
      booking.status || 'Pending'
    ];

    sheet.appendRow(rowValues);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function updateBookingStatus(booking) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.BOOKINGS);
    if (!sheet) return { success: false, message: 'ពុំមាន Sheet Bookings' };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(booking.id)) {
        sheet.getRange(i + 1, 12).setValue(booking.status || 'Completed');
        return { success: true };
      }
    }
    return { success: false, message: 'ពុំរកឃើញ Booking នេះទេ' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Push/Sync all Local Data into Google Sheets
 */
function pushAllData(data) {
  try {
    if (!data) return { success: false, message: 'Invalid payload' };
    var ss = getSpreadsheet();
    setupDatabase();

    if (data.products && Array.isArray(data.products)) {
      data.products.forEach(function(p) { saveProduct(p); });
    }
    if (data.stockInLogs && Array.isArray(data.stockInLogs)) {
      data.stockInLogs.forEach(function(l) { saveStockInLogDirect(ss, l); });
    }
    if (data.stockOutLogs && Array.isArray(data.stockOutLogs)) {
      data.stockOutLogs.forEach(function(l) { saveStockOutLogDirect(ss, l); });
    }
    if (data.suppliers && Array.isArray(data.suppliers)) {
      data.suppliers.forEach(function(s) { saveSupplier(s); });
    }
    if (data.customers && Array.isArray(data.customers)) {
      data.customers.forEach(function(c) { saveCustomer(c); });
    }
    if (data.users && Array.isArray(data.users)) {
      data.users.forEach(function(u) { saveUser(u); });
    }
    if (data.bookings && Array.isArray(data.bookings)) {
      data.bookings.forEach(function(b) { addBookingDirect(ss, b); });
    }

    return { success: true, message: 'បានបញ្ជូនទិន្នន័យ Local ទាំងអស់ទៅ Google Sheets ជោគជ័យ!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveStockInLogDirect(ss, log) {
  if (!log || !log.id) return;
  var sheet = ss.getSheetByName(SHEETS.STOCK_IN);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(log.id)) {
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([
      log.id,
      log.date || '',
      log.code || '',
      log.name || '',
      log.supplier || '',
      log.qty || 0,
      log.cost || 0,
      log.total || 0,
      log.notes || '',
      log.unit || 'កញ្ចប់'
    ]);
  }
}

function saveStockOutLogDirect(ss, log) {
  if (!log || !log.id) return;
  var sheet = ss.getSheetByName(SHEETS.STOCK_OUT);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(log.id)) {
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([
      log.id,
      log.date || '',
      log.code || '',
      log.name || '',
      log.customer || '',
      log.qty || 0,
      log.price || 0,
      log.discount || 0,
      log.total || 0,
      log.unit || 'កញ្ចប់',
      log.serviceFee || 0,
      log.codFee || 0,
      log.paymentStatus || 'Paid',
      log.grandTotal || log.total || 0
    ]);
  }
}

function addBookingDirect(ss, booking) {
  if (!booking || !booking.id) return;
  var sheet = ss.getSheetByName(SHEETS.BOOKINGS);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(booking.id)) {
      found = true;
      break;
    }
  }
  if (!found) {
    var imagesStr = '';
    if (booking.images && Array.isArray(booking.images) && booking.images.length > 0) {
      imagesStr = JSON.stringify(booking.images);
    } else if (booking.imageUrl) {
      imagesStr = booking.imageUrl;
    }
    sheet.appendRow([
      booking.id,
      booking.timestamp || '',
      booking.invoiceNo || '',
      booking.productCode || '',
      booking.productName || '',
      booking.customerName || '',
      booking.depositAmount || 0,
      booking.totalAmount || 0,
      booking.notes || '',
      imagesStr,
      booking.staffName || '',
      booking.status || 'Pending'
    ]);
  }
}
