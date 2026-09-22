'use client';

import React from 'react';
import { Star, MapPin } from 'lucide-react';
import type { ReviewItem } from '@/lib/types';
import SectionHeader from './SectionHeader';

interface Props {
  reviews: ReviewItem[];
}

export default function ReviewsSection({ reviews }: Props) {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="section bg-white border-t border-slate-200">
      <div className="container-x">
        <SectionHeader label="고객후기" title="작업을 맡겨주신 고객님의 이야기" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {reviews.map((review) => (
            <div key={review.id} className="card h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex text-amber-400" aria-label={`별점 ${review.rating}점`}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                {review.serviceType && <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-brand">{review.serviceType}</span>}
              </div>
              <p className="card-desc text-ink line-clamp-4 whitespace-pre-line">{review.comment}</p>
              <div className="mt-auto pt-3 flex items-center justify-between text-[12px] text-muted">
                <span className="font-bold text-navy">{review.customerName}</span>
                <span className="flex items-center gap-1">
                  {review.region && (
                    <>
                      <MapPin className="w-3 h-3" /> {review.region}
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
