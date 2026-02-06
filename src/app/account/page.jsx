                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                    />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Confirm New Password *</label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '14px 32px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal (Desktop) */}
      {showAddressModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddAddress}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Address Label</label>
                <select
                  value={addressData.label}
                  onChange={(e) => setAddressData({ ...addressData, label: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Street Address *</label>
                <input
                  type="text"
                  value={addressData.street}
                  onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>City *</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>State/Area *</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Postal Code</label>
                  <input
                    type="text"
                    value={addressData.postal_code}
                    onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Phone *</label>
                  <input
                    type="tel"
                    value={addressData.phone}
                    onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>
              <button
                type="submit"
                style={{ width: '100%', padding: '14px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Order Card Component
function OrderCard({ order, formatDate, formatCurrency, getStatusColor, showTracking }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = getStatusColor(order.status);

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div style={{ border: '1px solid #E0E0E0', borderRadius: 12, overflow: 'hidden' }}>
      {/* Order Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: 20, 
          cursor: 'pointer',
          backgroundColor: expanded ? '#FAFAFA' : '#FFFFFF',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>
              Order #{order.order_number}
            </p>
            <p style={{ fontSize: 12, color: '#919191', marginTop: 4 }}>
              {formatDate(order.created_at)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: statusColor.bg,
              color: statusColor.text,
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 6,
              textTransform: 'capitalize'
            }}>
              {order.status}
            </span>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginTop: 8 }}>
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#919191' }}>
          {order.items?.length || 0} item(s) • Click to {expanded ? 'collapse' : 'view details'}
        </p>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E0E0E0' }}>
          {/* Tracking Progress (for active orders) */}
          {showTracking && order.status !== 'cancelled' && (
            <div style={{ padding: 20, backgroundColor: '#F7F7F7' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Order Progress</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {statusSteps.slice(0, -1).map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: index < 3 ? 1 : 'none' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? '#059669' : '#E0E0E0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          border: isCurrent ? '2px solid #B08B5C' : 'none'
                        }}>
                          <Icon size={18} style={{ color: isCompleted ? '#FFFFFF' : '#919191' }} />
                        </div>
                        <p style={{ fontSize: 11, color: isCompleted ? '#059669' : '#919191', fontWeight: isCurrent ? 600 : 400 }}>
                          {step.label}
                        </p>
                      </div>
                      {index < 3 && (
                        <div style={{
                          flex: 1,
                          height: 2,
                          backgroundColor: index < currentStepIndex ? '#059669' : '#E0E0E0',
                          margin: '0 8px 24px'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Order Items</p>
            {order.items?.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: 16, 
                padding: '12px 0',
                borderBottom: index < order.items.length - 1 ? '1px solid #F0F0F0' : 'none'
              }}>
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#F0F0F0',
                  flexShrink: 0
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={24} style={{ color: '#D0D0D0' }} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 4 }}>{item.name}</p>
                  {item.variant && (
                    <p style={{ fontSize: 12, color: '#919191', marginBottom: 4 }}>
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.color && ` • Color: ${item.variant.color}`}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: '#919191' }}>Qty: {item.quantity}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
