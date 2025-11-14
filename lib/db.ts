import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: "localhost" || process.env.DB_HOST,
  port: "3306" || parseInt(process.env.DB_PORT, 10),
  user: "elearnmw_cmstest" || process.env.DB_USER,
  password: "beKS@LxRI[A%" || process.env.DB_PASSWORD,
  database: "elearnmw_cms_test" || process.env.DB_NAME ,
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
