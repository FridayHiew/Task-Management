const model = require("./user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";
const REFRESH_SECRET = "myrefreshsecretkey";

// User Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await model.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status === 0) {
      return res.status(403).json({
        success: false,
        message: "User is deactivated",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      REFRESH_SECRET
    );

    // 前端期望的格式：直接返回 token, refreshToken, user
    res.json({
      token: token,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.status === 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const data = jwt.verify(refreshToken, REFRESH_SECRET);

    const newToken = jwt.sign(
      { id: data.id, role: data.role },
      SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch {
    res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// GET ALL USERS (ADMIN)
exports.getAllUsers = async (req, res) => {
  try {
    const rows = await model.getAllUsers();

    const data = rows.map((r) => {
      const { password_hash, ...rest } = r;
      return rest;
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// LOGOUT
exports.logout = async (req, res) => {
  // stateless JWT → no server-side logout
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};



// CREATE USER (ADMIN)
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await model.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await model.createUser({
      username,
      email,
      password_hash: passwordHash,
      role: role || "user",
      status: 1,
    });

    res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// =========================
// CHANGE OWN PASSWORD
// =========================

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Get user from database
    const user = await model.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await model.updateUser(userId, { password_hash: hashedPassword });

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change password"
    });
  }
};


// UPDATE USER
exports.updateUser = async (req, res) => {
  const { username, email } = req.body;
  const id = parseInt(req.params.id);

  try {
    const user = await model.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    await model.updateUser(id, { username, email });

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete yourself",
      });
    }

    const user = await model.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await model.deleteUser(id);

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const user = await model.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordHash = await bcrypt.hash("Password123", 10);

    await model.updateUser(id, { password_hash: passwordHash });

    res.json({
      success: true,
      message: `Password reset for user ${user.username}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ACTIVATE / DEACTIVATE USER
exports.toggleUserStatus = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate yourself",
      });
    }

    const user = await model.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newStatus = user.status === 0 ? 1 : 0;

    await model.updateUser(id, { status: newStatus });
    const text = newStatus === 1 ? "activated" : "deactivated";
    

    res.json({
      success: true,
      message: `User ${user.username} ${text}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};