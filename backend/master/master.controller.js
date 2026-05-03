const model = require("./master.model");

const allowedTypes = [
  "advisors",
  "business_users",
  "cost_centers",
  "outsource_partners",
  "categories",
];

// GET
exports.getAll = async (req, res) => {
  const { type } = req.params;
  const userId = req.user.id;

  try {
    const rows = await model.getAll(type, userId);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE
exports.create = async (req, res) => {
  const { type } = req.params;
  const { name } = req.body;

  try {
    await model.create(type, {
      name,
      user_id: req.user.id, // ✅ IMPORTANT
    });

    res.json({
      success: true,
      message: "Item created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
exports.remove = async (req, res) => {
  const { type, id } = req.params;

  try {
    await model.remove(type, id, req.user.id);

    res.json({
      success: true,
      message: "Item deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};