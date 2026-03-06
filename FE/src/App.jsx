import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './page/Home';
import PerfumeDetail from './components/PerfumeDetail';
import Register from './page/Register';
import Login from './page/Login';
import Profile from './page/Profile';
import Admin from './page/Admin';
import Perfumes from './page/Perfumes';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
import PerfumeDetails from './page/PerfumesDetail';
import ProtectedRoute from './components/ProtectedRoute';
import useSessionExpired from './hooks/useSessionExpired';

function App() {
  const [search, setSearch] = useState('');
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  // Setup session expired handler
  useSessionExpired();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/perfume/:id" element={<PerfumeDetails />} />
        <Route path="/perfumes" element={<Perfumes />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;