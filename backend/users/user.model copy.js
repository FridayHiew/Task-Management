const db = require("../config/db");

// --- BASIC ---

exports.getUserByUsername = async (username) => {
  return db.get("users", { username });
};

exports.getAllUsers = async () => {
  return db.all("users");
};

exports.getUserById = async (id) => {
  return db.get("users", { id });
};

exports.getUserByEmail = async (email) => {
  return db.get("users", { email });
};

exports.createUser = async (data) => {
  return db.run("users", data);
};

exports.updateUser = async (id, data) => {
  return db.update("users", id, data);
};

exports.deleteUser = async (id) => {
  return db.delete("users", id);
};