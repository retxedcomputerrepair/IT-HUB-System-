import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Collectibles from './pages/Collectibles';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import UserManagement from './pages/UserManagement';
import ServiceDesk from './pages/ServiceDesk';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/service-desk" element={<ServiceDesk />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/collectibles" element={<Collectibles />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;