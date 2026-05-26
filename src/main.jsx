import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import OrganizerDashboard from './OrganizerDashboard.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Lane 1: The Consumer Ticketing Interface */}
        <Route path="/" element={<App />} />
        
        {/* Lane 2: The B2B Organizer Portal */}
        <Route path="/organizer" element={<OrganizerDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)