// src/database/index.ts
import { Pool, PoolConfig } from 'pg';
import config from '../config';
import logger from '../utils/logger';

const dbConfig: PoolConfig = {
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

// 连接测试
export async function initDatabase() {
  try {
    const client = await pool.connect();
    logger.info('Database connection established');

    // 测试查询
    const result = await client.query('SELECT NOW()');
    logger.debug('Database time:', result.rows[0].now);

    client.release();
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

// 查询辅助函数
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query failed', { text, error });
    throw error;
  }
}

// 事务辅助函数
export async function transaction<T>(callback: (client: any) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;