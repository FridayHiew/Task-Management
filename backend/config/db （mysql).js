const mysql = require('mysql2/promise');

// =========================
// 🔌 CREATE POOL (使用环境变量)
// =========================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_management_system',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  // 生产环境建议添加这些配置
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// =========================
// 🔧 HELPER FUNCTIONS
// =========================

// GET ONE
exports.get = async (table, conditions) => {
  try {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    const where = keys.map(k => `${k} = ?`).join(" AND ");
    const sql = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;

    const [rows] = await pool.query(sql, values);
    return rows[0] || null;
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
};

// GET MANY
exports.all = async (table, conditions = {}) => {
  try {
    let sql = `SELECT * FROM ${table}`;
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    if (keys.length > 0) {
      const where = keys.map(k => `${k} = ?`).join(" AND ");
      sql += ` WHERE ${where}`;
    }

    const [rows] = await pool.query(sql, values);
    return rows;
  } catch (error) {
    console.error('Database all error:', error);
    throw error;
  }
};

// INSERT
exports.run = async (table, data) => {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const sql = `
      INSERT INTO ${table} (${keys.join(",")})
      VALUES (${keys.map(() => "?").join(",")})
    `;

    const [result] = await pool.query(sql, values);
    return result;
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
};

// UPDATE
exports.update = async (table, id, data) => {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const set = keys.map(k => `${k} = ?`).join(", ");

    const sql = `
      UPDATE ${table}
      SET ${set}
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [...values, id]);
    return result;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
};

// DELETE
exports.delete = async (table, id) => {
  try {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const [result] = await pool.query(sql, [id]);
    return result;
  } catch (error) {
    console.error('Database delete error:', error);
    throw error;
  }
};

// RAW QUERY
exports.query = async (sql, params = []) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

// =========================
// 🔥 TRANSACTION SUPPORT
// =========================
exports.getConnection = async () => {
  return await pool.getConnection();
};

// =========================
// 🧪 TEST CONNECTION (用于调试)
// =========================
exports.testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};