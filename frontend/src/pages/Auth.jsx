import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest, setToken } from '../api';

export default function Auth({ mode, onAuthenticated }) {
  const register = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await apiRequest(register ? '/auth/register' : '/auth/login', {
        method: 'POST', body: JSON.stringify(register ? { name, email, password } : { email, password })
      });
      setToken(result.token);
      onAuthenticated(result.user);
      navigate(location.state?.from || '/tasks', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <main className="page-shell narrow auth-shell"><div className="page-heading"><div className="eyebrow">YOUR WORKSPACE</div><h1>{register ? 'Create your' : 'Welcome'} <span>{register ? 'account.' : 'back.'}</span></h1><p>{register ? 'A few details, then your task list is ready.' : 'Sign in to continue to your tasks.'}</p></div>
    <form className="panel form-stack" onSubmit={submit}>
      {register && <label>Full name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required minLength={2} /></label>}
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={register ? 'new-password' : 'current-password'} minLength={8} required /><small>At least 8 characters.</small></label>
      {error && <div className="notice notice-error">{error}</div>}
      <button className="button button-wide" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
      <p className="auth-switch">{register ? 'Already registered?' : 'New here?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
    </form>
  </main>;
}
