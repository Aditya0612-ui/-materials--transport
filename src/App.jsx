// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'boxicons/css/boxicons.min.css';
import './styles/dashboard.css';

import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import AuthenticatedApp from './components/auth/AuthenticatedApp';

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/*" element={<AuthenticatedApp />} />
            </Routes>
          </div>
        </Router>
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App;
