import { useEffect, useMemo, useState } from 'react';
import Spinner from '../components/Spinner';

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const username = 'divyarajsinh1604';

  async function loadRepos() {
    setLoading(true); setError('');
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!response.ok) throw new Error(response.status === 404 ? 'GitHub username was not found.' : 'GitHub API request failed. Try again later.');
      const data = await response.json();
      setRepos(data);
    } catch (err) { setError(err.message || 'Could not load repositories.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadRepos(); }, []);
  const filtered = useMemo(() => repos.filter(repo => repo.name.toLowerCase().includes(query.toLowerCase())), [repos, query]);

  return (
    <main className="page-shell">
      <div className="page-heading"><div className="eyebrow">PRACTICAL 3 · API INTEGRATION</div><h1>Projects & <span>repositories.</span></h1><p>Live public repositories from GitHub, loaded with fetch and React state.</p></div>
      <div className="repo-toolbar"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search repositories…" aria-label="Search repositories" /><button className="button button-ghost" onClick={loadRepos}>↻ Retry / refresh</button></div>
      {loading ? <Spinner label="Fetching GitHub repositories" /> : error ? <div className="notice notice-error"><strong>Couldn't load repositories</strong><p>{error}</p><button className="button" onClick={loadRepos}>Try again</button></div> :
        filtered.length === 0 ? <div className="empty-state">No repositories match your search.</div> :
        <div className="repo-grid">{filtered.map(repo => <article className="repo-card" key={repo.id}><div className="repo-card-top"><span className="repo-symbol">⌘</span><span className="repo-stars">★ {repo.stargazers_count}</span></div><h3>{repo.name}</h3><p>{repo.description || 'No description provided.'}</p><div className="repo-meta"><span>{repo.language || 'Code'}</span><a href={repo.html_url} target="_blank" rel="noreferrer">View on GitHub ↗</a></div></article>)}</div>}
    </main>
  );
}
