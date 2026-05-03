require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('=== 数据库连接测试 ===');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    // 测试连接
    const timeResult = await pool.query('SELECT NOW() as time');
    console.log('✅ 连接成功！');
    console.log('服务器时间:', timeResult.rows[0].time);
    
    // 查询用户表
    const usersResult = await pool.query('SELECT id, username, email, role, status FROM users');
    console.log(`\n✅ 找到 ${usersResult.rows.length} 个用户:`);
    usersResult.rows.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) [${user.role}]`);
    });
    
  } catch (err) {
    console.error('❌ 错误:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();