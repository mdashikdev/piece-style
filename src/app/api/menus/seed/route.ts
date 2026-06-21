import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/server/errors';

export async function POST() {
  try {
    const existing = await prisma.menuItem.count();
    if (existing > 0) {
      return NextResponse.json({ success: false, message: `Menu items already exist (${existing}). Delete them first to reseed.` });
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
            data: { name: cat.name, href: `/collection/${cat.slug}`, parentId: allProducts.id, sortOrder: idx },
          })
        )
      );
    } else {
      const fallbackItems = [
        { name: 'All Products', href: '/products' },
        { name: 'Blenders', href: '/collection/blenders' },
        { name: 'Irons', href: '/collection/irons' },
        { name: 'Kettles', href: '/collection/kettles' },
        { name: 'Fans', href: '/collection/fans' },
        { name: 'Rice Cookers', href: '/collection/rice-cookers' },
      ];
      await Promise.all(
        fallbackItems.map((item, idx) =>
          prisma.menuItem.create({
            data: { name: item.name, href: item.href, parentId: allProducts.id, sortOrder: idx },
          })
        )
      );
    }

    return NextResponse.json({ success: true, message: 'Menu items seeded successfully!' });
  } catch (err) { return handleError(err); }
}
