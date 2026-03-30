// src/index.ts
import app from './app';
import { initDatabase } from './database';
import { initStorage } from './config/storage';
import logger from './utils/logger';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // 初始化数据库连接
    await initDatabase();
    logger.info('Database connected successfully');

    // 初始化存储服务
    await initStorage();
    logger.info('Storage service initialized');

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();