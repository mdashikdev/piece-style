import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.menuItem.count();
  if (existing > 0) {
    console.log(`Menu items already exist (${existing}). Skipping seed.`);
    return;
  }

  const rootItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'HOME', href: '/', sortOrder: 0 } }),
    prisma.menuItem.create({ data: { name: 'All Products', href: '/products', sortOrder: 1 } }),
    prisma.menuItem.create({ data: { name: 'ABOUT US', href: '/about', sortOrder: 2 } }),
    prisma.menuItem.create({ data: { name: 'Contact', href: '/contact', sortOrder: 3 } }),
  ]);

  const allProducts = rootItems.find(i => i.name === 'All Products')!;

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
  });

  if (categories.length > 0) {
    await Promise.all(
      categories.map((cat, idx) =>
        prisma.menuItem.create({
          data: {
            name: cat.name,
            href: `/products?category=${cat.slug}`,
            parentId: allProducts.id,
            sortOrder: idx,
          },
        })
      )
    );
  } else {
    const defaultSubItems = [
      { name: 'All Products', href: '/products' },
      { name: 'Blenders', href: '/products?category=blenders' },
      { name: 'Irons', href: '/products?category=irons' },
      { name: 'Kettles', href: '/products?category=kettles' },
      { name: 'Fans', href: '/products?category=fans' },
      { name: 'Rice Cookers', href: '/products?category=rice-cookers' },
    ];
    await Promise.all(
      defaultSubItems.map((item, idx) =>
        prisma.menuItem.create({
          data: { name: item.name, href: item.href, parentId: allProducts.id, sortOrder: idx },
        })
      )
    );
  }

  console.log('Menu items seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
