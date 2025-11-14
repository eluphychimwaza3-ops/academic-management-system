import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "elearnmw_cmstest",
  password: process.env.DB_PASSWORD || "beKS@LxRI[A%",
  database: process.env.DB_NAME || "elearnmw_cms_test",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query(sql: string, values?: any[]) {
  try {
    const connection = await pool.getConnection()
    const [results] = await connection.execute(sql, values || [])
    connection.release()
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export default pool
