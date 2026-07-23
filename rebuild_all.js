const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlPath = path.join(dir, 'index.html');
const cssPath = path.join(dir, 'styles.css');
const jsPath = path.join(dir, 'app.js');

console.log('Rebuilding all GAS files...');
let html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// 1. gas_bundle.html
let bundle = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']styles\.css(?:\?[^"']*)?["']\s*\/?>/i, () => `<style>\n${css}\n</style>`);
bundle = bundle.replace(/<script\s+src=["']app\.js(?:\?[^"']*)?["']><\/script>/i, () => `<script>\n${js}\n</script>`);
fs.writeFileSync(path.join(dir, 'gas_bundle.html'), bundle, 'utf8');

// 2. styles.html
fs.writeFileSync(path.join(dir, 'styles.html'), `<style>\n${css}\n</style>`, 'utf8');

// 3. app.html
fs.writeFileSync(path.join(dir, 'app.html'), `<script>\n${js}\n</script>`, 'utf8');

// 4. index_gas.html
let indexGas = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']styles\.css(?:\?[^"']*)?["']\s*\/?>/i, () => `<?!= include('styles'); ?>`);
indexGas = indexGas.replace(/<script\s+src=["']app\.js(?:\?[^"']*)?["']><\/script>/i, () => `<?!= include('app'); ?>`);
fs.writeFileSync(path.join(dir, 'index_gas.html'), indexGas, 'utf8');

console.log('All GAS files rebuilt successfully!');
