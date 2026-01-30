'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  Eye, AlertTriangle, UserPlus, Clock, Truck, CreditCard, ArrowUpRight,
  Calendar, RefreshCw, ChevronRight, Star, Crown, BarChart3, PieChart
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/dashboard?period=${period}`);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  
  const getStatusStyle = (status) => ({
    pending: { bg: '#fef3c7', color: '#b45309' },
    confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
    processing: { bg: '#ede9fe', color: '#7c3aed' },
    shipped: { bg: '#cffafe', color: '#0891b2' },
    delivered: { bg: '#d1fae5', color: '#059669' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' }
  }[status] || { bg: '#f3f4f6', color: '#6b7280' });

  const getSegmentStyle = (segment) => ({
    general: { bg: '#6B7280', icon: Users },
    preferred: { bg: '#3B82F6', icon: Star },
    elite: { bg: '#B08B5C', icon: Crown }
  }[segment] || { bg: '#6B7280', icon: Users });

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280' }}>Loading analytics...</p>
        </div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { overview, orders_by_status, daily_revenue, top_products, sales_by_category, payment_distribution, recent_orders, low_stock_products, top_customers, recent_leads, customer_segments } = data;
  
  // Calculate max for charts
  const maxRevenue = Math.max(...daily_revenue.map(d => d.revenue), 1);
  const maxCategoryTotal = Math.max(...sales_by_category.map(c => c.total), 1);
  const totalStatusOrders = orders_by_status.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Welcome back! Here's your store overview.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '10px 16px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={fetchAnalytics} style={{ padding: '10px 16px', backgroundColor: '#B08B5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        {/* Revenue */}
        <div style={{ background: 'linear-gradient(135deg, #B08B5C 0%, #8B6914 100%)', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} style={{ color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', backgroundColor: overview.revenue_growth >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', borderRadius: 20 }}>
              {overview.revenue_growth >= 0 ? <TrendingUp size={14} style={{ color: '#10b981' }} /> : <TrendingDown size={14} style={{ color: '#ef4444' }} />}
              <span style={{ fontSize: 12, fontWeight: 600, color: overview.revenue_growth >= 0 ? '#10b981' : '#ef4444' }}>{overview.revenue_growth}%</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Total Revenue</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{formatCurrency(overview.total_revenue)}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Today: {formatCurrency(overview.revenue_today)}</p>
        </div>

        {/* Orders */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#3b82f620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={24} style={{ color: '#3b82f6' }} />
            </div>
            <span style={{ padding: '4px 10px', backgroundColor: '#f59e0b20', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>{overview.pending_orders} pending</span>
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>Total Orders</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{overview.total_orders}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>Today: {overview.orders_today} • This week: {overview.orders_this_week}</p>
        </div>

        {/* Customers */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#10b98120', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} style={{ color: '#10b981' }} />
            </div>
            <span style={{ padding: '4px 10px', backgroundColor: '#10b98120', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#10b981' }}>+{overview.new_customers_week} this week</span>
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>Total Customers</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{overview.total_customers}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>Returning: {overview.returning_customers}</p>
        </div>

        {/* AOV & Conversion */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, backgroundColor: '#8b5cf620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>Avg Order Value</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{formatCurrency(overview.average_order_value)}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>Conversion: {overview.conversion_rate}%</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16, border: '1px solid #374151', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{overview.total_products}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>Products</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16, border: '1px solid #374151', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{overview.out_of_stock}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>Out of Stock</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16, border: '1px solid #374151', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{overview.low_stock}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>Low Stock</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16, border: '1px solid #374151', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{overview.new_leads}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>New Leads</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16, border: '1px solid #374151', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{formatCurrency(overview.revenue_this_month)}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>This Month</p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Revenue Overview</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#B08B5C', borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Orders</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
            {daily_revenue.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: '60%', height: Math.max((day.revenue / maxRevenue) * 160, 4), backgroundColor: '#B08B5C', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                </div>
                <span style={{ fontSize: 10, color: '#6b7280', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 24 }}>Orders by Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders_by_status.filter(s => s.count > 0).map((status, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#9ca3af', textTransform: 'capitalize' }}>{status.status}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{status.count}</span>
                </div>
                <div style={{ height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(status.count / totalStatusOrders) * 100}%`, backgroundColor: status.color, borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Recent Orders */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, border: '1px solid #374151', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #374151' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ChevronRight size={16} /></Link>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {recent_orders.map((order, i) => {
              const st = getStatusStyle(order.status);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: i < recent_orders.length - 1 ? '1px solid #374151' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>#{order.order_number || order._id?.slice(-8)}</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{order.shipping_address?.name || order.customer_name || 'N/A'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#B08B5C', marginBottom: 4 }}>{formatCurrency(order.total)}</p>
                    <span style={{ fontSize: 11, padding: '3px 8px', backgroundColor: st.bg, color: st.color, borderRadius: 4, textTransform: 'capitalize' }}>{order.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, border: '1px solid #374151', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #374151' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Top Selling Products</h3>
            <Link href="/admin/products" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ChevronRight size={16} /></Link>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {top_products.map((product, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: i < top_products.length - 1 ? '1px solid #374151' : 'none' }}>
                <div style={{ width: 44, height: 44, backgroundColor: '#374151', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {product.image && <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{product.total_sold} sold</p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>{formatCurrency(product.total_revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {/* Low Stock Alert */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, border: '1px solid #374151', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Low Stock Alert</h3>
            </div>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {low_stock_products.length > 0 ? low_stock_products.map((product, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: i < low_stock_products.length - 1 ? '1px solid #374151' : 'none' }}>
                <div style={{ width: 40, height: 40, backgroundColor: '#374151', borderRadius: 8, overflow: 'hidden' }}>
                  {product.image && <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>{product.name}</p>
                </div>
                <span style={{ padding: '4px 10px', backgroundColor: product.stock === 0 ? '#fee2e2' : '#fef3c7', color: product.stock === 0 ? '#dc2626' : '#b45309', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{product.stock} left</span>
              </div>
            )) : <p style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No low stock items</p>}
          </div>
        </div>

        {/* Top Customers */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, border: '1px solid #374151', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #374151' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Top Customers</h3>
            <Link href="/admin/customers" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ChevronRight size={16} /></Link>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {top_customers.map((customer, i) => {
              const seg = getSegmentStyle(customer.segment);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: i < top_customers.length - 1 ? '1px solid #374151' : 'none' }}>
                  <div style={{ width: 36, height: 36, backgroundColor: seg.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <seg.icon size={16} style={{ color: '#fff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{customer.name || 'N/A'}</p>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>{customer.total_orders} orders</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#B08B5C' }}>{formatCurrency(customer.total_spent)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leads */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, border: '1px solid #374151', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus size={18} style={{ color: '#3b82f6' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Abandoned Carts</h3>
            </div>
            <Link href="/admin/leads" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ChevronRight size={16} /></Link>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {recent_leads.length > 0 ? recent_leads.map((lead, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: i < recent_leads.length - 1 ? '1px solid #374151' : 'none' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{lead.name || lead.phone}</p>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>{lead.phone}</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(lead.cart_total)}</p>
              </div>
            )) : <p style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No abandoned carts</p>}
          </div>
        </div>
      </div>

      {/* Customer Segments & Payment Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Customer Segments */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Customer Segments</h3>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'General', count: customer_segments.general, color: '#6B7280', desc: '1 order' },
              { label: 'Preferred', count: customer_segments.preferred, color: '#3B82F6', desc: '2 orders' },
              { label: 'Elite', count: customer_segments.elite, color: '#B08B5C', desc: '3+ orders' }
            ].map((seg, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, backgroundColor: seg.color, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{seg.count}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{seg.label}</p>
                <p style={{ fontSize: 11, color: '#6b7280' }}>{seg.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Payment Methods</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {payment_distribution.map((method, i) => {
              const colors = { bkash: '#E2136E', nagad: '#F6921E', cod: '#10b981', card: '#3b82f6' };
              const totalPayments = payment_distribution.reduce((s, p) => s + p.count, 0);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#9ca3af', textTransform: 'uppercase' }}>{method.method}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{method.count} orders • {formatCurrency(method.total)}</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(method.count / totalPayments) * 100}%`, backgroundColor: colors[method.method] || '#6b7280', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
