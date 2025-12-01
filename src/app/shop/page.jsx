'use client';

import { Suspense } from 'react';
import ShopContent from './ShopContent';

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
