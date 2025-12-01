export default function AboutPage() {
  return (
    <div className="container-custom py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p className="text-muted text-lg leading-relaxed">
          We are dedicated to bringing you the finest quality products 
          with exceptional service. Our mission is to make premium 
          shopping accessible to everyone.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Quality First</h3>
          <p className="text-muted">
            We carefully select each product to ensure the highest quality standards.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🤝</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Customer Focus</h3>
          <p className="text-muted">
            Your satisfaction is our priority. We're here to help every step of the way.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
          <p className="text-muted">
            Quick and reliable delivery to your doorstep across Bangladesh.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="bg-white shadow-sm p-8 md:p-12 mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Story</h2>
          <div className="text-muted space-y-4 leading-relaxed">
            <p>
              Founded with a passion for excellence, we started our journey 
              with a simple goal: to provide customers with products they 
              can trust and love.
            </p>
            <p>
              Today, we continue to grow and evolve, always staying true 
              to our core values of quality, integrity, and customer 
              satisfaction. Every product in our collection is chosen 
              with care and attention to detail.
            </p>
            <p>
              We believe that great products should be accessible to everyone, 
              and we work hard to make that a reality for our customers 
              every single day.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
        <p className="text-muted mb-6">
          We'd love to hear from you. Get in touch with our team.
        </p>
        <a href="/contact" className="btn-primary inline-block">
          Contact Us
        </a>
      </div>
    </div>
  );
}
