import { useState } from 'react';

export default function Contact() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  return <main className="page-shell narrow"><div className="page-heading"><div className="eyebrow">LET'S CONNECT</div><h1>Contact <span>me.</span></h1><p>This form demonstrates controlled React state. It does not send data to a server.</p></div>
    <form className="panel form-stack" onSubmit={e => { e.preventDefault(); setSent(true); }}>
      <label>Your message<textarea rows="5" maxLength="500" value={message} onChange={e => { setMessage(e.target.value); setSent(false); }} placeholder="Write a short message…" required /></label>
      <div className="form-foot"><span>{message.length}/500 characters</span><button className="button" type="submit">Preview message</button></div>
      {sent && <div className="notice notice-success"><strong>Message preview ready</strong><p>{message}</p></div>}
    </form>
  </main>;
}
