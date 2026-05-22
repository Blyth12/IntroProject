const fs = require('fs');
const path = require('path');

// --- Paths Configuration ---
const projectDir = __dirname;
const distDir = path.join(projectDir, 'dist');
const htmlPath = path.join(projectDir, 'index.html');
const cssPath = path.join(projectDir, 'style.css');
const snapshotPath = path.join(projectDir, 'data', 'snapshot.json');
const appPath = path.join(projectDir, 'app.js');
const timelinePath = path.join(projectDir, 'timeline.js');
const outputPath = path.join(distDir, 'standalone.html');

console.log('🚀 Starting standalone HTML compiler...');

try {
  // Ensure output directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist directory.');
  }

  // 1. Read files
  console.log('📖 Reading source files...');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  
  // Fallback to data.js if snapshot.json hasn't been generated yet
  let snapshotJson;
  if (fs.existsSync(snapshotPath)) {
    snapshotJson = fs.readFileSync(snapshotPath, 'utf8');
  } else {
    console.warn('⚠️ No snapshot.json found! Generating a mock fallback from data.js...');
    const rawData = fs.readFileSync(path.join(projectDir, 'data.js'), 'utf8');
    const mockData = rawData.replace('export const PROMO_DATA = ', '');
    snapshotJson = mockData.replace(/;\s*$/, ''); // Remove trailing semicolon
  }
  
  const appJs = fs.readFileSync(appPath, 'utf8');
  const timelineJs = fs.readFileSync(timelinePath, 'utf8');

  // 2. Process JavaScript code
  console.log('⚙️ Processing and combining JavaScript modules...');
  
  // Strip "import { PROMO_DATA } from './data.js';" from appJs and timelineJs
  let processedApp = appJs.replace(/import\s+\{\s*PROMO_DATA\s*\}\s*from\s*['"]\.\/data\.js['"];?/g, '// [Inlined data.js]');
  let processedTimeline = timelineJs.replace(/import\s+\{\s*PROMO_DATA\s*\}\s*from\s*['"]\.\/data\.js['"];?/g, '// [Inlined data.js]');

  // 3. Inline CSS into HTML
  console.log('🎨 Inlining CSS styles...');
  const cssTag = `<style>\n${css}\n</style>`;
  html = html.replace(/<link\s+rel="stylesheet"\s+href="style\.css"\s*\/?>/g, cssTag);

  // 4. Inline JavaScript scripts as separate classic script tags wrapped in IIFE closures
  console.log('📦 Inlining JavaScript scripts with IIFE closures...');
  const dataTag = `<script>\nwindow.PROMO_DATA = ${snapshotJson};\n</script>`;
  const appTag = `<script>\n(function(){\nconst PROMO_DATA = window.PROMO_DATA;\n${processedApp}\n})();\n</script>`;
  const timelineTag = `<script>\n(function(){\nconst PROMO_DATA = window.PROMO_DATA;\n${processedTimeline}\n})();\n</script>`;

  // Replace script source links in HTML with the inlined modules
  html = html.replace(/<script\s+type="module"\s+src="app\.js"\s*><\/script>/g, `${dataTag}\n${appTag}`);
  html = html.replace(/<script\s+type="module"\s+src="timeline\.js"\s*><\/script>/g, timelineTag);

  // 5. Save compiled single-file HTML
  console.log('💾 Writing standalone HTML...');
  fs.writeFileSync(outputPath, html, 'utf8');
  
  // Size validation
  const stats = fs.statSync(outputPath);
  const sizeKb = (stats.size / 1024).toFixed(2);
  console.log(`✅ Compilation successful! Created [dist/standalone.html] (${sizeKb} KB)`);
  
} catch (error) {
  console.error('❌ Compilation failed:', error);
  process.exit(1);
}
