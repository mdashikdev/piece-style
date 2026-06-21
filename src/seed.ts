import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@piecestyle.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@piecestyle.com', password: adminHash, role: 'ADMIN' },
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Blenders & Mixers', slug: 'blenders-mixers', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Irons & Garment Care', slug: 'irons-garment-care', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Kettles & Heaters', slug: 'kettles-heaters', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Fans & Cooling', slug: 'fans-cooling', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Rice Cookers', slug: 'rice-cookers', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Kitchen Appliances', slug: 'kitchen-appliances', sortOrder: 6 } }),
  ]);

  const products = [
    { title: 'Professional Blender 1500W', slug: 'professional-blender-1500w', description: 'High-performance blender with 1500W motor, 6 stainless steel blades, and 2L BPA-free jar. Perfect for smoothies, soups, and crushing ice.', price: 4500, comparePrice: 5500, sku: 'BL-1500', stock: 50, categoryId: categories[0].id, featured: true },
    { title: 'Hand Mixer 5-Speed', slug: 'hand-mixer-5-speed', description: 'Ergonomic hand mixer with 5 speed settings, turbo function, and stainless steel beaters. Includes storage case.', price: 1800, comparePrice: 2200, sku: 'HM-500', stock: 75, categoryId: categories[0].id, featured: true },
    { title: 'Steam Iron 2400W', slug: 'steam-iron-2400w', description: 'Powerful steam iron with ceramic soleplate, anti-drip system, and self-cleaning function. Continuous steam up to 40g/min.', price: 2200, comparePrice: 2800, sku: 'SI-2400', stock: 60, categoryId: categories[1].id, featured: true },
    { title: 'Garment Steamer Handheld', slug: 'garment-steamer-handheld', description: 'Portable handheld garment steamer with 30s heat-up, 150ml water tank, and brush attachment. Removes wrinkles quickly.', price: 1600, sku: 'GS-100', stock: 45, categoryId: categories[1].id },
    { title: 'Electric Kettle 1.7L', slug: 'electric-kettle-1-7l', description: 'Stainless steel electric kettle with 1.7L capacity, 2200W fast boil, auto shut-off, and boil-dry protection.', price: 1200, comparePrice: 1500, sku: 'EK-1700', stock: 100, categoryId: categories[2].id, featured: true },
    { title: 'Water Heater Immersion 1500W', slug: 'water-heater-immersion-1500w', description: 'Immersion water heater with 1500W, copper heating element, and heat-resistant handle. Portable and easy to use.', price: 450, sku: 'WH-1500', stock: 200, categoryId: categories[2].id },
    { title: 'Standing Fan 16-inch', slug: 'standing-fan-16-inch', description: '16-inch standing fan with 3 speed settings, oscillation, adjustable height, and quiet operation. Ideal for home and office.', price: 2800, comparePrice: 3500, sku: 'SF-1600', stock: 40, categoryId: categories[3].id, featured: true },
    { title: 'Ceiling Fan 56-inch', slug: 'ceiling-fan-56-inch', description: '56-inch ceiling fan with 3 blades, remote control, 6 speed settings, and energy-efficient DC motor. Modern design.', price: 5500, sku: 'CF-5600', stock: 25, categoryId: categories[3].id },
    { title: 'Rice Cooker 1.8L', slug: 'rice-cooker-1-8l', description: 'Automatic rice cooker with 1.8L capacity (10 cups), non-stick inner pot, keep-warm function, and steamer basket included.', price: 3200, comparePrice: 3800, sku: 'RC-1800', stock: 35, categoryId: categories[4].id, featured: true },
    { title: 'Rice Cooker 2.5L', slug: 'rice-cooker-2-5l', description: 'Large capacity rice cooker with 2.5L (15 cups), digital display, multiple cooking programs, and 24-hour timer.', price: 4800, sku: 'RC-2500', stock: 20, categoryId: categories[4].id },
    { title: 'Electric Oven 42L', slug: 'electric-oven-42l', description: '42L electric oven with 1500W, temperature control, 60-minute timer, and 4 heating modes. Bake, roast, and grill.', price: 6500, comparePrice: 7800, sku: 'EO-4200', stock: 15, categoryId: categories[5].id, featured: true },
    { title: 'Juice Extractor 500W', slug: 'juice-extractor-500w', description: '500W juice extractor with stainless steel filter, 1L juice jug, and 2L pulp container. Easy to clean.', price: 3500, sku: 'JE-500', stock: 30, categoryId: categories[5].id },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p as any,
    });
  }

  const { Prisma } = await import('@prisma/client');
  console.log('Sample products created');

  const coupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrder: 1000, maxUses: 100, expiresAt: new Date('2026-12-31'), active: true },
  });
  console.log('Coupon created:', coupon.code);

  console.log('Seed complete!');
  console.log('Admin login: admin@piecestyle.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
