'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { getImageUrl } from '@/lib/utils';
import { Download, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => api.get('/reviews/all').then(r => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/reviews/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast.success('Review updated'); },
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast.success('Review deleted'); },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => api.put(`/reviews/${id}/reply`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply sent');
    },
    onError: () => toast.error('Failed to send reply'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-2 md:py-3 px-2 md:px-4">Product</th>
              <th className="text-left py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">User</th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4">Rating</th>
              <th className="text-left py-2 md:py-3 px-2 md:px-4">Comment</th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">Images</th>
              <th className="text-left py-2 md:py-3 px-2 md:px-4">Status</th>
              <th className="text-right py-2 md:py-3 px-2 md:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No reviews found</td></tr>
            ) : (
              data?.map((review: any) => {
                const images = (() => { try { return JSON.parse(review.images || '[]'); } catch { return []; } })();
                const sellerReply = (() => { try { return JSON.parse(review.sellerReply || '[]'); } catch { return []; } })();
                const lastReply = sellerReply.length > 0 ? sellerReply[sellerReply.length - 1] : null;
                return (
                  <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{review.product?.title}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">{review.user?.name}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center text-yellow-500 text-xs md:text-sm">{'★'.repeat(review.rating)}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 max-w-[120px] md:max-w-xs truncate text-xs md:text-sm">{review.comment}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center hidden md:table-cell">
                      {images.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          {images.slice(0, 3).map((img: string, i: number) => (
                            <div key={i} className="relative w-6 h-6 md:w-7 md:h-7 border border-gray-200 bg-gray-50 overflow-hidden group">
                              <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                              <a href={getImageUrl(img)} download className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download size={10} className="text-white" />
                              </a>
                            </div>
                          ))}
                          {images.length > 3 && <span className="text-[10px] text-gray-400">+{images.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4">
                      <select value={review.status} onChange={(e) => updateStatus.mutate({ id: review.id, status: e.target.value })} className="border border-gray-300 rounded px-1.5 md:px-2 py-1 text-[10px] md:text-xs">
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <button onClick={() => { setReplyingTo(replyingTo === review.id ? null : review.id); setReplyText(lastReply?.message || ''); }} className={`text-[10px] md:text-xs hover:underline flex items-center gap-1 ${lastReply ? 'text-green-600' : 'text-gray-500'}`}>
                          <MessageCircle size={10} />
                          {lastReply ? 'Edit Reply' : 'Reply'}
                        </button>
                        <button onClick={() => { if (confirm('Delete review?')) deleteReview.mutate(review.id); }} className="text-red-500 text-[10px] md:text-xs hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        </div>

        {/* Reply Modal */}
        {replyingTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => { setReplyingTo(null); setReplyText(''); }} />
            <div className="relative bg-white w-full max-w-md p-6 shadow-2xl">
              <h3 className="text-base font-semibold mb-4">Admin Reply</h3>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
                className="w-full border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-900 mb-4"
              />
              <div className="flex items-center gap-3">
                <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="flex-1 border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => replyMutation.mutate({ id: replyingTo, message: replyText })}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 text-sm font-medium transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
