const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // 添加这行，读取 .env 文件

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const userRoutes = require("./users/user.routes");
const taskRoutes = require("./tasks/task.routes");
const adminUserRoutes = require("./users/user.routes");
const masterRoutes = require("./master/master.routes");

const app = express();

// 获取端口和主机配置
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

// 获取本机 IP（用于显示）
const getLocalIP = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// ensure logs folder exists
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// swagger config（生产环境可以禁用）
const isSwaggerEnabled = process.env.ENABLE_SWAGGER !== 'false';
if (isSwaggerEnabled) {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Task API Docs",
        version: "2.0.0",
        description: "Task Management System API",
      },
      servers: [
        { url: API_URL, description: "Current server" },
        { url: "http://localhost:5000", description: "Local server" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: ["./users/*.js", "./tasks/*.js", "./master/*.js"],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
}

// logs - 只在开发环境输出详细日志
const logStream = fs.createWriteStream(
  path.join(logDir, "access.log"),
  { flags: "a" }
);

if (NODE_ENV === 'development') {
  app.use(morgan("dev"));
}
app.use(morgan("combined", { stream: logStream }));

// CORS 配置 - 生产环境限制域名
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// 请求日志中间件（用于调试）
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查端点（用于负载均衡和监控）
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// API 路由
app.use("/api/users", userRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/master", masterRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    success: false, 
    message: NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 启动服务器
const server = app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log(`\n🚀 Server is running!`);
  console.log(`🔧 Environment: ${NODE_ENV}`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Local access: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://${localIP}:${PORT}`);
  if (isSwaggerEnabled) {
    console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
  }
  console.log(`✅ Health check: http://localhost:${PORT}/health\n`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;