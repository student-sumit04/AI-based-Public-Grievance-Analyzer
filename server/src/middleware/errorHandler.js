export function errorHandler(error, req, res, next) {
  console.error(`[${req.method} ${req.originalUrl}]`, error);

  if (error.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors
    });
  }

  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "Something went wrong",
    details: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}
