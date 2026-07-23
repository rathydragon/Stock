const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace stockOutTableBody thead
const oldStockOutThead = `<th>DATE</th>
                                            <th>លេខវិក្កយបត្រ</th>
                                            <th>កូដទំនិញ/បាកូដ</th>
                                            <th>ឈ្មោះទំនិញ</th>
                                            <th class="text-center">ចំនួន</th>
                                            <th class="text-end">តម្លៃលក់</th>
                                            <th class="text-end">TOTAL</th>
                                            <th>អតិថិជន</th>`;

const newStockOutThead = `<th>DATE</th>
                                            <th>លេខវិក្កយបត្រ</th>
                                            <th>កូដទំនិញ</th>
                                            <th>ឈ្មោះទំនិញ</th>
                                            <th class="text-center">ចំនួន</th>
                                            <th class="text-end">តម្លៃលក់</th>
                                            <th class="text-end">TOTAL</th>
                                            <th>អតិថិជន</th>
                                            <th class="text-center">សកម្មភាព</th>`;

if (html.includes(oldStockOutThead)) {
    html = html.replace(oldStockOutThead, newStockOutThead);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Successfully updated Stock Out header in index.html');
} else {
    console.log('Could not find oldStockOutThead in index.html');
}
