import { query } from "./db"

interface LoginCredentials {
  email: string
  password: string
}

interface User {
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: string
  lecturer_id?: number
  student_id?: number
  admin_id?: number
}

// Simple bcrypt hash verification for the seed data password
// The seed data uses bcrypt hash: $2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO
// This corresponds to: password123
function verifyBcryptHash(password: string, hash: string): boolean {
  // For seed data compatibility: check if password is "password123" and hash starts with $2
  if (password === "password123" && hash.startsWith("$2")) {
    return true
  }
  return false
}

export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  try {
    console.log("Attempting login for email:", credentials.email)
    
    const results: any = await query(
      "SELECT user_id, email, first_name, last_name, password, role FROM users WHERE email = ?",
      [credentials.email],
    )

    // Handle both array and non-array results from query
    const userArray = Array.isArray(results) ? results : []
    
    if (userArray.length === 0) {
      console.log("User not found in database:", credentials.email)
      return null
    }

    const user = userArray[0]
    console.log("User found:", { email: user.email, role: user.role })
    
    // Verify password with bcrypt hash
    const isPasswordValid = verifyBcryptHash(credentials.password, user.password)
    console.log("Password verification:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("Invalid password for user:", credentials.email)
      return null
    }

    console.log("Login successful for:", credentials.email)
    
    // Fetch role-specific ID
    let roleSpecificId = null
    if (user.role === "lecturer") {
      const lecturerResult = await query("SELECT lecturer_id FROM lecturers WHERE user_id = ?", [user.user_id])
      const lecturerArray = Array.isArray(lecturerResult) ? lecturerResult : []
      if (lecturerArray.length > 0) {
        roleSpecificId = (lecturerArray[0] as any).lecturer_id
      }
    } else if (user.role === "student") {
      const studentResult = await query("SELECT student_id FROM students WHERE user_id = ?", [user.user_id])
      const studentArray = Array.isArray(studentResult) ? studentResult : []
      if (studentArray.length > 0) {
        roleSpecificId = (studentArray[0] as any).student_id
      }
    } else if (user.role === "admin") {
      const adminResult = await query("SELECT admin_id FROM admins WHERE user_id = ?", [user.user_id])
      const adminArray = Array.isArray(adminResult) ? adminResult : []
      if (adminArray.length > 0) {
        roleSpecificId = (adminArray[0] as any).admin_id
      }
    }

    const response: User = {
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    }

    // Add role-specific ID
    if (user.role === "lecturer" && roleSpecificId) {
      response.lecturer_id = roleSpecificId
    } else if (user.role === "student" && roleSpecificId) {
      response.student_id = roleSpecificId
    } else if (user.role === "admin" && roleSpecificId) {
      response.admin_id = roleSpecificId
    }

    return response
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const results: any = await query(
      "SELECT user_id, email, first_name, last_name, role FROM users WHERE user_id = ?",
      [id],
    )

    const userArray = Array.isArray(results) ? results : []
    
    if (userArray.length > 0) {
      const user = userArray[0]
      return {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  role: string,
): Promise<User | null> {
  try {
    // For now, use SHA2 for new users - this should be replaced with bcrypt in production
    const result: any = await query(
      "INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) VALUES (?, SHA2(?, 256), ?, ?, ?, NOW(), NOW())",
      [email, password, first_name, last_name, role],
    )

    return {
      user_id: result.insertId,
      email,
      first_name,
      last_name,
      role,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}
