import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Database } = require('better-sqlite3')
const db = new Database('./prisma/dev.db')
const users = db.prepare('SELECT id, email, role, name FROM "User"').all()
const stores = db.prepare('SELECT id, name, subdomain, "ownerId" FROM "Store"').all()
console.log('USERS:', JSON.stringify(users, null, 2))
console.log('STORES:', JSON.stringify(stores, null, 2))
db.close()
