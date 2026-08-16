const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

const connectDB = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log("MySQL connected successfully");
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  } finally {
    connection?.release();
  }
};

module.exports = connectDB;
module.exports.pool = pool;
