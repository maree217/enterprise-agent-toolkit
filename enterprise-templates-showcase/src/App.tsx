import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, PlanPage } from './pages';
import EnterpriseTemplatesPage from './pages/EnterpriseTemplatesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnterpriseTemplatesPage />} />
        <Route path="/original" element={<HomePage />} />
        <Route path="/plan/:planId" element={<PlanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;