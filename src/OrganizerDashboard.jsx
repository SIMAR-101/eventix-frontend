import { useState, useEffect } from 'react';

function OrganizerDashboard() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // NEW: Venue Form State
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [venueForm, setVenueForm] = useState({ name: '', location: '', totalCapacity: '' });

  useEffect(() => {
    if (localStorage.getItem('organizer_token')) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('Authenticating business credentials...');
    const url = isLoginView ? 'https://eventix-api.onrender.com/api/auth/login' : 'https://eventix-api.onrender.com/api/users';
    const payload = isLoginView ? { email, password } : { name, email, passwordHash: password, role: "ORGANIZER" };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (isLoginView) {
          const data = await response.json();
          localStorage.setItem('organizer_token', data.token);
          setIsLoggedIn(true);
          setMessage('Vault access granted. Welcome to Eventix Business.');
        } else {
          setMessage('Business account registered! 🎉 Please log in.');
          setIsLoginView(true);
        }
        setPassword('');
      } else {
        setMessage(isLoginView ? 'Invalid credentials ❌' : 'Registration failed ❌');
      }
    } catch (error) {
      setMessage('Failed to connect to the cloud server.');
    }
  };

  // NEW: The SaaS API Request
  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setMessage('Deploying venue to the cloud...');
    
    try {
      const token = localStorage.getItem('organizer_token');
      const response = await fetch('https://eventix-api.onrender.com/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: venueForm.name,
          location: venueForm.location,
          totalCapacity: parseInt(venueForm.totalCapacity)
        })
      });

      if (response.ok) {
        setMessage('Venue successfully deployed! 🏢 (Check the main site)');
        setShowVenueForm(false);
        setVenueForm({ name: '', location: '', totalCapacity: '' });
      } else {
        setMessage('Failed to deploy venue. Check permissions.');
      }
    } catch (error) {
      setMessage('Network error while deploying venue.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('organizer_token');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setMessage('Securely logged out of business portal.');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Eventix <span className="text-blue-500">Business</span></h1>
          <p className="text-slate-400">Enterprise Portal for Event Organizers</p>
        </div>

        {isLoggedIn ? (
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-slate-700 pb-4 gap-4">
              <h2 className="text-2xl font-bold text-white">Control Panel</h2>
              <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-5 py-2 rounded-lg transition-colors border border-slate-600">
                Log Out
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600">
                  <h3 className="text-xl font-bold text-white mb-2">Venue Management</h3>
                  
                  {/* NEW: Conditional Form Rendering */}
                  {!showVenueForm ? (
                    <>
                      <p className="text-slate-400 text-sm mb-6">Create and manage your live event spaces across the city.</p>
                      <button onClick={() => setShowVenueForm(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md">
                        + Create New Venue
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleCreateVenue} className="space-y-4 mt-4">
                      <input type="text" placeholder="Venue Name (e.g. Neon Club)" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} required className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="Location (e.g. Sector 26)" value={venueForm.location} onChange={e => setVenueForm({...venueForm, location: e.target.value})} required className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm" />
                      <input type="number" placeholder="Max Capacity (e.g. 500)" value={venueForm.totalCapacity} onChange={e => setVenueForm({...venueForm, totalCapacity: e.target.value})} required className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm" />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded-lg transition-all">Publish</button>
                        <button type="button" onClick={() => setShowVenueForm(false)} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold py-2 rounded-lg transition-all">Cancel</button>
                      </div>
                    </form>
                  )}
               </div>
               
               <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600">
                  <h3 className="text-xl font-bold text-white mb-2">Live Analytics</h3>
                  <p className="text-slate-400 text-sm">Revenue tracking and ticket sales will appear here.</p>
                  <div className="mt-6 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 border-dashed">
                    <span className="text-slate-500 text-sm font-medium">No active sales data</span>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          /* ... Login Form remains the same ... */
          <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">{isLoginView ? 'Business Login' : 'Register Organization'}</h2>
            <form onSubmit={handleAuth} className="space-y-5">
              {!isLoginView && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Organizer / Company Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required={!isLoginView} className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Business Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5">
                {isLoginView ? 'Access Dashboard' : 'Create Organization'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => { setIsLoginView(!isLoginView); setMessage(''); }} className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {isLoginView ? "Register a new organization" : "Already registered? Log in here"}
              </button>
            </div>
          </div>
        )}

        {message && (
            <div className={`mt-6 max-w-md mx-auto p-4 rounded-xl font-medium text-sm text-center ${message.includes('🎉') || message.includes('granted') || message.includes('🏢') ? 'bg-green-900/30 text-green-400 border border-green-800' : message.includes('❌') || message.includes('Failed') ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-slate-700 text-slate-300'}`}>
              {message}
            </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard;