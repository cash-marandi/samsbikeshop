'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useSession } from 'next-auth/react';

export default function ProductPageContent({ product: initialProduct, reviews: initialReviews }: { product: any; reviews: any[] }) {
  const { id } = useParams();
  const { data: session } = useSession();
  const { addItem, showToast } = useCart();

  const [product, setProduct] = useState(initialProduct);
  const [reviews, setReviews] = useState(initialReviews);

  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      setHasUserReviewed(reviews.some(review => review.userId === session.user?.id));
    }
  }, [session?.user?.id, reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      showToast('Please log in to submit a review.');
      return;
    }
    if (newReviewRating === 0) {
      showToast('Please select a rating.');
      return;
    }
    if (newReviewComment.trim().length < 5) {
      showToast('Comment must be at least 5 characters long.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newReviewRating, comment: newReviewComment }),
      });

      let result;
      if (response.ok) {
        result = await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit review.');
      }

      showToast('Review submitted successfully!');
      setReviews(prev => [result, ...prev]);
      setNewReviewRating(0);
      setNewReviewComment('');
      setHasUserReviewed(true);

      const productResponse = await fetch(`/api/products/${id}`);
      if (productResponse.ok) {
        const productData = await productResponse.json();
        setProduct(productData);
      }

    } catch (err: any) {
      showToast(err.message || 'Error submitting review.');
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${i < rating ? 'fill-current' : 'text-gray-400'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (!product) {
    return <div className="flex justify-center items-center h-screen text-xl">Product not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <img src={product.image} alt={product.name} className="w-full h-auto rounded-lg shadow-lg" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{product.name}</h1>
          <p className="text-lg text-zinc-400 mb-4">{product.brand}</p>
          <div className="flex items-center space-x-2 mb-4">
            {product.averageRating && renderStars(product.averageRating)}
            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <span className="text-zinc-400 text-sm">({product.reviewCount} reviews)</span>
            )}
             {product.reviewCount === 0 && (
              <span className="text-zinc-500 text-sm">No reviews yet</span>
            )}
          </div>
          <p className="text-2xl font-bold text-blue-500 mb-6">R{product.price}</p>
          <p className="text-zinc-300 mb-8">{product.description}</p>
          
          {!product.isSold ? (
            <button 
              onClick={() => addItem(product)}
              className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:-translate-y-1"
            >
              Add to Cart
            </button>
          ) : (
            <div className="w-full px-8 py-4 bg-zinc-800 text-zinc-500 font-bold rounded-lg text-center">
              Sold Out
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 border-t border-zinc-800 pt-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">Customer Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {session?.user && !hasUserReviewed ? (
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h3 className="text-xl font-bold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-zinc-400 mb-2">Your Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-8 w-8 cursor-pointer ${newReviewRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        onClick={() => setNewReviewRating(star)}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-zinc-400 mb-2">Your Comment</label>
                  <textarea
                    id="comment"
                    rows={4}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-blue-500"
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors disabled:opacity-50"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : session?.user && hasUserReviewed ? (
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 text-zinc-400">
              You have already reviewed this product.
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 text-zinc-400">
              Please log in to write a review.
            </div>
          )}

          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review._id} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">{review.userName}</p>
                    <span className="text-zinc-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {renderStars(review.rating)}
                  <p className="mt-2 text-zinc-300">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 text-zinc-400">
                No reviews yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
