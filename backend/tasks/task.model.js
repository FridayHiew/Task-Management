const db = require("../config/db");

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
      TO_CHAR(deadline, 'YYYY-MM-DD') as deadline,
      is_favourite,
      advisor_id,
      outsource_partner_id,
      business_user_id,
      cost_center_id,
      category_id,
      created_at,
      updated_at
    FROM tasks
    WHERE user_id = $1
  `;
  const params = [userId];
  let paramCount = 2;

  if (filters.status) {
    sql += ` AND status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  if (filters.favourite !== undefined) {
    sql += ` AND is_favourite = $${paramCount}`;
    params.push(filters.favourite ? 1 : 0);
    paramCount++;
  }

  if (filters.priority) {
    sql += ` AND priority = $${paramCount}`;
    params.push(Number(filters.priority));
    paramCount++;
  }

  sql += " ORDER BY created_at DESC";

  if (filters.limit) {
    sql += ` LIMIT $${paramCount}`;
    params.push(Number(filters.limit));
    paramCount++;
  }

  if (filters.offset) {
    sql += ` OFFSET $${paramCount}`;
    params.push(Number(filters.offset));
    paramCount++;
  }

  const rows = await db.query(sql, params);
  
  return Array.isArray(rows) ? rows : (rows ? [rows] : []);
};

// =========================
// CREATE TASK (FULL)
// =========================
exports.createTaskFull = async (data, userId) => {
  const client = await db.getConnection();

  try {
    await client.query('BEGIN');

    // 1. INSERT TASK
    const taskResult = await client.query(
      `
      INSERT INTO tasks 
      (user_id, project_name, description, priority, status, deadline,
       is_favourite,
       advisor_id, business_user_id, cost_center_id, outsource_partner_id, category_id,
       created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING id
      `,
      [
        userId,
        data.project_name,
        data.description ?? null,
        data.priority ? Number(data.priority) : 3,
        data.status,
        data.deadline ?? null,
        data.is_favourite ? 1 : 0,
        data.advisor_id ?? null,
        data.business_user_id ?? null,
        data.cost_center_id ?? null,
        data.outsource_partner_id ?? null,
        data.category_id ?? null
      ]
    );

    const taskId = taskResult.rows[0].id;

    // 2. INSERT SOLUTIONS
    if (data.solutions?.length) {
      for (const sol of data.solutions) {
        const solutionResult = await client.query(
          `
          INSERT INTO task_solutions (task_id, solution, created_at)
          VALUES ($1, $2, NOW())
          RETURNING id
          `,
          [taskId, sol.solution]
        );

        const solutionId = solutionResult.rows[0].id;

        // COSTS
        if (sol.costs?.length) {
          for (const c of sol.costs) {
            await client.query(
              `
              INSERT INTO task_costs (solution_id, cost, manpower, maintenance_cost)
              VALUES ($1, $2, $3, $4)
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
            await client.query(
              `
              INSERT INTO task_risks (solution_id, risk, mitigation)
              VALUES ($1, $2, $3)
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

    await client.query('COMMIT');
    
    // Return the created task
    const createdTask = await exports.getTaskById(taskId, userId);
    return createdTask;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
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
      TO_CHAR(deadline, 'YYYY-MM-DD') as deadline,
      is_favourite,
      advisor_id,
      outsource_partner_id,
      business_user_id,
      cost_center_id,
      category_id,
      created_at,
      updated_at
    FROM tasks 
    WHERE id = $1 AND user_id = $2`,
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
    `SELECT * FROM task_solutions WHERE task_id = $1`,
    [taskId]
  );

  if (!solutions || (Array.isArray(solutions) && solutions.length === 0)) {
    return task;
  }

  const solutionsArray = Array.isArray(solutions) ? solutions : [solutions];

  // Get costs and risks
  for (const sol of solutionsArray) {
    const costs = await db.query(
      `SELECT * FROM task_costs WHERE solution_id = $1`,
      [sol.id]
    );

    const risks = await db.query(
      `SELECT * FROM task_risks WHERE solution_id = $1`,
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
  const client = await db.getConnection();

  try {
    await client.query('BEGIN');

    // Check ownership
    const existingTask = await client.query(
      "SELECT id FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );

    if (existingTask.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const updateFields = [];
    const updateParams = [];
    let paramCount = 1;

    if (data.project_name !== undefined) {
      updateFields.push(`project_name = $${paramCount}`);
      updateParams.push(data.project_name);
      paramCount++;
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateParams.push(data.description);
      paramCount++;
    }
    if (data.priority !== undefined) {
      updateFields.push(`priority = $${paramCount}`);
      updateParams.push(Number(data.priority));
      paramCount++;
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      updateParams.push(data.status);
      paramCount++;
    }
    if (data.deadline !== undefined) {
      updateFields.push(`deadline = $${paramCount}`);
      updateParams.push(data.deadline);
      paramCount++;
    }
    if (data.is_favourite !== undefined) {
      updateFields.push(`is_favourite = $${paramCount}`);
      updateParams.push(data.is_favourite ? 1 : 0);
      paramCount++;
    }

    if (data.advisor_id !== undefined) {
      updateFields.push(`advisor_id = $${paramCount}`);
      updateParams.push(data.advisor_id ?? null);
      paramCount++;
    }
    if (data.business_user_id !== undefined) {
      updateFields.push(`business_user_id = $${paramCount}`);
      updateParams.push(data.business_user_id ?? null);
      paramCount++;
    }
    if (data.cost_center_id !== undefined) {
      updateFields.push(`cost_center_id = $${paramCount}`);
      updateParams.push(data.cost_center_id ?? null);
      paramCount++;
    }
    if (data.outsource_partner_id !== undefined) {
      updateFields.push(`outsource_partner_id = $${paramCount}`);
      updateParams.push(data.outsource_partner_id ?? null);
      paramCount++;
    }
    if (data.category_id !== undefined) {
      updateFields.push(`category_id = $${paramCount}`);
      updateParams.push(data.category_id ?? null);
      paramCount++;
    }

    updateFields.push(`updated_at = NOW()`);

    updateParams.push(taskId, userId);

    await client.query(
      `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = $${paramCount} AND user_id = $${paramCount + 1}`,
      updateParams
    );

    await client.query('COMMIT');

    return await exports.getTaskById(taskId, userId);

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// =========================
// DELETE TASK
// =========================
exports.deleteTask = async (taskId, userId) => {
  const result = await db.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
    [taskId, userId]
  );
  return result;
};