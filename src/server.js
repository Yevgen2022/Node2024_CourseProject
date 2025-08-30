//server.js
const app = require('./app');
const { initDb, sequelize } = require('./models'); // ← додали

const PORT = process.env.PORT || 3500;

(async () => {
  try {
    await initDb(); // перевіримо підключення до БД
    const server = app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

    // акуратне завершення
    process.on('SIGINT', async () => {
      server.close(async () => {
        try { await sequelize.close(); } catch {}
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('[BOOT] DB init failed:', err);
    process.exit(1); // фейл на старті, щоб не підняти “напівмертвий” сервер
  }
})();


// const app = require('./app');

// const PORT = process.env.PORT || 3500;

// const server = app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });




// // акуратне завершення
// process.on('SIGINT', () => server.close(() => process.exit(0)));

