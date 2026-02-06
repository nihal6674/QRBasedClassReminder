import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StudentSignup from '@pages/StudentSignup';
import AdminDashboard from '@pages/AdminDashboard';
import TemplateManager from '@pages/TemplateManager';
import OptOutConfirmation from '@pages/OptOutConfirmation';
import QRGenerator from '@pages/QRGenerator';
import NotFound from '@pages/NotFound';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Student Routes */}
        <Route path="/signup" element={<StudentSignup />} />
        <Route path="/signup/:classType" element={<StudentSignup />} />
        <Route path="/opt-out/:studentId" element={<OptOutConfirmation />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/templates" element={<TemplateManager />} />
        <Route path="/admin/qr-generator" element={<QRGenerator />} />

        {/* Default */}
        <Route path="/" element={<QRGenerator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
