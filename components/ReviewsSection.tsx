'use client';

import React from 'react';
import { ReviewItem } from '@/lib/types';
import { Star, MessageSquareQuote, CheckCircle, MapPin } from 'lucide-react';

interface Props {
  reviews: ReviewItem[];
}

export default function ReviewsSection({ reviews }: Props) {
  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[#0077b6] text-xs sm:text-sm font-black tracking-wider uppercase">
            REAL CUSTOMER REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
            고객님들이 직접 남겨주신 생생한 후기
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            준픽스를 경험하신 고객님들의 100% 실제 평가입니다. 정직한 시공과 확실한 결과로 보답하겠습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Service */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#00b4d8]/10 text-[#0077b6]">
                    {review.serviceType}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-5 italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>

              {/* Author & Region */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#00b4d8]" />
                  {review.customerName}
                </div>
                <div className="text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3" />
                  {review.region}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
