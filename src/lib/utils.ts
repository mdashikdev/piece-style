export function formatPrice(price: number): string {
  return `৳${price.toLocaleString('en-BD')}`;
}

export function getImageUrl(image: string): string {
  if (!image) return '/placeholder.svg';
  if (image.startsWith('http')) return image;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseUrl}${image}`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
