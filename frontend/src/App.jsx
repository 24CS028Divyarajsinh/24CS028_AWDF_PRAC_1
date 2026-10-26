import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Spinner from './components/Spinner.jsx';
import { apiRequest, getToken, setToken } from './api.js';

const Home = lazy(() => import('./pages/Home.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('awdf_theme') || 'light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('awdf_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (getToken()) apiRequest('/auth/me').then(result => setUser(result.user)).catch(() => { setToken(null); setUser(null); });
    const onUnauthorized = () => setUser(null);
    window.addEventListener('awdf:unauthorized', onUnauthorized);
    return () => window.removeEventListener('awdf:unauthorized', onUnauthorized);
  }, []);

  function logout() { setToken(null); setUser(null); }

  return <div className="app-root">
    <Header user={user} theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} onLogout={logout} />
    <Suspense fallback={<Spinner label="Loading page" />}>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={user ? <Navigate to="/tasks" replace /> : <Auth mode="login" onAuthenticated={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/tasks" replace /> : <Auth mode="register" onAuthenticated={setUser} />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/tasks" element={<Tasks />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <Footer email="24cs028@charusat.edu.in" />
  </div>;
}
