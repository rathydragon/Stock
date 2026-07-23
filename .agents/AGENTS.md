# Workspace UI & Design System Guidelines

## Core UI Design Specifications (User Approved Pattern)

### 1. Button Design System
- **Shape & Corners**: All standard buttons must use modern rounded rectangle style (`border-radius: 12px !important; height: 38px !important;`). Small action buttons use `border-radius: 8px !important; height: 28px !important;`.
- **Primary CTA Button (`.btn-primary`)**:
  - Background: Solid Electric Royal Blue (`#1862f6`)
  - Text: White (`#ffffff`), font-weight 600
  - Shadow: Soft blue glow (`box-shadow: 0 4px 14px rgba(24, 98, 246, 0.3)`)
- **Secondary / Export Buttons (`.btn-outline`)**:
  - Background: Pure White (`#ffffff`)
  - Border: Soft gray outline (`1px solid #cbd5e1`)
  - Text: Dark slate (`#334155`), font-weight 600

### 2. Form Inputs & Filter Dropdowns
- **Form Controls (`.form-control`, `.form-select`, `.search-input`, `.filter-select`)**:
  - `border-radius: 12px !important; height: 38px !important;`
  - Border: Soft gray (`1px solid #cbd5e1`), focus ring in `#1862f6`.

### 3. Products Page Toolbar Architecture
- **Header Row**:
  - Left: Title `ទំនិញ/ផលិតផល` + Subtitle `គ្រប់គ្រង និងស្វែងរកទំនិញក្នុងស្តុករបស់អ្នក (X ទំនិញ)`
  - Right: Actions `[ 📥 នាំចេញ Excel ]` `[ 🖨️ នាំចេញ PDF (បោះពុម្ព) ]` `[ + បន្ថែមថ្មី ]`
- **Filter Toolbar Card**:
  - Search input on left (`🔍 ស្វែងរកតាម កូដទំនិញ, ឈ្មោះ ឬ ប្រភេទ...`)
  - Category & status dropdowns on right (`[ គ្រប់ប្រភេទទំនិញ 🔻 ]`, `[ គ្រប់ស្ថានភាព 🔻 ]`)
- **Data Table Headers (10 Columns)**:
  `NO` | `កូដទំនិញ/បាកូដ` | `ឈ្មោះទំនិញ` | `ប្រភេទទំនិញ` | `ឯកតា` | `តម្លៃដើម` | `តម្លៃលក់` | `ស្តុកអប្បបរមា` | `ស្ថានភាព` | `សកម្មភាព`

### 4. Reports Section Layout
- Single horizontal row for date range filters (`ចាប់ពីថ្ងៃ`, `ដល់ថ្ងៃ`), transaction type select, and action buttons.
- Table headers aligned 1-to-1 with data cells (8 Columns).

### 5. Asset Cache Busting Rule
- Always increment static asset version query parameters in `index.html` (e.g., `styles.css?v=X.0`, `app.js?v=X.0`) whenever modifying CSS or JavaScript.

### 6. Google Apps Script (GAS) HTML Service Rules
- **HTML File Syntax**: Any sub-file included via `<?!= include('filename'); ?>` MUST be valid HTML:
  - `styles.html` MUST start with `<style>` and end with `</style>`.
  - `app.html` MUST start with `<script>` and end with `</script>`.
- **Scriptlet Inclusions**: In `index_gas.html`, place `<?!= include('styles'); ?>` inside `<head>` and `<?!= include('app'); ?>` before `</body>`. Do not wrap the scriptlet calls in outer `<style>` or `<script>` tags if the sub-files already include them.

### 7. Responsive Mobile & iPad Table-to-Card Layout Rule
- On Mobile Phones and iPad/Tablet viewports (`@media (max-width: 992px)`), ALL data tables (`.table`) MUST automatically convert into clean, touch-friendly **stacked Floating Card items** (`border-radius: 18px; box-shadow: var(--shadow-md)`).
- Table headers are hidden, and each cell displays with `data-label="..."` on the left and the value aligned on the right.
