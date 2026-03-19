const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./store/routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

// Custom Morgan tokens for colorized logging
morgan.token("status-colored", (req, res) => {
  const status = res.statusCode;
  let color;
  if (status >= 500)
    color = 31; // Red
  else if (status >= 400)
    color = 33; // Yellow
  else if (status >= 300)
    color = 36; // Cyan
  else if (status >= 200)
    color = 32; // Green
  else color = 0; // Default
  return `\x1b[${color}m${status}\x1b[0m`;
});

morgan.token("method-colored", (req, res) => {
  const method = req.method;
  const methodColors = {
    GET: 32, // Green
    POST: 34, // Blue
    PUT: 33, // Yellow
    DELETE: 31, // Red
    PATCH: 35, // Magenta
  };
  const color = methodColors[method] || 37; // White default

  return `\x1b[${color}m${method}\x1b[0m`;
});

// Optimized logging format
app.use(morgan("[:status-colored][:response-time ms][:method-colored]:url"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api", routes);

// 404 Handler - Must come before global error handler
app.use(notFoundHandler);

// Global Error Handler - Must be last middleware
app.use(errorHandler);

module.exports = app;
