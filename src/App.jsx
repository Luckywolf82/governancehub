import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useRef } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ActiveRepoProvider } from '@/components/ActiveRepoContext';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Audits from './pages/Audits';
import AppLayout from './components/AppLayout';
import { AnimatePresence, motion } from 'framer-motion';

const PAGE_ORDER = ["/Home", "/Projects", "/Audits", "/Admin"];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function AnimatedRoutes() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const direction = useRef(0);

  const prevIdx = PAGE_ORDER.indexOf(prevPath.current);
  const currIdx = PAGE_ORDER.indexOf(location.pathname);
  if (prevIdx !== -1 && currIdx !== -1 && prevPath.current !== location.pathname) {
    direction.current = currIdx > prevIdx ? 1 : -1;
  }
  prevPath.current = location.pathname;

  return (
    <AnimatePresence mode="popLayout" custom={direction.current}>
      <motion.div
        key={location.pathname}
        custom={direction.current}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
        style={{ position: "relative", width: "100%" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/Projects" element={<AppLayout><Projects /></AppLayout>} />
          <Route path="/Audits" element={<AppLayout><Audits /></AppLayout>} />
          <Route path="/Admin" element={<AppLayout><Admin /></AppLayout>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Home" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/Projects" element={<AppLayout><Projects /></AppLayout>} />
      <Route path="/Audits" element={<AppLayout><Audits /></AppLayout>} />
      <Route path="/Admin" element={<AppLayout><Admin /></AppLayout>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <ActiveRepoProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ActiveRepoProvider>
    </AuthProvider>
  )
}

export default App