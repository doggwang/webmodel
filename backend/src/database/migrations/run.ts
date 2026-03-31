// src/database/migrations/run.ts
import fs from 'fs';
import path from 'path';
import { query } from '../index';
import logger from '../../utils/logger';

async function runMigrations() {
  try {
    // 创建迁移记录表（如果不存在）
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 获取已执行的迁移
    const executedResult = await query('SELECT name FROM migrations');
    const executedMigrations = new Set(executedResult.rows.map(row => row.name));

    // 读取迁移文件
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // 按文件名排序

    for (const file of files) {
      if (executedMigrations.has(file)) {
        logger.info(`Migration already executed: ${file}`);
        continue;
      }

      logger.info(`Running migration: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // 在事务中执行迁移
      await query('BEGIN');
      try {
        // 执行SQL
        await query(sql);

        // 记录迁移
        await query('INSERT INTO migrations (name) VALUES ($1)', [file]);

        await query('COMMIT');
        logger.info(`Migration completed: ${file}`);
      } catch (error) {
        await query('ROLLBACK');
        logger.error(`Migration failed: ${file}`, error);
        throw error;
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration process failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default runMigrations;