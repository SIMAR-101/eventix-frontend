import { useState, useEffect } from 'react'

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [venues, setVenues] = useState([])

  useEffect(() => {
    fetch('https://eventix-api.onrender.com/api/venues')
      .then(response => response.json())
      .then(data => setVenues(data))
      .catch(error => console.error("Error fetching venues:", error))
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    const user = { name, email, passwordHash: "secret123", role: "CUSTOMER" }

    try {
      const response = await fetch('https://eventix-api.onrender.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })

      if (response.ok) {
        setMessage('User registered successfully! 🎉')
        setName('')
        setEmail('')
      } else {
        setMessage('Something went wrong on the server.')
      }
    } catch (error) {
      setMessage('Failed to connect. Is your Spring Boot engine running?')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans text-gray-900">
      <div className="max-w-5xl w-full">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
            Eventix <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-gray-500 text-lg">Manage users and live venues in real-time.</p>
        </div>
        
        {/* Main Grid: Stacks on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Side: Registration Form */}
          <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Register User</h3>
            
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="jane@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Create Account
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-xl font-medium text-sm ${message.includes('🎉') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
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
                  <div 
                    key={venue.id} 
                    className="bg-white p-5 rounded-xl border-l-4 border-indigo-600 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                  >
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{venue.name}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">📍</span> {venue.location}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">🎟️</span> {venue.totalCapacity} maximum capacity
                      </p>
                    </div>
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