import { Link } from 'react-router-dom';

export default function Home({ user }) {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CALM, CLEAR WORKSPACE</div>
        <h1>Make room for<br /><span>meaningful work.</span></h1>
        <p className="hero-copy">A simple task manager to plan your day, keep momentum, and finish what matters without turning your to-do list into another job.</p>
        <div className="hero-actions">
          <Link className="button" to={user ? '/tasks' : '/register'}>{user ? 'Open my tasks' : 'Get started'} <span>↗</span></Link>
          <Link className="button button-ghost" to="/projects">Explore projects</Link>
        </div>
        <div className="hero-stats"><div><strong>01</strong><span>Plan clearly</span></div><div><strong>02</strong><span>Work steadily</span></div><div><strong>03</strong><span>Finish confidently</span></div></div>
      </section>
      <section className="feature-grid">
        <article className="feature-card"><div className="feature-icon purple">◈</div><h3>One clear list</h3><p>Keep your tasks, priorities, and deadlines in one place.</p></article>
        <article className="feature-card"><div className="feature-icon green">↗</div><h3>Small progress</h3><p>Mark tasks complete and make progress visible.</p></article>
        <article className="feature-card"><div className="feature-icon amber">✳</div><h3>Helpful AI</h3><p>Optionally generate a first draft of a task description.</p></article>
      </section>
    </main>
  );
}
