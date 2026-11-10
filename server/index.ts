import express from 'express';
import path from 'path';
import fs from 'fs';
import { handleApiRequest, readDatabase } from './apiHandler';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ensure database is initialized on startup
readDatabase();

// Mount the Backend API handler for all /api/* routes
app.use(async (req, res, next) => {
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    next();
  }
});

// Serve static production frontend from dist/ if available
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use('/KHKT-MATH', express.static(distDir));
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    const indexHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      res.status(404).send('Frontend build not found. Run npm run build first.');
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================================`);
  console.log(`🚀 OPTIMATH Backend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📂 Kho lưu trữ dữ liệu JSON: server/data/db.json`);
  console.log(`📁 Thư mục tài liệu tải lên: server/uploads/`);
  console.log(`=============================================================`);
});
