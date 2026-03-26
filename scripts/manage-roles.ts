import { PrismaClient } from "../src/generated/prisma"
import readline from "readline"

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string) => new Promise<string>((resolve) => rl.question(query, resolve))

async function main() {
  console.log("--- Qicmart Role Manager ---")
  
  const email = await question("Enter user email: ")
  if (!email) {
    console.error("Email is required")
    process.exit(1)
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  })

  if (!user) {
    console.error(`User with email ${email} not found.`)
    process.exit(1)
  }

  console.log(`Current Role: ${user.role}`)
  const roles = ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "STORE_OWNER"]
  console.log(`Available Roles: ${roles.join(", ")}`)
  
  const newRole = await question(`Enter new role for ${user.email}: `)
  const roleUpper = newRole.toUpperCase().trim()

  if (!roles.includes(roleUpper)) {
    console.error("Invalid role. Please choose from: " + roles.join(", "))
    process.exit(1)
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: { role: roleUpper }
    })

    console.log(`Successfully updated ${updatedUser.email} to role: ${updatedUser.role}`)
  } catch (error) {
    console.error("Failed to update user role:", error)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

main()
