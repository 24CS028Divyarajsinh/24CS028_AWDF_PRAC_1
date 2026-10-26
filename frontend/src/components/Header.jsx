import { NavLink } from 'react-router-dom';

export default function Header({ name = 'Divyarajsinh Jadeja', theme, onToggleTheme, user, onLogout }) {
  return (
    <header className="topbar">
      <NavLink className="brand" to="/">Focus<span>Flow</span></NavLink>
      <nav className="navlinks" aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        {user && <NavLink to="/tasks">Tasks</NavLink>}
      </nav>
      <div className="top-actions">
        <button className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">{theme === 'dark' ? '☀' : '☾'}</button>
        {user ? <button className="button button-small button-ghost" onClick={onLogout}>Log out</button> : <NavLink className="button button-small" to="/login">Sign in</NavLink>}
      </div>
    </header>
  );
}
