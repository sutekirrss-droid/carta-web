import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MENU_ITEMS, DEFAULT_RESTAURANT_CONFIG } from './src/data/initialMenu.ts';
import { MenuItem, RestaurantConfig } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistence directory and file
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'menu-store.json');
const IMAGE_CACHE_DIR = path.join(DATA_DIR, 'image-cache');
const HERO_VIDEO_FILE = path.join(DATA_DIR, 'hero-video.mp4');

if (!fs.existsSync(IMAGE_CACHE_DIR)) {
  fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
}

// In-memory state with persistence
let menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
let restaurantConfig: RestaurantConfig = { ...DEFAULT_RESTAURANT_CONFIG };
let lastUpdated = Date.now();

// Load persisted data if exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.items) && parsed.items.length > 0) {
      const initialMap = new Map(INITIAL_MENU_ITEMS.map((i) => [i.id, i]));
      menuItems = parsed.items.map((item: any) => {
        const init = initialMap.get(item.id);
        if (!item.pairing && init?.pairing) {
          return { ...item, pairing: init.pairing };
        }
        return item;
      });
    }
    if (parsed.config) {
      restaurantConfig = {
        ...DEFAULT_RESTAURANT_CONFIG,
        ...parsed.config,
        ambienceImageUrl: parsed.config.ambienceImageUrl || DEFAULT_RESTAURANT_CONFIG.ambienceImageUrl,
        showAmbienceHero: parsed.config.showAmbienceHero !== undefined ? parsed.config.showAmbienceHero : true,
        customCategories: parsed.config.customCategories || DEFAULT_RESTAURANT_CONFIG.customCategories || [],
        customTags: parsed.config.customTags || DEFAULT_RESTAURANT_CONFIG.customTags || [],
        backgroundPattern: parsed.config.backgroundPattern || 'aletas',
        backgroundPatternOpacity: parsed.config.backgroundPatternOpacity !== undefined ? parsed.config.backgroundPatternOpacity : 0.25,
        adminPin: parsed.config.adminPin || DEFAULT_RESTAURANT_CONFIG.adminPin || '2026',
      };
    }
    if (parsed.lastUpdated) {
      lastUpdated = parsed.lastUpdated;
    }
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ items: menuItems, config: restaurantConfig, lastUpdated }, null, 2));
  }
} catch (err) {
  console.error('Error loading initial data file, using defaults:', err);
}

function persistData() {
  try {
    lastUpdated = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify({ items: menuItems, config: restaurantConfig, lastUpdated }, null, 2));
    notifyClients({ type: 'MENU_UPDATED', lastUpdated });
  } catch (err) {
    console.error('Failed to persist data:', err);
  }
}

// Server-Sent Events (SSE) for zero-latency real-time sync
type SseClient = {
  id: number;
  res: Response;
};
let sseClients: SseClient[] = [];
let nextClientId = 1;

function notifyClients(payload: any) {
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(message);
    } catch {
      // client disconnected
    }
  });
}

// --- API Endpoints ---

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), itemsCount: menuItems.length });
});

