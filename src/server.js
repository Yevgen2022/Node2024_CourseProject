const app = require('./app');

const PORT = process.env.PORT || 3500;

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// акуратне завершення
process.on('SIGINT', () => server.close(() => process.exit(0)));
