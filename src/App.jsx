import { useState, useEffect } from 'react'

function App() {
  const [isLoginView, setIsLoginView] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [venues, setVenues] = useState([])

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true)
    }

    fetch('https://eventix-api.onrender.com/api/venues')
      .then(response => response.json())
      .then(data => setVenues(data))
      .catch(error => console.error("Error fetching venues:", error))
  }, [])

  // --- NEW: THE RAZORPAY FINANCIAL PIPELINE ---
  const handlePayment = async (venue) => {
    if (!isLoggedIn) {
      setMessage('⚠️ You must log in to the secure vault before booking tickets.');
      return;
    }

    setMessage(`Initiating secure payment for ${venue.name}...`);

    try {
      // 1. Securely generate the Order ID from Java
      const response = await fetch('https://eventix-api.onrender.com/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500 })
      });
      
      const orderData = await response.json();

      // 2. Configure the Razorpay UI
      const options = {
        key: "rzp_test_StupzHeF15gWsp", // Your verified key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Eventix Dashboard",
        description: `VIP Ticket - ${venue.name}`,
        order_id: orderData.id,
        handler: async function (response) {
          // --- THE FINAL HANDSHAKE ---
          setMessage(`Payment Verified! 🎉 Saving your ticket to the cloud...`);

          try {
            const token = localStorage.getItem('token');
            const saveResponse = await fetch('https://eventix-api.onrender.com/api/bookings/confirm', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ 
                amount: 500, 
                paymentId: response.razorpay_payment_id 
              })
            });

            if (saveResponse.ok) {
              setMessage(`Ticket Confirmed! 🎟️ Your booking is saved. Receipt: ${response.razorpay_payment_id}`);
            } else {
              setMessage('Payment Success, but database save failed. Contact support with your Receipt ID.');
            }
          } catch (error) {
            setMessage('Network error while saving your ticket.');
          }
        },
        theme: { color: "#4f46e5" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Error:", error);
      setMessage('Payment failed. Ensure your Java backend is live on Render!');
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setMessage('Processing...')

    const url = isLoginView ? 'https://eventix-api.onrender.com/api/auth/login' : 'https://eventix-api.onrender.com/api/users'
    const payload = isLoginView ? { email, password } : { name, email, passwordHash: password, role: "CUSTOMER" }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        if (isLoginView) {
          const data = await response.json()
          localStorage.setItem('token', data.token) 
          setIsLoggedIn(true)
          setMessage('Login successful! 🎉 Welcome to the vault.')
        } else {
          setMessage('Account created! 🎉 Please log in with your new password.')
          setIsLoginView(true)
        }
        setPassword('') 
      } else {
        setMessage(isLoginView ? 'Invalid email or password ❌' : 'Registration failed ❌')
      }
    } catch (error) {
      setMessage('Failed to connect to the cloud server.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setMessage('You have been securely logged out.')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans text-gray-900">
      <div className="max-w-5xl w-full">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
            Eventix <span className="text-indigo-600">Secure</span>
          </h1>
          <p className="text-gray-500 text-lg">Enterprise-grade JWT Authentication & Payments</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Side: Auth Controller */}
          <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
            {isLoggedIn ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔐</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Authenticated</h3>
                <p className="text-gray-500 mb-6">Your JWT token is securely stored in browser memory.</p>
                <button onClick={handleLogout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl transition-all">
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{isLoginView ? 'Welcome Back' : 'Create Account'}</h3>
                <form onSubmit={handleAuth} className="space-y-5">
                  {!isLoginView && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required={!isLoginView} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5">
                    {isLoginView ? 'Secure Login' : 'Register Now'}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button onClick={() => { setIsLoginView(!isLoginView); setMessage(''); }} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                    {isLoginView ? "Don't have an account? Register here." : "Already have an account? Log in."}
                  </button>
                </div>
              </>
            )}

            {message && (
              <div className={`mt-6 p-4 rounded-xl font-medium text-sm text-center ${message.includes('🎉') || message.includes('🔐') ? 'bg-green-50 text-green-700' : message.includes('❌') || message.includes('⚠️') ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Right Side: Venue Display */}
          <div className="flex-1 bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Live Venues</h3>
            
            {venues.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 bg-white/50 rounded-xl border border-dashed border-indigo-200">
                <p className="text-indigo-400 font-medium animate-pulse">Scanning cloud database...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.map((venue) => (
                  <div key={venue.id} className="bg-white p-5 rounded-xl border-l-4 border-indigo-600 shadow-sm hover:shadow-md transition-all group">
                    <h4 className="text-lg font-bold text-gray-900">{venue.name}</h4>
                    <div className="mt-2 space-y-1 mb-4">
                      <p className="text-sm text-gray-600">📍 {venue.location}</p>
                      <p className="text-sm text-gray-600">🎟️ {venue.totalCapacity} capacity</p>
                    </div>
                    {/* THE NEW PAYMENT BUTTON */}
                    <button 
                      onClick={() => handlePayment(venue)}
                      className="w-full bg-gray-900 hover:bg-black text-white text-sm font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      Book VIP Ticket (₹500)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default App