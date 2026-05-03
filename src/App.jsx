// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; 

// Import all your pages
import AIInsightsPage from './pages/AIInsightsPage';
import GoalsPage from './pages/GoalsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DocumentationPage from './pages/DocumentationPage';
import DashboardPage from './pages/DashboardPage';
import TradesPage from './pages/TradesPage';
import NotesPage from './pages/NotesPage';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import BrokerIntegrationPage from './pages/BrokerIntegrationPage';
import PortfolioPage from './pages/PortfolioPage'; // <-- NEW IMPORT

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/trades" element={<ProtectedRoute><TradesPage /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><AIInsightsPage /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
        <Route path="/broker" element={<ProtectedRoute><BrokerIntegrationPage /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} /> {/* <-- NEW ROUTE */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;