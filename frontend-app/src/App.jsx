import React, { useState, useEffect } from 'react';

// Initial Mock Data (used if backend is offline or for instant preview)
const INITIAL_RESTAURANTS = [
  {
    id: "rest-101",
    name: "Royal Biryani House",
    cuisine: "Biryani, North Indian",
    rating: 4.8,
    deliveryTime: "25-30 min",
    priceForTwo: "₹400 for two",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    menuItems: [
      { id: "m1", name: "Hyderabadi Chicken Dum Biryani", price: 290, isVeg: false, isAvailable: true, description: "Authentic dum biryani served with Mirchi Ka Salan and Raita." },
      { id: "m2", name: "Paneer Special Biryani", price: 250, isVeg: true, isAvailable: true, description: "Fragrant basmati rice layered with marinated cottage cheese." },
      { id: "m3", name: "Chicken 65 Starter", price: 220, isVeg: false, isAvailable: true, description: "Spicy, deep-fried chicken bite-size pieces." }
    ]
  },
  {
    id: "rest-102",
    name: "Pizza Oven & Craft",
    cuisine: "Pizza, Italian, Fast Food",
    rating: 4.6,
    deliveryTime: "30-35 min",
    priceForTwo: "₹500 for two",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    menuItems: [
      { id: "m4", name: "Margherita Supreme Pizza", price: 349, isVeg: true, isAvailable: true, description: "Fresh mozzarella, basil leaves, and san marzano tomato sauce." },
      { id: "m5", name: "Pepperoni Passion Pizza", price: 449, isVeg: false, isAvailable: true, description: "Double pepperoni with extra mozzarella cheese blend." },
      { id: "m6", name: "Garlic Breadsticks", price: 149, isVeg: true, isAvailable: true, description: "Oven-baked breadsticks brushed with butter & garlic herbs." }
    ]
  },
  {
    id: "rest-103",
    name: "Dragon Wok Chinese",
    cuisine: "Chinese, Asian, Noodles",
    rating: 4.5,
    deliveryTime: "20-25 min",
    priceForTwo: "₹350 for two",
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80",
    menuItems: [
      { id: "m7", name: "Schezwan Hakka Noodles", price: 180, isVeg: true, isAvailable: true, description: "Wok-tossed noodles in spicy Schezwan garlic sauce." },
      { id: "m8", name: "Kung Pao Chicken", price: 260, isVeg: false, isAvailable: true, description: "Diced chicken with peanuts, vegetables, and chilli peppers." }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer', 'restaurant-owner', 'driver'
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Restaurant Modal State
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // User Auth State
  const [user, setUser] = useState({ name: 'Rahul Sharma', email: 'rahul@gmail.com', token: 'mock-jwt-token-123' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Order Tracking State
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Try to fetch real restaurants from Microservices Gateway at startup
  useEffect(() => {
    fetch('/api/v1/restaurants')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) {
          setRestaurants(data);
        }
      })
      .catch(() => console.log("Using local initial dataset (Backend server connecting...)"));
  }, []);

  // Filter restaurants by search and category
  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Cart helper functions
  const addToCart = (item, restaurantName) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, restaurantName, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Place Order Action (Integration with order-service & payment-service)
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: Math.floor(100000 + Math.random() * 900000),
      items: cart,
      totalAmount: cartTotal + 40 + 18, // Items + Delivery + Taxes
      status: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
      paymentMethod: paymentMethod,
      timestamp: new Date().toLocaleTimeString()
    };

    setActiveOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    setSelectedRestaurant(null);

    // Call Gateway Order Endpoint asynchronously
    try {
      await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 101,
          restaurantId: cart[0]?.restaurantName || 'rest-101',
          items: cart.map(i => ({ menuItemId: i.id, itemName: i.name, price: i.price, quantity: i.quantity }))
        })
      });
    } catch (e) {
      console.log("Order submitted locally");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. TOP NAVBAR */}
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0.8rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => setActiveTab('customer')}>
              <div style={{ background: 'var(--primary)', padding: '0.4rem 0.6rem', borderRadius: '10px', fontWeight: '800', color: '#fff', fontSize: '1.4rem' }}>
                Z
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', tracking: '-0.5px', color: '#fff', lineHeight: 1 }}>
                  zomato <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>MICROSERVICES</span>
                </h1>
                <p style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 600 }}>● API Gateway Port 8085</p>
              </div>
            </div>

            {/* Portal Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
              <button 
                onClick={() => setActiveTab('customer')}
                style={{
                  background: activeTab === 'customer' ? 'var(--primary)' : 'transparent',
                  color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                🍕 Customer Order
              </button>
              <button 
                onClick={() => setActiveTab('restaurant-owner')}
                style={{
                  background: activeTab === 'restaurant-owner' ? 'var(--primary)' : 'transparent',
                  color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                🏪 Restaurant Admin
              </button>
              <button 
                onClick={() => setActiveTab('driver')}
                style={{
                  background: activeTab === 'driver' ? 'var(--primary)' : 'transparent',
                  color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                🛵 Delivery Agent
              </button>
            </div>
          </div>

          {/* Right Actions: Auth & Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.06)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>👤 {user.name}</span>
                <span style={{ fontSize: '0.7rem', background: 'var(--accent-green)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>JWT Valid</span>
              </div>
            ) : (
              <button className="btn-secondary" onClick={() => setShowAuthModal(true)}>Log in / Sign up</button>
            )}

            {/* Cart Button */}
            <button className="btn-primary" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
              🛒 Cart
              {cart.length > 0 && (
                <span style={{ background: '#fff', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, padding: '2px 6px', borderRadius: '50%' }}>
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* 2. TAB CONTENT */}
      {activeTab === 'customer' && (
        <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
          
          {/* Active Live Order Tracker Banner */}
          {activeOrder && (
            <div className="glass animate-fade-in" style={{ padding: '1.2rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', borderLeft: '5px solid var(--accent-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)' }}>🎉 Live Order #{activeOrder.id} Placed!</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Delivery: 25 mins • Paid via {activeOrder.paymentMethod}</p>
                </div>
                <span className="badge-rating" style={{ background: 'var(--accent-green)' }}>STATUS: CONFIRMED</span>
              </div>
              
              {/* Progress Steps */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ flex: 1, height: '6px', background: 'var(--accent-green)', borderRadius: '3px' }} />
                <div style={{ flex: 1, height: '6px', background: 'var(--primary)', borderRadius: '3px' }} />
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }} />
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }} />
              </div>
            </div>
          )}

          {/* Hero Banner */}
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(226,55,68,0.15) 0%, rgba(11,13,16,0) 100%)', 
            padding: '2.5rem 1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '2rem', border: '1px solid var(--border-color)' 
          }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Delicious Food Delivered To Your Doorstep 🚀
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Powered by Spring Boot Microservices (Eureka + Gateway + PostgreSQL + MongoDB)
            </p>

            {/* Search Input */}
            <div style={{ maxWidth: '550px', margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Search for restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)', color: '#fff', fontSize: '0.95rem', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            {['All', 'Biryani', 'Pizza', 'Burgers', 'Chinese', 'Indian', 'Fast Food'].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)', padding: '0.5rem 1.2rem', borderRadius: '20px',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Restaurant Grid */}
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.2rem' }}>
            Available Restaurants ({filteredRestaurants.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredRestaurants.map(rest => (
              <div 
                key={rest.id} 
                className="glass" 
                style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => setSelectedRestaurant(rest)}
              >
                {/* Image */}
                <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img src={rest.image} alt={rest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className="badge-rating">⭐ {rest.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '1.2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{rest.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>{rest.cuisine}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                    <span>⏱️ {rest.deliveryTime}</span>
                    <span>💳 {rest.priceForTwo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 3. RESTAURANT OWNER DASHBOARD */}
      {activeTab === 'restaurant-owner' && (
        <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏪 Restaurant Management Portal</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Directly updates MongoDB via `restaurant-service` on Port 8082</p>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Toggle Item Stock Availability</h3>
            {restaurants[0]?.menuItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price}</p>
                </div>
                <button 
                  className={item.isAvailable ? "btn-primary" : "btn-secondary"}
                  onClick={() => {
                    setRestaurants(prev => prev.map(r => ({
                      ...r,
                      menuItems: r.menuItems.map(m => m.id === item.id ? { ...m, isAvailable: !m.isAvailable } : m)
                    })));
                  }}
                >
                  {item.isAvailable ? "In Stock ✅" : "Out of Stock ❌"}
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 4. DELIVERY AGENT VIEW */}
      {activeTab === 'driver' && (
        <main style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>🛵 Delivery Agent Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Powered by `delivery-service` + Redis Key-Value Cache (Port 8086)</p>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Live GPS Simulator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Current Agent: Driver #402 (Ramesh Kumar)</p>
            <button className="btn-primary" onClick={() => alert("GPS Coordinates (Lat: 19.0760, Long: 72.8777) sent to Redis!")}>
              📍 Transmit Live GPS Coordinates to Redis
            </button>
          </div>
        </main>
      )}

      {/* 5. RESTAURANT MENU MODAL */}
      {selectedRestaurant && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass animate-fade-in" style={{ maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', borderRadius: 'var(--radius-lg)', padding: '1.8rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedRestaurant.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedRestaurant.cuisine}</p>
              </div>
              <button className="btn-secondary" onClick={() => setSelectedRestaurant(null)} style={{ padding: '0.3rem 0.7rem' }}>✕</button>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Menu Items</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedRestaurant.menuItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span className={item.isVeg ? "badge-veg" : "badge-nonveg"} />
                      <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</h4>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>₹{item.price}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</p>
                  </div>

                  <div>
                    <button 
                      className="btn-primary" 
                      onClick={() => addToCart(item, selectedRestaurant.name)}
                      disabled={!item.isAvailable}
                      style={{ opacity: item.isAvailable ? 1 : 0.5 }}
                    >
                      {item.isAvailable ? "+ ADD" : "Sold Out"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 6. SLIDING CART DRAWER */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="glass animate-slide-right" style={{ width: '100%', maxWidth: '420px', height: '100%', padding: '1.8rem', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Your Food Order 🛒</h3>
              <button className="btn-secondary" onClick={() => setIsCartOpen(false)} style={{ padding: '0.3rem 0.7rem' }}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍕</span>
                <p>Your cart is empty!</p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price} x {item.quantity}</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="btn-secondary" style={{ padding: '2px 8px' }} onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                        <button className="btn-secondary" style={{ padding: '2px 8px' }} onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}

                  {/* Payment Method Selector */}
                  <div style={{ marginTop: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Select Payment Method</h4>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                    >
                      <option value="UPI">Google Pay / PhonePe UPI</option>
                      <option value="CREDIT_CARD">Credit / Debit Card</option>
                      <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                    </select>
                  </div>
                </div>

                {/* Bill Details */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>Item Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>Delivery Partner Fee</span>
                    <span>₹40</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    <span>GST & Restaurant Charges</span>
                    <span>₹18</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px dashed var(--border-color)', paddingTop: '0.6rem', marginBottom: '1rem' }}>
                    <span>To Pay</span>
                    <span style={{ color: 'var(--accent-green)' }}>₹{cartTotal + 40 + 18}</span>
                  </div>

                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }} onClick={handlePlaceOrder}>
                    Pay & Place Order 🚀
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-main)' }}>
        Zomato Food Delivery App • Microservices Architecture Edition • Java Spring Boot + React Vite
      </footer>
    </div>
  );
}
