'use client';

import ProductCard from './ProductCard';

export default function ProductGrid({ products, title, viewAllLink }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section style={{
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 24px'
    }}>
      {/* Section Header */}
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: 2,
            color: '#0C0C0C',
            textTransform: 'uppercase'
          }}>
            {title}
          </h2>
          
          {viewAllLink && (
            <a 
              href={viewAllLink}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#0C0C0C',
                textDecoration: 'none',
                letterSpacing: 1,
                borderBottom: '1px solid #0C0C0C',
                paddingBottom: 2,
                transition: 'opacity 0.2s'
              }}
            >
              VIEW ALL
            </a>
          )}
        </div>
      )}

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '36px 28px'
      }}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          div {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          div {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
