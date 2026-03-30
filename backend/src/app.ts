// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import apiRouter from './api';
import { errorHandler } from './middleware/error';
import { notFoundHandler } from './middleware/notFound';
import logger from './utils/logger';

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());

// 请求体解析
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    return originalSend.call(this, body);
  };

  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API路由
app.use('/api', apiRouter);

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

export default app;