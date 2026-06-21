'use client';

import Link from 'next/link';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    sku?: string;
    price: number;
    comparePrice?: number;
    images: string;
    avgRating?: number;
    reviewCount?: number;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const images = JSON.parse(product.images || '[]');
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <div className="group relative bg-white">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          {images[0] ? (
            <>
              <img
                src={getImageUrl(images[0])}
                alt={product.title}
                className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${images[1] ? 'group-hover:opacity-0' : ''}`}
                onLoad={() => setImgLoaded(true)}
              />
              {images[1] && (
                <img
                  src={getImageUrl(images[1])}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
          )}

          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-error text-white text-[11px] font-bold px-2.5 py-1 shadow-sm">
              -{discount}%
            </span>
          )}

          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5">Out of Stock</span>
            </div>
          )}


        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold line-clamp-1 mb-0.5 hover:underline transition-all">
            {product.title}
          </h3>
        </Link>

        {product.sku && (
          <p className="text-[11px] mb-1">
            <span className="text-gray-400">Product Code: </span>
            <span className="bg-gray-900 text-white px-1.5 py-0.5 text-[10px] font-mono">{product.sku}</span>
          </p>
        )}

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

      </div>
    </div>
  );
}
