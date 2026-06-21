'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Minus, Plus, ChevronLeft, ChevronRight, Truck, ShieldCheck, HeadphonesIcon, Send, Share2, Clock, PackageCheck, Toolbox, Camera, X, ImageUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewViewImg, setReviewViewImg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [zoom, setZoom] = useState({ show: false, x: 0, y: 0 });
  const [reviewFilterRating, setReviewFilterRating] = useState(0);
  const [reviewSort, setReviewSort] = useState('recent');
  const [reviewPage, setReviewPage] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setZoom({ show: true, x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
  };

  const handleMouseLeave = () => setZoom({ show: false, x: 0, y: 0 });
  const addItem = useCartStore((s) => s.addItem);
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string; images: string[]; productId: string }) => api.post('/reviews', { productId: data.productId, rating: data.rating, comment: data.comment, images: data.images }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
      setReviewComment('');
      setReviewRating(5);
      setReviewImages([]);
      toast.success('Review submitted!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    },
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data.data),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', product?.id, reviewFilterRating, reviewSort, reviewPage],
    queryFn: () => api.get(`/reviews/product/${product?.id}?page=${reviewPage}&limit=5&sort=${reviewSort}&rating=${reviewFilterRating}`).then(r => r.data),
    enabled: !!product?.id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.categoryId, product?.id],
    queryFn: () => api.get(`/products?category=${product?.categoryId}&limit=10`).then(r => r.data),
    enabled: !!product?.categoryId,
  });
  const relatedProducts = relatedData?.data?.filter((p: any) => p.id !== product?.id) || [];

  if (isLoading) return (
    <div className="container-main animate-fade-in" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <div className="flex flex-col md:flex-row justify-center gap-5">
        <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse md:max-w-md w-full" />
        <div className="space-y-5 flex-1">
          <div className="h-7 bg-gray-100 rounded w-3/4 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-100 rounded w-1/4 animate-pulse" />
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container-main text-center" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <h2 className="text-xl font-bold mb-2">Product not found</h2>
      <Link href="/products" className="text-primary hover:underline text-sm">Back to products</Link>
    </div>
  );

  const images = (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })();
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    addItem({ productId: product.id, title: product.title, image: images[0] || '', price: product.price, qty, stock: product.stock, slug: product.slug });
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    addItem({ productId: product.id, title: product.title, image: images[0] || '', price: product.price, qty, stock: product.stock, slug: product.slug });
    router.push('/checkout');
  };

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReviewImages(prev => [...prev, res.data.data.url]);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeReviewImage = (index: number) => setReviewImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return toast.error('Please write a comment');
    reviewMutation.mutate({ rating: reviewRating, comment: reviewComment, images: reviewImages, productId: product.id });
  };

  return (
    <div className="container-main animate-fade-in" style={{ paddingTop: '20px', paddingBottom: '10px' }}>

      <div className="flex flex-col md:flex-row justify-center gap-5">

        {/* ── Images ── */}
        <div className="relative max-w-md w-full">
          <div
            className="aspect-square bg-gray-50 rounded-sm overflow-hidden mb-3 relative group cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {images[selectedImage] ? (
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.title}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
            )}

            {zoom.show && images[selectedImage] && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle 120px at ${zoom.x}% ${zoom.y}%, rgba(255,255,255,0.12) 0%, transparent 100%)`,
                }}
              />
            )}

            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-error text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">-{discount}%</span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10" aria-label="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10" aria-label="Next">
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {zoom.show && images[selectedImage] && (
            <div
              className="absolute top-0 left-[calc(100%+1rem)] w-full aspect-square rounded-2xl overflow-hidden border border-border bg-white shadow-xl hidden lg:block z-20 pointer-events-none"
              style={{
                backgroundImage: `url(${getImageUrl(images[selectedImage])})`,
                backgroundSize: '200%',
                backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {images.length > 1 && (
            <div className="flex gap-2.5">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md border-1 overflow-hidden transition-all flex-shrink-0 ${i === selectedImage ? 'border-primary shadow-sm' : 'border-border hover:border-gray-300'}`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

          {/* ── Product Info ── */}
        <div className="flex flex-col flex-1 max-w-xl">


          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold mb-1 leading-tight tracking-tight">{product.title}</h1>
              {product.model && (
                <p className="text-sm text-body">{product.model}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
              <span className="hidden sm:inline text-[11px] text-body font-medium">Share:</span>
              <Share2 size={14} className="text-gray-400" />
            </div>
          </div>

          {/* ── Price ── */}
          <div className="mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-xl lg:text-2xl font-semibold text-price">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-base text-body line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
          </div>



          {/* ── Availability ── */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-body text-xs sm:text-sm w-20 sm:w-28 flex-shrink-0">Availability:</span> {product.stock > 0 ? (
              <span className="text-success font-medium text-xs sm:text-sm">In Stock</span>
            ) : (
              <span className="text-error font-medium text-xs sm:text-sm">Out of Stock</span>
            )}
          </div>

          {/* ── Qty + Buttons ── */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-body text-xs sm:text-sm w-24 sm:w-28 flex-shrink-0 whitespace-nowrap">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-2.5 py-2 hover:bg-gray-50 transition-colors" aria-label="Decrease">
                  <Minus size={13} />
                </button>
                <span className="px-3 py-2 text-sm font-medium border-x border-border min-w-[36px] text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-2.5 py-2 hover:bg-gray-50 transition-colors" aria-label="Increase">
                  <Plus size={13} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full sm:flex-1 bg-primary text-white py-2.5 rounded-lg text-xs lg:text-sm font-semibold tracking-wide transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={15} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full sm:flex-1 border-2 border-primary text-primary py-2.5 rounded-lg text-xs lg:text-sm font-semibold tracking-wide transition-all hover:bg-primary hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Buy Now
            </button>
          </div>

          {/* ── Delivery Info ── */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-200 pt-4 mb-4">
            <div className="flex flex-col items-center gap-1.5">
              <Clock size={18} className="text-gray-700" />
              <span className="text-[11px] lg:text-xs text-gray-600 text-center leading-tight">12 - 15 working days</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <PackageCheck size={18} className="text-gray-700" />
              <span className="text-[11px] lg:text-xs text-gray-600 text-center leading-tight">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Toolbox size={18} className="text-gray-700" />
              <span className="text-[11px] lg:text-xs text-gray-600 text-center leading-tight">Easy Installation</span>
            </div>
          </div>

          {/* ── Meta ── */}
          <div className="border-t border-border pt-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-body text-xs sm:text-sm w-20 sm:w-28 flex-shrink-0 whitespace-nowrap">Product Code</span>
              <span className="font-medium text-xs sm:text-sm break-all">{product.sku || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-body text-xs sm:text-sm w-20 sm:w-28 flex-shrink-0 whitespace-nowrap">Category</span>
              <span className="font-medium text-xs sm:text-sm">{product.category?.name || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Details / Specs / Delivery Tabs ── */}
      <section className="mt-12 lg:mt-16">
        <div className="border-b border-border mb-0">
          <div className="flex overflow-x-auto gap-0 -mb-px">
            {[
              { key: 'details', label: 'Details' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'delivery', label: 'Delivery, Service & Warranty' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-xs lg:text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-body hover:text-primary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {activeTab === 'details' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-body leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-lg space-y-3">
              {product.model && (
                <div className="flex items-center gap-4 py-2.5 border-b border-border">
                  <span className="text-xs lg:text-sm font-semibold w-32">Model</span>
                  <span className="text-xs lg:text-sm text-body">{product.model}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-4 py-2.5 border-b border-border">
                  <span className="text-xs lg:text-sm font-semibold w-32">Product Code</span>
                  <span className="text-xs lg:text-sm text-body">{product.sku}</span>
                </div>
              )}
              {product.category?.name && (
                <div className="flex items-center gap-4 py-2.5 border-b border-border">
                  <span className="text-xs lg:text-sm font-semibold w-32">Category</span>
                  <span className="text-xs lg:text-sm text-body">{product.category.name}</span>
                </div>
              )}
              {product.material && (
                <div className="flex items-center gap-4 py-2.5 border-b border-border">
                  <span className="text-xs lg:text-sm font-semibold w-32">Material</span>
                  <span className="text-xs lg:text-sm text-body">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-center gap-4 py-2.5 border-b border-border">
                  <span className="text-xs lg:text-sm font-semibold w-32">Dimensions</span>
                  <span className="text-xs lg:text-sm text-body">{product.dimensions}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-4 py-2.5 border-b border-border">
                  <span className="text-xs lg:text-sm font-semibold w-32">Color</span>
                  <span className="text-xs lg:text-sm text-body">{product.color}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex items-center gap-4 py-2.5 border-b border-border">
                  <span className="text-xs lg:text-sm font-semibold w-32">Weight</span>
                  <span className="text-xs lg:text-sm text-body">{product.weight}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="max-w-lg space-y-4">
              <div className="border border-border rounded-2xl p-5">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><Truck size={16} className="text-primary" /> Delivery</h4>
                <p className="text-xs lg:text-sm text-body leading-relaxed">Estimated delivery time: 12 - 15 working days within Bangladesh. Free local shipping available.</p>
              </div>
              <div className="border border-border rounded-2xl p-5">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Warranty</h4>
                <p className="text-xs lg:text-sm text-body leading-relaxed">This product comes with a 1-year warranty against manufacturing defects.</p>
              </div>
              <div className="border border-border rounded-2xl p-5">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><HeadphonesIcon size={16} className="text-primary" /> Service</h4>
                <p className="text-xs lg:text-sm text-body leading-relaxed">Lifetime support available. Contact us via WhatsApp or email for any issues.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Reviews Section ── */}
      <section className="mt-12 lg:mt-16 border-t border-gray-200 pt-10 lg:pt-14">
        <div className="max-w-4xl mx-auto">
          {/* ── Heading ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Ratings & Reviews <span className="font-normal text-gray-500">of <span className="truncate max-w-[100px] sm:max-w-[200px] inline-block align-bottom">{product.title}</span></span></h2>
            </div>
            {token ? (
              <button onClick={() => setShowReviewModal(true)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                <Star size={14} /> Write a Review
              </button>
            ) : (
              <Link href="/account" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                <Star size={14} /> Log in to Review
              </Link>
            )}
          </div>

          {/* ── Rating Summary Box ── */}
          {product.reviews?.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 p-5 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                <div className="text-center min-w-[120px]">
                  <div className="text-5xl sm:text-6xl font-bold text-gray-900">{product.avgRating?.toFixed(1) || '0.0'}</div>
                  <div className="flex items-center justify-center gap-0.5 mt-1.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={16} className={s <= Math.round(product.avgRating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{product.reviewCount || 0} Ratings</div>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {[5,4,3,2,1].map(star => {
                    const approved = product.reviews?.filter((r: any) => r.status === 'APPROVED') || [];
                    const count = approved.filter((r: any) => r.rating === star).length || 0;
                    const pct = approved.length ? Math.round((count / approved.length) * 100) : 0;
                    return (
                      <button key={star} onClick={() => { setReviewFilterRating(reviewFilterRating === star ? 0 : star); setReviewPage(1); }} className={`flex items-center gap-2 w-full group transition-opacity ${reviewFilterRating === star ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                        <span className="text-xs text-gray-500 w-6 text-right">{star}</span>
                        <Star size={10} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-gray-200 overflow-hidden">
                          <div className="h-full bg-yellow-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Review Modal ── */}
          {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowReviewModal(false)} />
              <form onSubmit={(e) => { handleSubmitReview(e); setShowReviewModal(false); }} className="relative bg-white shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fade-in">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-900">Write a Review</h3>
                  <button type="button" onClick={() => setShowReviewModal(false)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <X size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <span className="text-sm text-gray-600">Your Rating</span>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)} className="p-0.5 transition-transform hover:scale-110">
                        <Star size={24} className={s <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  rows={4}
                  className="w-full border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all mb-4"
                />

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Camera size={15} className="text-gray-500" />
                    <span className="text-xs text-gray-500">Add photos</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {reviewImages.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border border-gray-200 bg-gray-50 group">
                        <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeReviewImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {reviewImages.length < 5 && (
                      <label className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 hover:bg-gray-100 transition-all">
                        {uploadingImages ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <ImageUp size={16} className="text-gray-400" />
                            <span className="text-[10px] text-gray-400 mt-0.5">Upload</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleReviewImageUpload} disabled={uploadingImages} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewMutation.isPending || !reviewComment.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 text-sm font-medium transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {reviewMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Filter / Sort Bar ── */}
          {(reviewsData?.total > 0 || product.reviews?.length > 0) && (
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Product Reviews</h3>
                </div>
              <select
                value={reviewSort}
                onChange={e => { setReviewSort(e.target.value); setReviewPage(1); }}
                className="text-xs border border-gray-300 px-3 py-1.5 text-gray-600 bg-white hover:border-gray-900 transition-all cursor-pointer flex-shrink-0"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          )}

          {/* ── Reviews List ── */}
          {reviewsData?.data?.length > 0 ? (
            <>
              <div>
                {reviewsData.data.map((review: any, idx: number) => {
                  const reviewImagesList = (() => { try { return JSON.parse(review.images || '[]'); } catch { return []; } })();
                  const variantInfo = (() => { try { return JSON.parse(review.variantInfo || '[]'); } catch { return []; } })();
                  const sellerReply = (() => { try { return JSON.parse(review.sellerReply || '[]'); } catch { return []; } })();
                  return (
                    <div key={review.id} className={`p-5 sm:p-6 ${idx > 0 ? 'border-t border-gray-200' : ''}`}>
                      {/* Stars + Date */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {/* User info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</span>
                        {review.isVerifiedPurchase && (
                          <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.5 font-medium">Verified Purchase</span>
                        )}
                        {review.status === 'PENDING' && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 font-medium">Pending</span>
                        )}
                      </div>
                      {/* Comment */}
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>
                      {/* Images */}
                      {reviewImagesList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {reviewImagesList.map((img: string, i: number) => (
                            <button key={i} onClick={() => setReviewViewImg(img)} className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity">
                              <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Variant Info */}
                      {variantInfo.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[11px] text-gray-400">
                          {variantInfo.map((v: any, i: number) => (
                            <span key={i}>{v.name}</span>
                          ))}
                        </div>
                      )}
                      {/* Seller Reply */}
                      {sellerReply.length > 0 && (
                        <div className="seller-reply-wrapper">
                          {sellerReply.map((reply: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 text-xs text-gray-600">
                              <div className="absolute left-3 top-3 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                A
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">Admin</span>
                                </div>
                                <p className="mt-0.5 leading-relaxed text-gray-600">{reply.message}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">{new Date(reply.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Pagination ── */}
              {reviewsData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-600 text-xs hover:border-gray-900 hover:text-gray-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {Array.from({ length: reviewsData.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setReviewPage(p)}
                      className={`w-8 h-8 flex items-center justify-center text-xs border transition-all ${p === reviewPage ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-900'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setReviewPage(p => Math.min(reviewsData.totalPages, p + 1))}
                    disabled={reviewPage === reviewsData.totalPages}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-600 text-xs hover:border-gray-900 hover:text-gray-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}

              {/* ── Image Lightbox ── */}
              {reviewViewImg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setReviewViewImg(null)}>
                  <button onClick={() => setReviewViewImg(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <X size={16} className="text-white" />
                  </button>
                  <img src={getImageUrl(reviewViewImg)} alt="" className="max-w-full max-h-[85vh] object-contain" onClick={e => e.stopPropagation()} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-12 lg:mt-16 border-t border-gray-200 pt-10 lg:pt-14">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {relatedProducts.slice(0, 8).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
