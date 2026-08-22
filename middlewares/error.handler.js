const { config } = require("../config/config");

// Deja rastro en los logs de pm2 con la ruta que fallo.
function logErrors(err, req, res, next) {
  console.error(`[${req.method} ${req.originalUrl}]`, err?.message || err);
  next(err);
}

// Los errores de Boom (los que lanza validatorHandler y los servicios)
// ya traen su propio status: 400 para validacion, 404 para no encontrado.
function boomErrorHandler(err, req, res, next) {
  if (err?.isBoom) {
    const { output } = err;
    return res.status(output.statusCode).json(output.payload);
  }
  next(err);
}

// Ultimo recurso. Sin este middleware Express responde con el stack trace
// completo, incluidas las rutas absolutas del servidor.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err?.status || err?.statusCode || 500;
  res.status(status).json({
    statusCode: status,
    error: status >= 500 ? "Internal Server Error" : "Request Error",
    message: config.isProd && status >= 500 ? "Internal Server Error" : err?.message,
  });
}

module.exports = { logErrors, boomErrorHandler, errorHandler };
