class AppError extends Error {
    constructor(status, code, message, details = undefined) {
        super(message || code);
        this.name = 'AppError';
        this.status = status;             // HTTP статус (напр., 400/401/409/500)
        this.code = code;                 // короткий машинний код ('BAD_REQUEST', 'EMAIL_TAKEN')
        this.details = details;           // опціональні подробиці для дебагу/клієнта
        Error.captureStackTrace?.(this, this.constructor);
    }
}

// Обгортка для async/await контролерів, щоб не писати try/catch
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { AppError, asyncHandler };
