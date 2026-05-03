const db = require("../config/db");

const TABLES = {
  advisors: "advisors",
  business_users: "business_users",
  cost_centers: "cost_centers",
  outsource_partners: "outsource_partners",
  categories: "categories",
};

const getTable = (type) => {
  const table = TABLES[type];
  if (!table) throw new Error("Invalid type");
  return table;
};

// GET (user-specific) - PostgreSQL 使用 $1
exports.getAll = async (type, userId) => {
  const table = getTable(type);
  // PostgreSQL 占位符是 $1，不是 ?
  const sql = `SELECT * FROM ${table} WHERE user_id = $1`;
  return db.query(sql, [userId]);
};

// CREATE - 使用 db.run 但需要适配 PostgreSQL
exports.create = async (type, data) => {
  const table = getTable(type);
  
  // PostgreSQL 使用 RETURNING * 获取插入的数据
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  
  const sql = `
    INSERT INTO ${table} (${keys.join(", ")})
    VALUES (${placeholders})
    RETURNING *
  `;
  
  const result = await db.query(sql, values);
  return result[0]; // 返回插入的记录
};

// DELETE (user-protected) - PostgreSQL 使用 $1, $2
exports.remove = async (type, id, userId) => {
  const table = getTable(type);
  const sql = `DELETE FROM ${table} WHERE id = $1 AND user_id = $2`;
  await db.query(sql, [id, userId]);
  return true;
};