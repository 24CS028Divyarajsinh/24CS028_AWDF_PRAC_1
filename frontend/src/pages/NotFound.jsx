import { Link } from 'react-router-dom';
export default function NotFound() {
  return <main className="page-shell narrow not-found"><div className="eyebrow">404 · WRONG TURN</div><h1>That page <span>isn't here.</span></h1><p>The URL may be wrong or the page may have moved.</p><Link className="button" to="/">Back home</Link></main>;
}
