import * as esbuild from 'esbuild';
import { optimize } from 'svgo';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist');

console.log('🚀 Building Gmail Link Share extension...\n');

if (existsSync(distDir)) {
  console.log('🧹 Cleaning dist directory...');
  rmSync(distDir, { recursive: true, force: true });
}

mkdirSync(distDir, { recursive: true });
mkdirSync(join(distDir, 'logo'), { recursive: true });

console.log('📦 Minifying JavaScript files...');
const jsFiles = ['service-worker.js', 'content.js', 'popup.js', 'options.js', 'shared.js'];

for (const file of jsFiles) {
  await esbuild.build({
    entryPoints: [join(__dirname, file)],
    bundle: false,
    minify: true,
    target: 'es2020',
    outfile: join(distDir, file),
    legalComments: 'none',
  });
  console.log(`  ✓ ${file}`);
}

console.log('\n🎨 Minifying CSS files...');
const cssFiles = ['content.css', 'shared.css'];

for (const file of cssFiles) {
  await esbuild.build({
    entryPoints: [join(__dirname, file)],
    bundle: false,
    minify: true,
    outfile: join(distDir, file),
  });
  console.log(`  ✓ ${file}`);
}

console.log('\n🖼️  Optimizing SVG files...');
const svgFiles = readdirSync(join(__dirname, 'logo')).filter(f => f.endsWith('.svg'));

for (const file of svgFiles) {
  const svgPath = join(__dirname, 'logo', file);
  const svgContent = readFileSync(svgPath, 'utf8');
  
  const result = optimize(svgContent, {
    path: svgPath,
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            cleanupIds: false,
          },
        },
      },
      'removeDimensions',
      'removeComments',
      'removeMetadata',
    ],
  });
  
  writeFileSync(join(distDir, 'logo', file), result.data);
  
  const originalSize = Buffer.byteLength(svgContent, 'utf8');
  const optimizedSize = Buffer.byteLength(result.data, 'utf8');
  const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
  
  console.log(`  ✓ ${file} (${savings}% smaller)`);
}

console.log('\n📋 Copying PNG files...');
const pngFiles = readdirSync(join(__dirname, 'logo')).filter(f => f.endsWith('.png'));

for (const file of pngFiles) {
  copyFileSync(
    join(__dirname, 'logo', file),
    join(distDir, 'logo', file)
  );
  console.log(`  ✓ ${file}`);
}

console.log('\n📄 Copying HTML files...');
const htmlFiles = ['popup.html', 'options.html'];

for (const file of htmlFiles) {
  copyFileSync(join(__dirname, file), join(distDir, file));
  console.log(`  ✓ ${file}`);
}

console.log('\n📝 Copying manifest.json...');
const manifestContent = readFileSync(join(__dirname, 'manifest.json'), 'utf8');
const manifest = JSON.parse(manifestContent);

delete manifest.permissions[manifest.permissions.indexOf('scripting')];

writeFileSync(
  join(distDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('  ✓ manifest.json (removed scripting permission)');

console.log('\n📊 Build Statistics:');

function getDirectorySize(dirPath) {
  let size = 0;
  const files = readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = join(dirPath, file);
    const stats = statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

const sourceSize = getDirectorySize(__dirname) - (existsSync(join(__dirname, 'node_modules')) ? getDirectorySize(join(__dirname, 'node_modules')) : 0) - (existsSync(join(__dirname, '.git')) ? getDirectorySize(join(__dirname, '.git')) : 0) - (existsSync(join(__dirname, 'agents_context')) ? getDirectorySize(join(__dirname, 'agents_context')) : 0);
const distSize = getDirectorySize(distDir);
const savings = ((1 - distSize / sourceSize) * 100).toFixed(1);

console.log(`  Source size: ${(sourceSize / 1024).toFixed(1)} KB`);
console.log(`  Output size: ${(distSize / 1024).toFixed(1)} KB`);
console.log(`  Savings: ${savings}%`);

console.log('\n✅ Build complete! Output in dist/ directory');
console.log('💡 Run "npm run pack" to create a ZIP file for Chrome Web Store');
