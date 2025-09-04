const { AppError } = require('../utils/errors');


//Idea: any request to a non-existent URL => will get this error.
function notFoundHandler(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

function errorHandler(err, req, res, next) {
  // If it is not AppError, convert it to 500
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const code = err.code || (status === 500 ? 'INTERNAL' : 'ERROR');
  const message = err.message || (status === 500 ? 'Internal server error' : 'Error');

  // Мінімальна логіка логування
  if (status >= 500) {
    console.error('[ERR]', code, message, { path: req.path, stack: err.stack });
  }

  res.status(status).json({ ok: false, error: { code, message } });
}

module.exports = { notFoundHandler, errorHandler };
