import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const categorySlug = searchParams.get('categorySlug');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const featured = searchParams.get('featured');
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };
    if (category) where.categoryId = category;
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
      if (cat) where.categoryId = cat.id;
      else return NextResponse.json({ success: true, data: [], total: 0, page, limit, totalPages: 0 });
    }
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'name') orderBy = { title: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: limit, orderBy,
        include: { category: true, variants: true, reviews: { where: { status: 'APPROVED' }, select: { rating: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map(p => {
      const avgRating = p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0;
      const { reviews, ...rest } = p;
      return { ...rest, avgRating, reviewCount: p.reviews.length };
    });

    return NextResponse.json({
      success: true, data: productsWithRating, total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const body = await req.json();
    const { title, description, price, comparePrice, sku, stock, images, featured, status, categoryId, variants } = body;
    const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await prisma.product.create({
      data: {
        title, slug, description, price, comparePrice, sku, stock: stock || 0,
        images: JSON.stringify(images || []), featured: featured || false, status: status || 'ACTIVE', categoryId,
        variants: variants ? { createMany: { data: variants } } : undefined,
      },
      include: { category: true, variants: true },
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) { return handleError(err); }
}