// Dedicated fast endpoint for authentic Suteki dish photos with WebP/JPEG, thumbnail optimization, and HTTP 304 ETag caching
app.get('/api/plate-image/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!cleanId) {
    res.status(400).send('Invalid image ID');
    return;
  }

  const wantsThumb = req.query.thumb === '1' || req.query.size === 'thumb' || req.query.w === '240';
  const acceptsWebp = (req.headers.accept || '').includes('image/webp');

  const thumbsDir = path.join(IMAGE_CACHE_DIR, 'thumbs');
  const thumbWebpPath = path.join(thumbsDir, `${cleanId}.webp`);
  const thumbJpgPath = path.join(thumbsDir, `${cleanId}.jpg`);
  const cachedFilePath = path.join(IMAGE_CACHE_DIR, `${cleanId}.jpg`);

  // Fast-path 1: Thumbnail requested (WebP preferred, fallback JPEG)
  if (wantsThumb) {
    if (acceptsWebp && fs.existsSync(thumbWebpPath)) {
      const etag = `"${cleanId}-thumb-webp"`;
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', etag);
      res.setHeader('Vary', 'Accept');
      fs.createReadStream(thumbWebpPath).pipe(res);
      return;
    }

    if (fs.existsSync(thumbJpgPath)) {
      const etag = `"${cleanId}-thumb-jpg"`;
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', etag);
      res.setHeader('Vary', 'Accept');
      fs.createReadStream(thumbJpgPath).pipe(res);
      return;
    }
  }

  // Fast-path 2: Full size from local disk cache
  if (fs.existsSync(cachedFilePath)) {
    const etag = `"${cleanId}-full"`;
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', etag);
    fs.createReadStream(cachedFilePath).pipe(res);
    return;
  }

  // Fallback: If not cached yet and not an ext- file, fetch upstream
  if (cleanId.startsWith('ext-')) {
    res.status(404).send('External image not in cache');
    return;
  }

  try {
    const upstreamUrl = `https://images.loveat.la/media/2510/images/plates/${cleanId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const upstreamRes = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!upstreamRes.ok) {
      res.status(upstreamRes.status).send('Image not found upstream');
      return;
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFile(cachedFilePath, buffer, () => {
      // Generate thumbnail in background for next time
      try {
        if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
        execSync(`convert "${cachedFilePath}" -resize 240x240\\> -quality 80 "${thumbWebpPath}" 2>/dev/null || true`);
      } catch {}
    });

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  } catch (err) {
    console.error(`Error streaming plate image ${cleanId}:`, err);
    res.status(502).send('Error retrieving image');
  }
});

// Check if authentic hero video exists
app.head('/api/hero-video', (_req: Request, res: Response) => {
  if (fs.existsSync(HERO_VIDEO_FILE)) {
    const stat = fs.statSync(HERO_VIDEO_FILE);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Accept-Ranges', 'bytes');
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

// Stream authentic hero video with HTTP 206 Partial Content (Range requests for Safari & Chrome)
app.get('/api/hero-video', (req: Request, res: Response) => {
  if (!fs.existsSync(HERO_VIDEO_FILE)) {
    res.status(404).send('Hero video not found');
    return;
  }

  const stat = fs.statSync(HERO_VIDEO_FILE);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(HERO_VIDEO_FILE, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(HERO_VIDEO_FILE).pipe(res);
  }
});

// Upload authentic hero video (supports binary video payloads up to 100MB)
app.post(
  '/api/hero-video',
  express.raw({ type: ['video/*', 'application/octet-stream', 'application/x-zip-compressed'], limit: '100mb' }),
  (req: Request, res: Response) => {
    try {
      const buffer = req.body;
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        res.status(400).json({ error: 'No video binary payload provided' });
        return;
      }

      fs.writeFileSync(HERO_VIDEO_FILE, buffer);
      restaurantConfig.heroVideoUrl = '/api/hero-video';
      restaurantConfig.showHeroVideo = true;
      persistData();

      res.json({
        success: true,
        message: 'Video artesanal de Suteki guardado con éxito',
        heroVideoUrl: '/api/hero-video',
        size: buffer.length,
      });
    } catch (err: any) {
      console.error('Error saving hero video:', err);
      res.status(500).json({ error: 'Failed to save video: ' + err.message });
    }
  }
);

// Delete hero video
app.delete('/api/hero-video', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(HERO_VIDEO_FILE)) {
      fs.unlinkSync(HERO_VIDEO_FILE);
    }
    restaurantConfig.heroVideoUrl = undefined;
    persistData();
    res.json({ success: true, message: 'Video removido' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generic image proxy for remote assets needing CORS or proper content-type
app.get('/api/image-proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl || typeof targetUrl !== 'string') {
    res.status(400).send('Missing url parameter');
    return;
  }

  // If loveat plate URL, route to plate-image
  if (targetUrl.includes('images.loveat.la/media/2510/images/plates/')) {
    const parts = targetUrl.split('plates/');
    const plateId = parts[1]?.split('?')[0]?.replace(/[^a-zA-Z0-9_-]/g, '');
    if (plateId) {
      const cachedFilePath = path.join(IMAGE_CACHE_DIR, `${plateId}.jpg`);
      if (fs.existsSync(cachedFilePath)) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        fs.createReadStream(cachedFilePath).pipe(res);
        return;
      }
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const upstreamRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!upstreamRes.ok) {
      res.status(upstreamRes.status).send('Failed to fetch image upstream');
      return;
    }

    const contentType = upstreamRes.headers.get('content-type') || '';
    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalMime = 'image/jpeg';
    if (contentType.startsWith('image/')) {
      finalMime = contentType;
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      finalMime = 'image/png';
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      finalMime = 'image/webp';
    }

    res.setHeader('Content-Type', finalMime);
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    res.send(buffer);
  } catch (err) {
    console.error('Error in /api/image-proxy:', err);
    res.status(502).send('Proxy error');
  }
});

// SSE endpoint for live updates across tablets, phones and kitchen
app.get('/api/menu/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = nextClientId++;
  const newClient: SseClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, lastUpdated })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Get full menu and config
app.get('/api/menu', (_req: Request, res: Response) => {
  res.json({
    items: menuItems,
    config: restaurantConfig,
    lastUpdated,
  });
});

// Update a single item (price, availability, photo, description, etc.)
app.put('/api/menu/item/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<MenuItem>;

  const index = menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  menuItems[index] = {
    ...menuItems[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  persistData();
  res.json({ success: true, item: menuItems[index] });
});

// Quick toggle availability (instant 86'd out of stock / in stock)
app.patch('/api/menu/item/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const newAvailable = typeof req.body.available === 'boolean' 
    ? req.body.available 
    : !menuItems[index].available;

  menuItems[index].available = newAvailable;
  menuItems[index].updatedAt = new Date().toISOString().split('T')[0];

  persistData();
  res.json({ success: true, item: menuItems[index] });
});

// Add new dish
app.post('/api/menu/item', (req: Request, res: Response) => {
  const newItem = req.body as MenuItem;
  if (!newItem.name || !newItem.category) {
    res.status(400).json({ error: 'Nombre y categoría son requeridos' });
    return;
  }

  if (!newItem.id) {
    const slug = newItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const catSlug = newItem.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    newItem.id = `${catSlug}--${slug}-${Date.now().toString(36)}`;
  }

  newItem.updatedAt = new Date().toISOString().split('T')[0];
  if (newItem.order === undefined) {
    newItem.order = menuItems.length;
  }

  menuItems.push(newItem);
  persistData();
  res.status(201).json({ success: true, item: newItem });
});

// Delete dish
app.delete('/api/menu/item/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const deleted = menuItems.splice(index, 1)[0];
  persistData();
  res.json({ success: true, item: deleted });
});

// Bulk import menu items from Excel / CSV or JSON (replace or merge)
app.post('/api/menu/import', (req: Request, res: Response) => {
  const { items: newItems, mode } = req.body;
  if (!Array.isArray(newItems)) {
    res.status(400).json({ error: 'Array de platos requerido' });
    return;
  }

  if (mode === 'replace') {
    menuItems = newItems;
  } else {
    // Merge: update existing by ID, append new
    const itemMap = new Map<string, MenuItem>();
    menuItems.forEach((item) => itemMap.set(item.id, item));

    newItems.forEach((item) => {
      itemMap.set(item.id, item);
    });
    menuItems = Array.from(itemMap.values());
  }

  persistData();
  res.json({ success: true, count: menuItems.length, items: menuItems });
});

// Batch update or reset to original defaults
app.post('/api/menu/reset', (_req: Request, res: Response) => {
  menuItems = [...INITIAL_MENU_ITEMS];
  restaurantConfig = { ...DEFAULT_RESTAURANT_CONFIG };
  persistData();
  res.json({ success: true, count: menuItems.length });
});

// Update restaurant configuration
app.get('/api/config', (_req: Request, res: Response) => {
  res.json(restaurantConfig);
});

app.put('/api/config', (req: Request, res: Response) => {
  restaurantConfig = {
    ...restaurantConfig,
    ...req.body,
  };
  persistData();
  res.json({ success: true, config: restaurantConfig });
});

// Upload or save custom restaurant ambience photo
app.post('/api/upload-ambience', (req: Request, res: Response) => {
  const { dataUrl, imageUrl } = req.body;
  const imageToUse = dataUrl || imageUrl;

  if (!imageToUse) {
    res.status(400).json({ error: 'No se recibió ninguna imagen' });
    return;
  }

  // If base64 dataUrl, persist to /public/suteki-resto.jpg
  if (typeof imageToUse === 'string' && imageToUse.startsWith('data:image/')) {
    try {
      const matches = imageToUse.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' || matches[1] === 'jpg' ? 'jpg' : 'png';
        const buffer = Buffer.from(matches[2], 'base64');
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        const filename = `suteki-resto.${ext}`;
        fs.writeFileSync(path.join(publicDir, filename), buffer);

        restaurantConfig.ambienceImageUrl = `/${filename}`;
        restaurantConfig.showAmbienceHero = true;
        persistData();
        res.json({ success: true, url: `/${filename}`, config: restaurantConfig });
        return;
      }
    } catch (err) {
      console.error('Error saving uploaded ambience image:', err);
    }
  }

  restaurantConfig.ambienceImageUrl = imageToUse;
  restaurantConfig.showAmbienceHero = true;
  persistData();
  res.json({ success: true, url: imageToUse, config: restaurantConfig });
});

// Serve public static folder
app.use(express.static(path.join(process.cwd(), 'public')));

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Suteki Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
