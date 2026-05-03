const express = require("express");
const router = express.Router();
const controller = require("./task.controller");
const { auth } = require("../middleware/auth.middleware");

// =========================
// HELPER (IMPORTANT)
// =========================
const parseBoolean = (value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

// =========================
// GET ALL TASKS
// =========================

const parseInteger = (value) => {
  if (value === undefined || value === null) return undefined;
  const num = parseInt(value);
  return isNaN(num) ? undefined : num;
};

// =========================
// GET ALL TASKS
// =========================

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get All Tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, in_progress, kiv, completed]
 *         description: Filter by task status
 *         example: active
 *       - in: query
 *         name: favourite
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *         description: Filter by favourite status (true/false)
 *         example: true
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by priority level (1-5)
 *         example: 5
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of results
 *         example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *         example: 0
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   project_name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   priority:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                   status:
 *                     type: string
 *                     enum: [active, in_progress, kiv, completed]
 *                   deadline:
 *                     type: string
 *                     format: date
 *                   is_favourite:
 *                     type: boolean
 *                   advisor_id:
 *                     type: integer
 *                   outsource_partner_id:
 *                     type: integer
 *                   business_user_id:
 *                     type: integer
 *                   cost_center_id:
 *                     type: integer
 *                   category_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", auth, (req, res, next) => {
  // Log incoming query parameters for debugging
  console.log('=== GET /api/tasks ===');
  console.log('Raw query params:', req.query);
  console.log('Status filter (raw):', req.query.status);
  console.log('Favourite filter (raw):', req.query.favourite);
  console.log('Priority filter (raw):', req.query.priority);
  
  // Normalize query parameters
  req.query.status = req.query.status || undefined;
  req.query.favourite = parseBoolean(req.query.favourite);
  req.query.priority = parseInteger(req.query.priority);
  req.query.limit = parseInteger(req.query.limit);
  req.query.offset = parseInteger(req.query.offset);
  
  console.log('Normalized query params:', {
    status: req.query.status,
    favourite: req.query.favourite,
    priority: req.query.priority,
    limit: req.query.limit,
    offset: req.query.offset
  });
  
  next();
}, controller.getTasks);

// =========================
// CREATE TASK
// =========================
router.post("/", auth, controller.createTask);

// =========================
// GET TASK DETAIL
// =========================
router.get("/:id", auth, (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID"
    });
  }

  req.params.id = id;
  next();
}, controller.getTaskById);

// =========================
// UPDATE TASK
// =========================
router.put("/:id", auth, (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID"
    });
  }

  req.params.id = id;
  next();
}, controller.updateTask);

// =========================
// DELETE TASK
// =========================
router.delete("/:id", auth, (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID"
    });
  }

  req.params.id = id;
  next();
}, controller.deleteTask);

module.exports = router;


/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get All Tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: favourite
 *         schema:
 *           type: boolean
 *
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get Task Detail
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Task not found"
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create Task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 taskId: 1
 *
 *       400:
 *         description: Invalid input
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update Task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Task updated successfully"
 *
 *       404:
 *         description: Task not found
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete Task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Task deleted successfully"
 *
 *       404:
 *         description: Task not found
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */