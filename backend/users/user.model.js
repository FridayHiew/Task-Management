const db = require("../config/db");

// =========================
// 辅助函数：将条件对象转换为 WHERE 子句
// =========================
const buildWhereClause = (conditions) => {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(" AND ");
  return { whereClause, values };
};

// =========================
// BASIC CRUD OPERATIONS
// =========================

// GET ONE - 根据条件获取单个用户
exports.getUserByUsername = async (username) => {
  const sql = `SELECT * FROM users WHERE username = $1`;
  const result = await db.query(sql, [username]);
  return result[0] || null;
};

exports.getUserById = async (id) => {
  const sql = `SELECT * FROM users WHERE id = $1`;
  const result = await db.query(sql, [id]);
  return result[0] || null;
};

exports.getUserByEmail = async (email) => {
  const sql = `SELECT * FROM users WHERE email = $1`;
  const result = await db.query(sql, [email]);
  return result[0] || null;
};

// GET ALL - 获取所有用户
exports.getAllUsers = async () => {
  const sql = `SELECT * FROM users ORDER BY id`;
  const result = await db.query(sql);
  return result;
};

// CREATE - 创建用户
exports.createUser = async (data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  
  const sql = `
    INSERT INTO users (${keys.join(", ")})
    VALUES (${placeholders})
    RETURNING *
  `;
  
  const result = await db.query(sql, values);
  return result[0];
};

// UPDATE - 更新用户
exports.updateUser = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  if (keys.length === 0) return null;
  
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const sql = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;
  
  const result = await db.query(sql, [...values, id]);
  return result[0] || null;
};

// DELETE - 删除用户
exports.deleteUser = async (id) => {
  const sql = `DELETE FROM users WHERE id = $1`;
  const result = await db.query(sql, [id]);
  return result;
};

// =========================
// 通用方法（保持向后兼容）
// =========================

// 通用 GET - 根据条件获取单条记录
exports.get = async (table, conditions) => {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(" AND ");
  const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
  const result = await db.query(sql, values);
  return result[0] || null;
};

// 通用 GET ALL - 获取所有记录（可选条件）
exports.all = async (table, conditions = {}) => {
  let sql = `SELECT * FROM ${table}`;
  let values = [];
  
  const keys = Object.keys(conditions);
  if (keys.length > 0) {
    values = Object.values(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(" AND ");
    sql += ` WHERE ${whereClause}`;
  }
  
  sql += ` ORDER BY id`;
  const result = await db.query(sql, values);
  return result;
};

// 通用 RUN - 插入数据
exports.run = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  
  const sql = `
    INSERT INTO ${table} (${keys.join(", ")})
    VALUES (${placeholders})
    RETURNING *
  `;
  
  const result = await db.query(sql, values);
  return { insertId: result[0]?.id, ...result[0] };
};

// 通用 UPDATE - 更新数据
exports.update = async (table, id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  if (keys.length === 0) return null;
  
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const sql = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;
  
  const result = await db.query(sql, [...values, id]);
  return result[0] || null;
};

// 通用 DELETE - 删除数据
exports.delete = async (table, id) => {
  const sql = `DELETE FROM ${table} WHERE id = $1`;
  const result = await db.query(sql, [id]);
  return result;
};