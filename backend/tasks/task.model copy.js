const db = require("../config/db");

// =========================
// GET ALL TASKS
// =========================
// =========================
// GET ALL TASKS
// =========================
exports.getTasks = async (userId, filters = {}) => {
  let sql = `
    SELECT 
      id,
      user_id,
      project_name,
      description,
      priority,
      status,
      DATE_FORMAT(deadline, '%Y-%m-%d') as deadline,
      is_favourite,
      advisor_id,
      outsource_partner_id,
      business_user_id,
      cost_center_id,
      category_id,
      created_at,
      updated_at
    FROM tasks
    WHERE user_id = ?
  `;
  const params = [userId];

  if (filters.status) {
    sql += " AND status = ?";
    params.push(filters.status);
  }

  if (filters.favourite !== undefined) {
    sql += " AND is_favourite = ?";
    params.push(filters.favourite ? 1 : 0);
  }

  if (filters.priority) {
    sql += " AND priority = ?";
    params.push(Number(filters.priority));
  }

  sql += " ORDER BY created_at DESC";

  if (filters.limit) {
    sql += " LIMIT ?";
    params.push(Number(filters.limit));
  }

  if (filters.offset) {
    sql += " OFFSET ?";
    params.push(Number(filters.offset));
  }

  const rows = await db.query(sql, params);
  
  // Return array
  return Array.isArray(rows) ? rows : (rows ? [rows] : []);
};

// =========================
// CREATE TASK (FULL)
// =========================
exports.createTaskFull = async (data, userId) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. INSERT TASK
    const [taskResult] = await conn.query(
      `
      INSERT INTO tasks 
      (user_id, project_name, description, priority, status, deadline,
       is_favourite,
       advisor_id, business_user_id, cost_center_id, outsource_partner_id,
       created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        userId,
        data.project_name,
        data.description ?? null,
        data.priority,
        data.status,
        data.deadline ?? null,
        data.is_favourite ? 1 : 0,
        data.advisor_id ?? null,
        data.business_user_id ?? null,
        data.cost_center_id ?? null,
        data.outsource_partner_id ?? null
      ]
    );

    const taskId = taskResult.insertId;

    // 2. INSERT SOLUTIONS
    if (data.solutions?.length) {
      for (const sol of data.solutions) {
        const [solutionResult] = await conn.query(
          `
          INSERT INTO task_solutions (task_id, solution, created_at)
          VALUES (?, ?, NOW())
          `,
          [taskId, sol.solution]
        );

        const solutionId = solutionResult.insertId;

        // COSTS
        if (sol.costs?.length) {
          for (const c of sol.costs) {
            await conn.query(
              `
              INSERT INTO task_costs (solution_id, cost, manpower, maintenance_cost)
              VALUES (?, ?, ?, ?)
              `,
              [
                solutionId,
                c.cost ?? 0,
                c.manpower ?? "",
                c.maintenance_cost ?? 0
              ]
            );
          }
        }

        // RISKS
        if (sol.risks?.length) {
          for (const r of sol.risks) {
            await conn.query(
              `
              INSERT INTO task_risks (solution_id, risk, mitigation)
              VALUES (?, ?, ?)
              `,
              [
                solutionId,
                r.risk,
                r.mitigation ?? null
              ]
            );
          }
        }
      }
    }

    await conn.commit();
    return { taskId };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


// =========================
// GET TASK BY ID (FULL DETAIL)
// =========================
exports.getTaskById = async (taskId, userId) => {
  console.log("taskId:", taskId);
  console.log("userId:", userId);

  // Format date directly in SQL to avoid timezone issues
  const tasks = await db.query(
    `SELECT 
      id,
      user_id,
      project_name,
      description,
      priority,
      status,
      DATE_FORMAT(deadline, '%Y-%m-%d') as deadline,
      is_favourite,
      advisor_id,
      outsource_partner_id,
      business_user_id,
      cost_center_id,
      category_id,
      created_at,
      updated_at
    FROM tasks 
    WHERE id = ? AND user_id = ?`,
    [taskId, userId]
  );

  // Handle response - could be array or object
  let taskData = null;
  if (Array.isArray(tasks) && tasks.length > 0) {
    taskData = tasks[0];
  } else if (tasks && typeof tasks === 'object' && !Array.isArray(tasks)) {
    taskData = tasks;
  } else {
    return null;
  }

  if (!taskData) return null;

  const task = {
    ...taskData,
    solutions: []
  };

  // Get solutions
  const solutions = await db.query(
    `SELECT * FROM task_solutions WHERE task_id = ?`,
    [taskId]
  );

  if (!solutions || (Array.isArray(solutions) && solutions.length === 0)) {
    return task;
  }

  const solutionsArray = Array.isArray(solutions) ? solutions : [solutions];

  // Get costs and risks
  for (const sol of solutionsArray) {
    const costs = await db.query(
      `SELECT * FROM task_costs WHERE solution_id = ?`,
      [sol.id]
    );

    const risks = await db.query(
      `SELECT * FROM task_risks WHERE solution_id = ?`,
      [sol.id]
    );

    task.solutions.push({
      id: sol.id,
      solution: sol.solution,
      created_at: sol.created_at,
      costs: Array.isArray(costs) ? costs : (costs ? [costs] : []),
      risks: Array.isArray(risks) ? risks : (risks ? [risks] : [])
    });
  }

  return task;
};


// =========================
// UPDATE TASK
// =========================
exports.updateTaskFull = async (taskId, userId, data) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Check ownership
    const [existingTask] = await conn.query(
      "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId]
    );

    if (!existingTask.length) {
      await conn.rollback();
      return null;
    }

    const updateFields = [];
    const updateParams = [];

    if (data.project_name !== undefined) {
      updateFields.push("project_name = ?");
      updateParams.push(data.project_name);
    }
    if (data.description !== undefined) {
      updateFields.push("description = ?");
      updateParams.push(data.description);
    }
    if (data.priority !== undefined) {
      updateFields.push("priority = ?");
      updateParams.push(data.priority);
    }
    if (data.status !== undefined) {
      updateFields.push("status = ?");
      updateParams.push(data.status);
    }
    if (data.deadline !== undefined) {
      updateFields.push("deadline = ?");
      updateParams.push(data.deadline);
    }
    if (data.is_favourite !== undefined) {
      updateFields.push("is_favourite = ?");
      updateParams.push(data.is_favourite ? 1 : 0);
    }

    if (data.advisor_id !== undefined) {
      updateFields.push("advisor_id = ?");
      updateParams.push(data.advisor_id ?? null);
    }
    if (data.business_user_id !== undefined) {
      updateFields.push("business_user_id = ?");
      updateParams.push(data.business_user_id ?? null);
    }
    if (data.cost_center_id !== undefined) {
      updateFields.push("cost_center_id = ?");
      updateParams.push(data.cost_center_id ?? null);
    }
    if (data.outsource_partner_id !== undefined) {
      updateFields.push("outsource_partner_id = ?");
      updateParams.push(data.outsource_partner_id ?? null);
    }

    updateFields.push("updated_at = NOW()");

    updateParams.push(taskId, userId);

    await conn.query(
      `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`,
      updateParams
    );

    await conn.commit();

    return await exports.getTaskById(taskId, userId);

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// =========================
// DELETE TASK
// =========================
exports.deleteTask = async (taskId, userId) => {
  const [result] = await db.query(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [taskId, userId]
  );

  return result;
};