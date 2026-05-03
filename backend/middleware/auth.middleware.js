const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

// 🔐 Authenticate Token
exports.auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Support both formats:
    // "Bearer TOKEN" or just "TOKEN"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    const decoded = jwt.verify(token, SECRET);

    // attach user info
    req.user = {
      id: decoded.id,
      role: decoded.role || "user", // default role
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};

// 🔒 Optional: Role-based middleware (VERY useful)
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  next();
};