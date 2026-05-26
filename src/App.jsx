import { useState, useEffect } from 'react'

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  
  // NEW: State to hold our list of venues from the database
  const [venues, setVenues] = useState([])

  // NEW: The Radar! This fetches venues from Java the second the page loads
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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Eventix Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Left Side: The Registration Form we already built */}
        <div style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3>Register New User</h3>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required 
              style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required 
              style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '0.8rem', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Register User
            </button>
          </form>
          {message && <p style={{ marginTop: '1rem', fontWeight: 'bold', color: message.includes('🎉') ? 'green' : 'red' }}>{message}</p>}
        </div>

        {/* Right Side: The NEW Venue Display! */}
        <div style={{ flex: 1, padding: '1.5rem', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
          <h3>Available Venues</h3>
          {venues.length === 0 ? (
            <p>Loading venues or no venues found...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {venues.map((venue) => (
                <div key={venue.id} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', borderLeft: '5px solid #646cff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{venue.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>📍 Location: {venue.location}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>🎟️ Capacity: {venue.totalCapacity} seats</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default App