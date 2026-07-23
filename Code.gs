/**
 * ============================================================================
 * Google Apps Script Backend Code for Khmer Stock Management System
 * Attach this file to your Google Sheets Apps Script Project (script.google.com)
 * ============================================================================
 */

// Global Sheet Names Constants
const SHEETS = {
  PRODUCTS: 'Products',
  STOCK_IN: 'StockIn',
  STOCK_OUT: 'StockOut',
  SUPPLIERS: 'Suppliers',
  CUSTOMERS: 'Customers'
};

// Optional: Enter your Google Sheet ID if using Standalone Script on script.google.com
// Leave blank if script is opened directly inside Google Sheet (Extensions > Apps Script)
const SPREADSHEET_ID = '';

/**
 * Gets the active or specified Spreadsheet safely
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
 * Serves the Web App UI or handles GET API requests
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
      contents = JSON.parse(e.postData.contents);
    }
    var action = (e && e.parameter && e.parameter.action) || contents.action;
    var payload = contents.data || contents;
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
    } else if (action === 'saveCustomer') {
      result = saveCustomer(payload);
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Serves the HTML Web App UI with automatic file detection & error fallback
 */
function renderWebApp() {
  var htmlOutput;
  try {
    // Try modular template evaluation first (index or index_gas with <?!= include('styles'); ?> and <?!= include('app'); ?>)
    htmlOutput = HtmlService.createTemplateFromFile('index').evaluate();
  } catch (e1) {
    try {
      htmlOutput = HtmlService.createTemplateFromFile('index_gas').evaluate();
    } catch (e2) {
      try {
        htmlOutput = HtmlService.createHtmlOutputFromFile('index');
      } catch (e3) {
        try {
          htmlOutput = HtmlService.createHtmlOutputFromFile('gas_bundle');
        } catch (e4) {
          htmlOutput = HtmlService.createHtmlOutput(
            '<div style="font-family: sans-serif; padding: 30px; text-align: center; line-height: 1.6;">' +
            '<h2 style="color: #e11d48;">⚠️ រកមិនឃើញឯកសារ HTML ក្នុង Apps Script ទេ!</h2>' +
            '<p>សូមបង្កើតឯកសារ HTML ក្នុង Apps Script (Files +):<br>' +
            '១. <b>index</b> (Copy ពី index_gas.html)<br>' +
            '២. <b>styles</b> (Copy ពី styles.html)<br>' +
            '៣. <b>app</b> (Copy ពី app.html)</p>' +
            '</div>'
          );
        }
      }
    }
  }

  return htmlOutput
    .setTitle('ប្រព័ន្ធគ្រប់គ្រងស្តុក - Inventory Management')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper to include sub-HTML files (if modularized)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Initializes Google Sheet Database with required Tabs, Headers & Sample Data
 */
function setupDatabase() {
  var ss = getSpreadsheet();
  
  // Sheet definitions with headers & initial rows
  var sheetDefs = [
    {
      name: SHEETS.PRODUCTS,
      headers: ['Code', 'Name', 'Category', 'CostPrice', 'SalePrice', 'Quantity', 'MinAlert'],
      defaultRows: [
        ['PRD-001', 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', 'ភេសជ្ជៈ', 12.50, 18.00, 25, 10],
        ['PRD-002', 'ទឹកដោះគោឆៅ (Fresh Milk 1L)', 'ភេសជ្ជៈ', 1.80, 2.50, 4, 10],
        ['PRD-003', 'ស្ករស (White Sugar 1kg)', 'គ្រឿងទេស', 0.90, 1.30, 50, 15],
        ['PRD-004', 'កែវក្រដាស 16oz (Paper Cups 50pcs)', 'សម្ភារៈ', 2.20, 3.50, 0, 5],
        ['PRD-005', 'តែបៃតងជប៉ុន (Matcha Green Tea 500g)', 'ភេសជ្ជៈ', 15.00, 22.00, 8, 5],
        ['PRD-006', 'ស៊ីរ៉ូរសជាតិវ៉ានីឡា (Vanilla Syrup 750ml)', 'គ្រឿងទេស', 6.50, 9.50, 3, 5]
      ]
    },
    {
      name: SHEETS.STOCK_IN,
      headers: ['ID', 'Date', 'ProductCode', 'ProductName', 'Supplier', 'Quantity', 'CostPrice', 'TotalCost', 'Notes'],
      defaultRows: [
        ['IN-1001', '2026-07-15', 'PRD-001', 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', 20, 12.50, 250.00, 'ទិញចូលស្តុកដើមខែ'],
        ['IN-1002', '2026-07-18', 'PRD-003', 'ស្ករស (White Sugar 1kg)', 'ផ្សារអូរឫស្សី', 30, 0.90, 27.00, 'ថែមស្តុក']
      ]
    },
    {
      name: SHEETS.STOCK_OUT,
      headers: ['ID', 'Date', 'ProductCode', 'ProductName', 'Customer', 'Quantity', 'SalePrice', 'Discount', 'TotalAmount'],
      defaultRows: [
        ['OUT-2001', '2026-07-19', 'PRD-001', 'កាហ្វេអាល់ប៊ីកា (Arabica Coffee Beans 1kg)', 'ហាងកាហ្វេ ជ័យជំនះ', 5, 18.00, 0, 90.00],
        ['OUT-2002', '2026-07-20', 'PRD-005', 'តែបៃតងជប៉ុន (Matcha Green Tea 500g)', 'អតិថិជនទូទៅ', 2, 22.00, 2.00, 42.00]
      ]
    },
    {
      name: SHEETS.SUPPLIERS,
      headers: ['ID', 'Name', 'Phone', 'Address'],
      defaultRows: [
        ['SUP-1', 'ក្រុមហ៊ុន ភ្នំពេញ កាហ្វេ', '012 888 999', 'រាជធានីភ្នំពេញ'],
        ['SUP-2', 'ផ្សារអូរឫស្សី ស្តង់A12', '097 777 666', 'ខណ្ឌ៧មករា ភ្នំពេញ']
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
    
    // Check if header exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      
      // Format header style
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
    }
  });

  return { success: true, message: 'បានកំណត់ទម្រង់ និងទិន្នន័យ Google Sheets រួចរាល់!' };
}

/**
 * Returns all initial data from Sheets to Web App UI
 */
function getInitialData() {
  try {
    var ss = getSpreadsheet();
    setupDatabase(); // Ensure sheets exist & sample data populated if empty

    var products = getSheetDataAsJson(ss.getSheetByName(SHEETS.PRODUCTS), function(row) {
      return {
        code: String(row[0] || ''),
        name: String(row[1] || ''),
        category: String(row[2] || ''),
        cost: Number(row[3] || 0),
        price: Number(row[4] || 0),
        qty: Number(row[5] || 0),
        minAlert: Number(row[6] || 5)
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
        notes: String(row[8] || '')
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
        total: Number(row[8] || 0)
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

    return {
      success: true,
      data: {
        products: products,
        stockInLogs: stockInLogs,
        stockOutLogs: stockOutLogs,
        suppliers: suppliers,
        customers: customers
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
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(product.code)) {
        foundIndex = i + 1; // 1-indexed row number
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
      product.minAlert
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
 * Add Stock In Record & Update Product Quantity
 */
function addStockIn(log) {
  try {
    if (!log || !log.code) return { success: false, message: 'Invalid log' };
    var ss = getSpreadsheet();
    var inSheet = ss.getSheetByName(SHEETS.STOCK_IN);
    var prodSheet = ss.getSheetByName(SHEETS.PRODUCTS);

    // Append to StockIn log
    inSheet.appendRow([
      log.id,
      log.date,
      log.code,
      log.name,
      log.supplier,
      log.qty,
      log.cost,
      log.total,
      log.notes
    ]);

    // Update Product stock
    updateProductQty(prodSheet, log.code, log.qty, true, log.cost);

    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Add Stock Out Record & Deduct Product Quantity
 */
function addStockOut(log) {
  try {
    if (!log || !log.code) return { success: false, message: 'Invalid log' };
    var ss = getSpreadsheet();
    var outSheet = ss.getSheetByName(SHEETS.STOCK_OUT);
    var prodSheet = ss.getSheetByName(SHEETS.PRODUCTS);

    // Append to StockOut log
    outSheet.appendRow([
      log.id,
      log.date,
      log.code,
      log.name,
      log.customer,
      log.qty,
      log.price,
      log.discount,
      log.total
    ]);

    // Deduct Product stock
    updateProductQty(prodSheet, log.code, log.qty, false);

    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Save Supplier
 */
function saveSupplier(supplier) {
  try {
    if (!supplier) return { success: false, message: 'Invalid supplier' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SUPPLIERS);
    sheet.appendRow([supplier.id, supplier.name, supplier.phone, supplier.address]);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Save Customer
 */
function saveCustomer(customer) {
  try {
    if (!customer) return { success: false, message: 'Invalid customer' };
    var sheet = getSpreadsheet().getSheetByName(SHEETS.CUSTOMERS);
    sheet.appendRow([customer.id, customer.name, customer.phone, customer.address]);
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
      
      prodSheet.getRange(i + 1, 6).setValue(newQty); // 6th column is Quantity

      if (isAdd && newCostPrice && newCostPrice > 0) {
        prodSheet.getRange(i + 1, 4).setValue(newCostPrice); // Update cost price
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
