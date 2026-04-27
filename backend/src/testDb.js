const pool = require('./config/db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Conexão com Aiven OK!', rows[0]);
    process.exit(0)
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1)
  }
}

test();