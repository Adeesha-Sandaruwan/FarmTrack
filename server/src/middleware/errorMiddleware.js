const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  let message = err.message || "Something went wrong.";

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found.";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};