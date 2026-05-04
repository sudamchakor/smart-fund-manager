const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

// 1. Find the CSS file in build/static/css/
const cssDir = path.join(buildDir, 'static', 'css');
const files = fs.readdirSync(cssDir);
const mainCssFile = files.find(
  (f) => f.startsWith('main.') && f.endsWith('.css'),
);

if (mainCssFile) {
  const cssPath = path.join(cssDir, mainCssFile);
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  let htmlContent = fs.readFileSync(indexPath, 'utf8');

  // 2. Remove the existing link tag for this CSS file
  // CRA usually formats it as <link href="/static/css/main.xxxx.css" rel="stylesheet">
  const linkTagRegex = new RegExp(
    `<link[^>]*href="[^"]*${mainCssFile}"[^>]*>`,
    'g',
  );

  // 3. Inject the style block instead
  const styleBlock = `<style>${cssContent}</style>`;
  htmlContent = htmlContent.replace(linkTagRegex, styleBlock);

  fs.writeFileSync(indexPath, htmlContent);
  console.log(`✅ Inlined ${mainCssFile} into index.html`);
} else {
  console.error('❌ Could not find main CSS file.');
}
