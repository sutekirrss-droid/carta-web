const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'image-cache');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Extract all loveat plate IDs from menu-store.json, initialMenu.ts, and photoGallery.ts
const filesToCheck = [
  path.join(__dirname, '..', 'data', 'menu-store.json'),
  path.join(__dirname, '..', 'src', 'data', 'initialMenu.ts'),
  path.join(__dirname, '..', 'src', 'data', 'photoGallery.ts')
];

const plateIds = new Set();

for (const file of filesToCheck) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    const regex = /images\.loveat\.la\/media\/2510\/images\/plates\/(\d+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      plateIds.add(match[1]);
    }
  }
}

console.log(`Found ${plateIds.size} unique plate IDs to cache...`);

async function downloadPlate(id) {
  const destPath = path.join(targetDir, `${id}.jpg`);
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return { id, status: 'cached' };
  }

  try {
    const url = `https://images.loveat.la/media/2510/images/plates/${id}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return { id, status: `failed: HTTP ${res.status}` };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 500) {
      fs.writeFileSync(destPath, buffer);
      return { id, status: 'downloaded', size: buffer.length };
    } else {
      return { id, status: 'too small' };
    }
  } catch (err) {
    return { id, status: `error: ${err.message}` };
  }
}

async function main() {
  const ids = Array.from(plateIds);
  const concurrency = 6;
  let downloadedCount = 0;
  let cachedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(downloadPlate));
    for (const r of results) {
      if (r.status === 'cached') cachedCount++;
      else if (r.status === 'downloaded') downloadedCount++;
      else {
        console.warn(`Plate ${r.id}: ${r.status}`);
        failedCount++;
      }
    }
    process.stdout.write(`\rProgress: ${Math.min(i + concurrency, ids.length)}/${ids.length}`);
  }

  console.log(`\nFinished caching! Cached: ${cachedCount}, Downloaded: ${downloadedCount}, Failed: ${failedCount}`);
}

main();
