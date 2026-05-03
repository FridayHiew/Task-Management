const model = require("./task.model");
const db = require("../config/db");

// =========================
// HELPER FUNCTION FOR VALIDATION
// =========================
const validatePriority = (priority) => {
  if (priority === undefined) return true;
  const num = Number(priority);
  return !isNaN(num) && num >= 1 && num <= 5;
};

// =========================
// GET TASKS
// =========================
exports.getTasks = async (req, res) => {
  const { status, favourite, priority } = req.query;

  try {
    console.log('=== GET TASKS DEBUG ===');
    console.log('User ID from token:', req.user.id);
    console.log('Status filter:', status);
    console.log('Favourite filter:', favourite);
    console.log('Priority filter:', priority);
    
    const rows = await model.getTasks(req.user.id, {
      status,
      favourite: favourite === 'true' ? true : favourite === 'false' ? false : undefined,
      priority: priority ? Number(priority) : undefined,
    });
    
    console.log('Number of tasks found:', rows.length);
    
    // Ensure we always return an array
    const tasks = Array.isArray(rows) ? rows : [];
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// CREATE TASK
// =========================
exports.createTask = async (req, res) => {
  try {
    const data = req.body;
    
    // Validate priority if provided
    if (data.priority !== undefined && !validatePriority(data.priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be between 1 and 5"
      });
    }
    
    // Set default priority to 3 (Medium) if not provided
    if (data.priority === undefined) {
      data.priority = 3;
    }
    
    console.log('=== CREATE TASK ===');
    console.log('User ID:', req.user.id);
    console.log('Task data:', data);
    
    const result = await model.createTaskFull(data, req.user.id);
    
    // Return the created task object
    res.status(201).json(result);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =========================
// GET TASK DETAIL
// =========================
exports.getTaskById = async (req, res) => {
  try {
    console.log("=== GET TASK DETAIL ===");
    console.log("taskId:", req.params.id);
    console.log("userId from token:", req.user?.id);
    console.log("full user object:", req.user);

    const task = await model.getTaskById(
      parseInt(req.params.id),
      req.user?.id
    );

    if (!task) {
      console.log("❌ Task not found in DB or user mismatch");
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    console.log("✅ Task found:", task.id);
    res.json(task);
  } catch (error) {
    console.error("🔥 Controller error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// UPDATE TASK CONTROLLER
// =========================
exports.updateTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;
  const data = req.body;

  try {
    // Validate priority if provided
    if (data.priority !== undefined && !validatePriority(data.priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be between 1 and 5"
      });
    }
    
    console.log('=== UPDATE TASK ===');
    console.log('Task ID:', taskId);
    console.log('User ID:', userId);
    console.log('Update data:', data);
    
    const result = await model.updateTaskFull(taskId, userId, data);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Task not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: result
    });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Internal server error" 
    });
  }
};

// =========================
// DELETE TASK
// =========================
exports.deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;
    
    console.log('=== DELETE TASK ===');
    console.log('Task ID:', taskId);
    console.log('User ID:', userId);
    
    await model.deleteTask(taskId, userId);

    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// =========================
// TOGGLE FAVOURITE (Utility)
// =========================
exports.toggleFavourite = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;
    const { is_favourite } = req.body;
    
    if (is_favourite === undefined) {
      return res.status(400).json({
        success: false,
        message: "is_favourite field is required"
      });
    }
    
    const result = await model.updateTaskFull(taskId, userId, { 
      is_favourite: is_favourite ? 1 : 0 
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }
    
    res.json({
      success: true,
      message: is_favourite ? "Added to favourites" : "Removed from favourites",
      task: result
    });
  } catch (error) {
    console.error('Toggle favourite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};