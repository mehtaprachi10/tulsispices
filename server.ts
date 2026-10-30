import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './server/storage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Routes
  // 1. Products
  app.get('/api/products', (_req, res) => {
    try {
      res.json(storage.getProducts());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    try {
      const product = storage.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const product = storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const updated = storage.updateProduct(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const success = storage.deleteProduct(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Enquiries
  app.get('/api/enquiries', (_req, res) => {
    try {
      res.json(storage.getEnquiries());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/enquiries', (req, res) => {
    try {
      const { customerName, phone } = req.body;
      if (!customerName || !phone) {
        res.status(400).json({ error: 'Customer name and phone number are required.' });
        return;
      }
      const enquiry = storage.createEnquiry(req.body);
      res.status(201).json(enquiry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/enquiries/:id', (req, res) => {
    try {
      const updated = storage.updateEnquiry(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Enquiry not found' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/enquiries/:id', (req, res) => {
    try {
      const success = storage.deleteEnquiry(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Enquiry not found' });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Company Info
  app.get('/api/company', (_req, res) => {
    try {
      res.json(storage.getCompanyInfo());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/company', (req, res) => {
    try {
      const updated = storage.updateCompanyInfo(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. Admin Auth
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin123' || password === 'vedic2026') {
      res.json({ success: true, token: 'vedic-admin-session-token' });
    } else {
      res.status(401).json({ error: 'Invalid password. Try: admin123' });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
