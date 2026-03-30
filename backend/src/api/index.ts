// src/api/index.ts
import { Router } from 'express';

const router = Router();

// 健康检查端点
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// TODO: 添加实际的路由
// router.use('/models', modelRoutes);
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

export default router;