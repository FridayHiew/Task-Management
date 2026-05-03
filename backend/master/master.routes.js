const express = require("express");
const router = express.Router();
const controller = require("./master.controller");
const { auth, requireAdmin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Master Data
 *   description: Master Data Management APIs
 */

/**
 * @swagger
 * /api/master/{type}:
 *   get:
 *     summary: Get Master Data List
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [advisors, business_users, cost_centers, outsource_partners, categories]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:type", auth, controller.getAll);

/**
 * @swagger
 * /api/master/{type}:
 *   post:
 *     summary: Create Master Data
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [advisors, business_users, cost_centers, outsource_partners, categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sample Name"
 *     responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */
router.post("/:type", auth, requireAdmin, controller.create);

/**
 * @swagger
 * /api/master/{type}/{id}:
 *   delete:
 *     summary: Delete Master Data
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [advisors, business_users, cost_centers, outsource_partners, categories]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */
router.delete("/:type/:id", auth, requireAdmin, controller.remove);

module.exports = router;