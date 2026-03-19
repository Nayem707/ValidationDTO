// Load environment variables
require("dotenv").config();
const app = require("./app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Database connection test
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log("\n🛑 Shutting down gracefully...");

  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
async function startServer() {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔐 Auth API available at http://localhost:${PORT}/api/auth`);
    console.log(
      `📊 Health check available at http://localhost:${PORT}/api/health`,
    );
    console.log(
      `📦 Product API available at http://localhost:${PORT}/api/products`,
    );
    console.log(`👲 User API available at http://localhost:${PORT}/api/users`);
    console.log("📝 Environment:", process.env.NODE_ENV || "development");
  });

  // Handle server errors
  server.on("error", (error) => {
    console.error("❌ Server error:", error);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
