const { Pool } = require('pg');

// 优先使用 DATABASE_URL，没有的话用分开的配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// 如果没有 DATABASE_URL，则使用分开的配置
if (!process.env.DATABASE_URL) {
  pool.options.host = process.env.DB_HOST;
  pool.options.user = process.env.DB_USER;
  pool.options.password = process.env.DB_PASSWORD;
  pool.options.database = process.env.DB_NAME;
  pool.options.port = parseInt(process.env.DB_PORT || '5432');
}




// =========================
// 🔧 HELPER FUNCTIONS
// =========================

// GET ONE
exports.get = async (table, conditions) => {
  try {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    const where = keys.map(k => `${k} = $${values.indexOf(conditions[k]) + 1}`).join(" AND ");
    // 重新构建参数数组以保持正确顺序
    const paramValues = Object.values(conditions);
    const sql = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;
    
    // PostgreSQL 使用参数化查询 $1, $2...
    let paramIndex = 1;
    const whereClause = keys.map(() => `$${paramIndex++}`).join(" AND ");
    const finalSql = `SELECT * FROM ${table} WHERE ${keys.join(" AND ")}`.replace(/AND/g, '= ?').split('?');
    // 更简单的方式：使用准备好的参数
    const result = await pool.query(
      `SELECT * FROM ${table} WHERE ${keys.map((k, i) => `${k} = $${i + 1}`).join(" AND ")} LIMIT 1`,
      values
    );
    return result.rows[0] || null;
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
      const where = keys.map((k, i) => `${k} = $${i + 1}`).join(" AND ");
      sql += ` WHERE ${where}`;
    }

    const result = await pool.query(sql, values);
    return result.rows;
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
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const sql = `
      INSERT INTO ${table} (${keys.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(sql, values);
    return { insertId: result.rows[0]?.id, ...result };
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
    
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const sql = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const result = await pool.query(sql, [...values, id]);
    return result;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
};

// DELETE
exports.delete = async (table, id) => {
  try {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    const result = await pool.query(sql, [id]);
    return result;
  } catch (error) {
    console.error('Database delete error:', error);
    throw error;
  }
};

// RAW QUERY
exports.query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
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
  const client = await pool.connect();
  return {
    query: (sql, params) => client.query(sql, params),
    release: () => client.release(),
    beginTransaction: async () => {
      await client.query('BEGIN');
      return {
        commit: async () => await client.query('COMMIT'),
        rollback: async () => await client.query('ROLLBACK')
      };
    }
  };
};

// =========================
// 🧪 TEST CONNECTION (用于调试)
// =========================
exports.testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};