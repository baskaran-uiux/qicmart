import { PrismaClient } from "../src/generated/prisma"
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)
  const superAdmin = await prisma.user.upsert({ where: { email: 'admin@platform.com' }, update: { password: hashedPassword }, create: { email: 'admin@platform.com', name: 'Super Admin', password: hashedPassword, role: 'SUPER_ADMIN' } })
  const storeOwner = await prisma.user.upsert({ where: { email: 'owner@store.com' }, update: { password: hashedPassword }, create: { email: 'owner@store.com', name: 'John Store Owner', password: hashedPassword, role: 'STORE_OWNER' } })

  const plansData = [
    { name: 'Normal', priceMonthly: 29.0, priceYearly: 290.0, maxProducts: 50, maxStaff: 2, maxStorageMB: 1024, maxOrdersPerMo: 500 },
    { name: 'Pro', priceMonthly: 79.0, priceYearly: 790.0, maxProducts: 1000, maxStaff: 10, maxStorageMB: 5120, maxOrdersPerMo: 5000 },
    { name: 'Enterprise', priceMonthly: 299.0, priceYearly: 2990.0, maxProducts: 100000, maxStaff: 100, maxStorageMB: 51200, maxOrdersPerMo: 100000 },
  ]
  let planId = ''
  for (const p of plansData) {
    const ex = await prisma.subscriptionPlan.findFirst({ where: { name: p.name } })
    if (!ex) { const pl = await prisma.subscriptionPlan.create({ data: p }); if (p.name === 'Pro') planId = pl.id }
    else { if (p.name === 'Pro') planId = ex.id }
  }

  const store = await prisma.store.upsert({
    where: { slug: 'demo' },
    update: { logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=200&fit=crop', description: 'The best products tailored for you.' },
    create: { name: 'Demo SaaS Store', slug: 'demo', ownerId: storeOwner.id, currency: 'USD', description: 'The best products tailored for you.', logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=200&fit=crop' }
  })

  if (planId) {
    const ex = await prisma.subscription.findUnique({ where: { storeId: store.id } })
    if (!ex) await prisma.subscription.create({ data: { storeId: store.id, planId, status: 'ACTIVE', billingCycle: 'MONTHLY', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } })
  }

  // Create categories
  const catsData = [
    { name: 'Clothing', slug: 'clothing' }, { name: 'Electronics', slug: 'electronics' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' }, { name: 'Sports', slug: 'sports' },
    { name: 'Beauty', slug: 'beauty' }, { name: 'Books', slug: 'books' },
  ]
  const catMap: Record<string, string> = {}
  for (const c of catsData) {
    const ex = await prisma.category.findFirst({ where: { storeId: store.id, slug: c.slug } })
    catMap[c.slug] = ex ? ex.id : (await prisma.category.create({ data: { storeId: store.id, ...c } })).id
  }

  // All products
  const allProducts = [
    { name: 'SaaS T-Shirt', slug: 'saas-tshirt', price: 24.99, compareAtPrice: 34.99, stock: 100, catSlug: 'clothing', desc: 'A comfortable cotton t-shirt.', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' },
    { name: 'Pro Hoodie', slug: 'pro-hoodie', price: 59.99, compareAtPrice: 79.99, stock: 80, catSlug: 'clothing', desc: 'Warm, stylish hoodie.', img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800' },
    { name: 'Developer Mug', slug: 'developer-mug', price: 14.99, compareAtPrice: null, stock: 50, catSlug: 'home-kitchen', desc: 'Fuel your coding sessions.', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800' },
    { name: 'Wireless Earbuds', slug: 'wireless-earbuds', price: 89.99, compareAtPrice: 119.99, stock: 30, catSlug: 'electronics', desc: 'Active noise cancellation.', img: 'https://images.unsplash.com/photo-1590658165737-15a047b7c69c?w=800' },
    { name: 'Smart Watch', slug: 'smart-watch', price: 249.99, compareAtPrice: 299.99, stock: 15, catSlug: 'electronics', desc: 'Track fitness and stay connected.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
    { name: 'Yoga Mat', slug: 'yoga-mat', price: 39.99, compareAtPrice: null, stock: 60, catSlug: 'sports', desc: 'Eco-friendly non-slip mat.', img: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800' },
    { name: 'Face Serum', slug: 'face-serum', price: 45.99, compareAtPrice: 59.99, stock: 40, catSlug: 'beauty', desc: 'Vitamin C rejuvenating serum.', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800' },
    { name: 'Design Principles Book', slug: 'design-principles-book', price: 29.99, compareAtPrice: null, stock: 25, catSlug: 'books', desc: 'Learn fundamentals of great design.', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800' },
  ]
  for (const p of allProducts) {
    const ex = await prisma.product.findFirst({ where: { storeId: store.id, slug: p.slug } })
    if (!ex) {
      await prisma.product.create({ data: { storeId: store.id, isActive: true, name: p.name, slug: p.slug, price: p.price, compareAtPrice: p.compareAtPrice, stock: p.stock, categoryId: catMap[p.catSlug], description: p.desc, images: JSON.stringify([p.img]) } })
      console.log('✅ Added', p.name)
    } else {
      await prisma.product.update({ where: { id: ex.id }, data: { categoryId: catMap[p.catSlug], compareAtPrice: p.compareAtPrice } })
      console.log('🔄 Updated', p.name)
    }
  }
  console.log('✅ Seed complete!')
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
