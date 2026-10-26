export default function Footer({ email = 'student@example.com' }) {
  return <footer className="footer"><span>© {new Date().getFullYear()} FocusFlow</span><a href={`mailto:${email}`}>{email}</a><span>Built for AWDF ITUE301</span></footer>;
}
