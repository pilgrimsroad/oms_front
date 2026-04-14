import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MessagePage from './pages/MessagePage';
import SendPage from './pages/SendPage';
import AgentPage from './pages/AgentPage';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/messages" element={<PrivateRoute><MessagePage /></PrivateRoute>} />
        <Route path="/send"     element={<PrivateRoute><SendPage /></PrivateRoute>} />
        <Route path="/agent"    element={<PrivateRoute><AgentPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/messages" replace />} />
      </Routes>
    </BrowserRouter>
  );
}