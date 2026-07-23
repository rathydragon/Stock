# ការណែនាំអំពីការដំឡើង និងការភ្ជាប់ប្រព័ន្ធគ្រប់គ្រងស្តុកជាមួយ Google Sheets

របៀបដំឡើង និងប្រកាសប្រើប្រាស់ (Deploy) កម្មវិធីគ្រប់គ្រងស្តុកជាមួយ Google Apps Script & Google Sheets ជាភាសាខ្មែរជំហានៗ៖

> 💡 **ដំណោះស្រាយបំបែកកូដ (Clean Modularization) សម្រាប់ Google Apps Script៖**  
> លោកអ្នកអាចបំបែកកូដជា ៣ ឯកសារស្អាតៗក្នុង Apps Script ៖  
> 1. **`index`** (ចម្លងពី `index_gas.html`)  
> 2. **`styles`** (ចម្លងពី `styles.html`)  
> 3. **`app`** (ចម្លងពី `app.html`)

---

## ជំហានទី ១: បង្កើត Google Sheet ថ្មី

1. ចូលទៅកាន់ [Google Sheets](https://sheets.google.com) រួចបង្កើតសន្លឹកកិច្ចការថ្មី (Blank Spreadsheet)។
2. ដាក់ឈ្មោះ Google Sheet របស់អ្នក ឧទាហរណ៍៖ **`ប្រព័ន្ធគ្រប់គ្រងស្តុក - Stock System`**។

---

## ជំហានទី ២: បើក Google Apps Script Editor

1. នៅក្នុង Google Sheets ចុចលើ Menu **`Extensions`** (ផ្នែកបន្ថែម) -> **`Apps Script`**។
2. ផ្ទាំង Apps Script Editor នឹងបង្ហាញឡើង។

---

## ជំហានទី ៣: បញ្ចូល Code ទៅកាន់ Apps Script (បំបែក ៤ ឯកសារ)

### ១. កូដ Backend (`Code.gs`)
- លុបកូដចាស់ៗដែលមានក្នុងឯកសារ `Code.gs` ចោល។
- ចម្លងកូដទាំងស្រុងពីឯកសារ [`Code.gs`](file:///c:/Users/ASUS/OneDrive/Desktop/system/Code.gs) មកបិទភ្ជាប់ (Paste) ក្នុង `Code.gs`។

### ២. ឯកសារ HTML `index`
- នៅផ្នែកខាងឆ្វេង (Files) ចុច **`+`** -> ជ្រើសរើស **`HTML`** ➔ ដាក់ឈ្មោះថា **`index`**
- ចម្លងកូដទាំងស្រុងពីឯកសារ [`index_gas.html`](file:///c:/Users/ASUS/OneDrive/Desktop/system/index_gas.html) មក Paste។

### ៣. ឯកសារ HTML `styles`
- ចុច **`+`** -> ជ្រើសរើស **`HTML`** ➔ ដាក់ឈ្មោះថា **`styles`**
- ចម្លងកូដទាំងស្រុងពីឯកសារ [`styles.html`](file:///c:/Users/ASUS/OneDrive/Desktop/system/styles.html) មក Paste។

### ៤. ឯកសារ HTML `app`
- ចុច **`+`** -> ជ្រើសរើស **`HTML`** ➔ ដាក់ឈ្មោះថា **`app`**
- ចម្លងកូដទាំងស្រុងពីឯកសារ [`app.html`](file:///c:/Users/ASUS/OneDrive/Desktop/system/app.html) មក Paste។

---

## ជំហានទី ៤: រៀបចំ Database ក្នុង Google Sheets (Automatic Setup)

1. នៅផ្នែកខាងលើនៃ Apps Script Editor ត្រង់កន្លែងជ្រើសរើស Function សូមជ្រើសរើសអនុគមន៍ **`setupDatabase`**។
2. ចុចប៊ូតុង **`Run`** (រត់)។
3. លើកដំបូង Google នឹងសុំ Permission autorización ៖
   - ចុច **Review permissions**
   - ជ្រើសរើស Gmail Account របស់អ្នក
   - ចុច **Advanced** -> ចុច **Go to Inventory Management (unsafe)**
   - ចុច **Allow** (អនុញ្ញាត)
4. ត្រឡប់មកមើល Google Sheets របស់អ្នក នោះអ្នកនឹងឃើញ Sheet ចំនួន ៥ ត្រូវបានបង្កើតស្វ័យប្រវត្តិ៖
   - `Products` (បញ្ជីទំនិញ)
   - `StockIn` (ប្រវត្តិទិញចូល)
   - `StockOut` (ប្រវត្តិលក់ចេញ)
   - `Suppliers` (អ្នកផ្គត់ផ្គង់)
   - `Customers` (អតិថិជន)

---

## ជំហានទី ៥: ប្រកាសប្រើប្រាស់ (Deploy Web App)

1. នៅជ្រុងខាងស្តាំលើនៃ Apps Script Editor ចុចប៊ូតុង **`Deploy`** -> ជ្រើសរើស **`New deployment`**។
2. ចុចលើរូបកង់ប្រអប់លេខ (Select type) -> ជ្រើសរើស **`Web app`**។
3. កំណត់ដូចខាងក្រោម៖
   - **Description**: `Stock Management System v1.0`
   - **Execute as**: `Me (អាសយដ្ឋាន Gmail របស់អ្នក)`
   - **Who has access**: `Anyone` (អ្នកដែលមាន Link អាចប្រើប្រាស់បាន)
4. ចុចប៊ូតុង **`Deploy`**។
5. ផ្ទាំងជោគជ័យនឹងបង្ហាញឡើង រួចផ្តល់ជូន **`Web app URL`** (តំណភ្ជាប់កម្មវិធី)។
6. ចម្លង URL នោះទៅបើកក្នុង Web Browser (Chrome, Edge, Safari ឬលើទូរស័ព្ទដៃ/Tablet) ជាការស្រេច!

---

## 🛠️ ការដោះស្រាយបញ្ហា ( Troubleshooting ពេល "មិនដំណើរការ" )

ប្រសិនបើលោកអ្នកប្រកាសប្រើប្រាស់ (Deploy) ហើយជួបបញ្ហា **មិនដំណើរការ ឬចេញ Error** សូមពិនិត្យ ៣ ចំណុចសំខាន់ៗនេះ៖

1. **តើលោកអ្នកបើក Apps Script តាមរបៀបណា?**
   - **របៀបត្រឹមត្រូវ (ណែនាំ)**៖ ត្រូវចូលទៅកាន់ Google Sheet របស់អ្នក រួចចុច **`Extensions` (ផ្នែកបន្ថែម) -> `Apps Script`**។
   - *ចំណាំ*៖ ប្រសិនបើអ្នកបង្កើតនៅលើ [script.google.com](https://script.google.com) ដោយផ្ទាល់ (Standalone Script) អ្នកត្រូវចម្លង ID របស់ Google Sheet មកដាក់ក្នុង `const SPREADSHEET_ID = '...'` នៃឯកសារ `Code.gs`។

2. **តើបានរត់ `setupDatabase` រួចហើយឬនៅ?**
   - នៅលើ Apps Script Editor ផ្នែកខាងលើ ត្រង់ប្រអប់ជ្រើសរើស Function សូមជ្រើសរើស **`setupDatabase`** រួចចុចប៊ូតុង **`Run`** ព្រមទាំងចុច **Review Permissions -> Advanced -> Allow** ឲ្យបានជោគជ័យ។

3. **តើបានប្រើប្រាស់កូដចុងក្រោយក្នុង `gas_bundle.html` ឬនៅ?**
   - សូមចម្លងកូដ [`Code.gs`](file:///c:/Users/ASUS/OneDrive/Desktop/system/Code.gs) ថ្មីចុងក្រោយទៅបិទភ្ជាប់ក្នុង `Code.gs`។
   - ក្នុងឯកសារ HTML ឈ្មោះ `index` ក្នុង Apps Script ត្រូវចម្លងកូដទាំងស្រុងពី [`gas_bundle.html`](file:///c:/Users/ASUS/OneDrive/Desktop/system/gas_bundle.html) មកបិទភ្ជាប់។

---

## 💡 គន្លឹះបន្ថែម (Tips & Local Testing)

- **សាកល្បងផ្ទាល់លើកុំព្យូទ័រ (Local Preview)**: អ្នកអាចចុច double-click បើកឯកសារ [`index.html`](file:///c:/Users/ASUS/OneDrive/Desktop/system/index.html) ក្នុង folder នេះដើម្បីមើលរូបរាង UI និងសាកល្បង Add/Edit ស្តុកជាមួយ Local Data ភ្លាមៗដោយពុំបាច់តភ្ជាប់ Internet ក៏បាន!

