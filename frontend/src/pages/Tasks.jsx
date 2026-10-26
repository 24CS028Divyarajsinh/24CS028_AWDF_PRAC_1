import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api';
import Spinner from '../components/Spinner';
import TaskCard from '../components/TaskCard';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState('all');

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await apiRequest('/tasks'); setTasks(result.tasks || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  async function createTask(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await apiRequest('/tasks', { method: 'POST', body: JSON.stringify({ title, description, priority, deadline: deadline || null }) });
      setTitle(''); setDescription(''); setPriority('medium'); setDeadline('');
      setNotice('Task created and saved.'); await loadTasks();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function toggleTask(task) {
    setBusy(true); setError(''); setNotice('');
    try { await apiRequest(`/tasks/${task._id}`, { method: 'PUT', body: JSON.stringify({ completed: !task.completed }) }); await loadTasks(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setBusy(true); setError(''); setNotice('');
    try { await apiRequest(`/tasks/${task._id}`, { method: 'DELETE' }); setNotice('Task deleted.'); await loadTasks(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function suggest(task) {
    setError(''); setNotice('');
    try {
      const result = await apiRequest('/ai/generate-description', { method: 'POST', body: JSON.stringify({ title: task.title }) });
      setNotice(`AI suggestion for "${task.title}": ${result.description} (${result.disclaimer})`);
    } catch (err) { setError(err.message); }
  }

  const visibleTasks = tasks.filter(task => filter === 'all' || (filter === 'open' ? !task.completed : task.completed));
  const completedCount = tasks.filter(task => task.completed).length;

  return <main className="page-shell">
    <div className="page-heading task-heading"><div><div className="eyebrow">YOUR PERSONAL WORKSPACE</div><h1>Today, <span>made clearer.</span></h1><p>Capture the next step. Then keep moving.</p></div><div className="task-counter"><strong>{completedCount}/{tasks.length}</strong><span>completed</span></div></div>
    <section className="task-layout">
      <form className="panel create-panel" onSubmit={createTask}>
        <div className="panel-title"><span className="panel-kicker">NEW TASK</span><span className="plus-mark">＋</span></div>
        <label>Task title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" required maxLength={160} /></label>
        <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Add a few useful details…" maxLength={3000} /></label>
        <div className="form-row">
          <label>Priority<select value={priority} onChange={e => setPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          <label>Deadline<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></label>
        </div>
        <button className="button button-wide" disabled={busy}>{busy ? 'Saving…' : '＋ Add task'}</button>
        <p className="privacy-note">Your tasks are saved to your account.</p>
      </form>
      <section className="task-list-panel">
        <div className="list-heading"><div><span className="panel-kicker">YOUR LIST</span><h2>Tasks <span className="count-pill">{tasks.length}</span></h2></div><button className="text-button" onClick={loadTasks}>↻ Refresh</button></div>
        <div className="filter-tabs">{[['all','All'],['open','In progress'],['done','Completed']].map(([key,label]) => <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div>
        {error && <div className="notice notice-error">{error}</div>}
        {notice && <div className="notice notice-success">{notice}</div>}
        {loading ? <Spinner label="Loading tasks" /> : visibleTasks.length === 0 ? <div className="empty-state"><span className="empty-icon">✳</span><strong>{filter === 'done' ? 'No completed tasks yet' : filter === 'open' ? 'You are all caught up' : 'Your list starts here'}</strong><p>Add a task using the form to get started.</p></div> :
          <div className="task-cards">{visibleTasks.map(task => <TaskCard key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} onSuggest={suggest} busy={busy} />)}</div>}
      </section>
    </section>
    <p className="ai-disclaimer">AI suggestions are optional and AI-generated. Review them before use; do not submit sensitive personal information to an external AI service.</p>
  </main>;
}
