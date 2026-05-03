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

// GET (user-specific)
exports.getAll = async (type, userId) => {
  const table = getTable(type);

  return db.query(
    `SELECT * FROM ${table} WHERE user_id = ?`,
    [userId]
  );
};

// CREATE
exports.create = async (type, data) => {
  const table = getTable(type);
  return db.run(table, data);
};

// DELETE (user-protected)
exports.remove = async (type, id, userId) => {
  const table = getTable(type);

  return db.query(
    `DELETE FROM ${table} WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
};