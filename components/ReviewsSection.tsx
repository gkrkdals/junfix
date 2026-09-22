'use client';

import React from 'react';
import { Star, MapPin } from 'lucide-react';
import type { ReviewItem } from '@/lib/types';

interface Props {
  reviews: ReviewItem[];
}

export default function ReviewsSection({ reviews }: Props) {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-14 sm:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[#0077b6] text-xs sm:text-sm font-bold">고객후기</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">작업을 맡겨주신 고객님의 이야기</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400" aria-label={`별점 ${review.rating}점`}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {review.serviceType && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#00b4d8]/10 text-[#0077b6]">{review.serviceType}</span>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{review.comment}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{review.customerName}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  {review.region && (
                    <>
                      <MapPin className="w-3 h-3" /> {review.region}
                    </>
                  )}
                  {review.date && <span className="ml-1">{review.date}</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
