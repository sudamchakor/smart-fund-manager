const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

// 1. Find the hashed CSS file in build/static/css/
const cssDir = path.join(buildDir, 'static', 'css');
let mainCssFile;

try {
  const files = fs.readdirSync(cssDir);
  mainCssFile = files.find((f) => f.startsWith('main.') && f.endsWith('.css'));
} catch (err) {
  console.error(
    '❌ Could not read CSS directory. Ensure "npm run build" finished.',
  );
  process.exit(1);
}

if (mainCssFile) {
  const cssPath = path.join(cssDir, mainCssFile);
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  let htmlContent = fs.readFileSync(indexPath, 'utf8');

  // 2. REGEX to find and remove ANY link tags referencing main.css (hashed or unhashed)
  // This covers <link rel="stylesheet"> and <link rel="preload"> patterns
  const linkRegex = /<link[^>]*href=[^>]*main(?:\.[a-z0-9]+)?\.css[^>]*>/g;
  htmlContent = htmlContent.replace(linkRegex, '');

  // 3. Prepare the Style Block and Preconnect hints
  const preconnectHints = `
    <link rel="preconnect" href="https://smartfund-manager.firebaseapp.com">
    <link rel="preconnect" href="https://apis.google.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <style>${cssContent}</style>`;

  // 4. Inject into the <head> (right before the closing </head> tag)
  htmlContent = htmlContent.replace('</head>', `${preconnectHints}</head>`);

  // 5. Clean up extra whitespace/empty lines left by the regex
  htmlContent = htmlContent.replace(/^\s*[\r\n]/gm, '');

  fs.writeFileSync(indexPath, htmlContent);
  console.log(
    `✅ SUCCESS: Inlined ${mainCssFile} and injected Preconnect hints.`,
  );
} else {
  console.error(
    '❌ ERROR: Could not find a main.[hash].css file in build/static/css/',
  );
}
