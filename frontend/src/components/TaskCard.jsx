export default function TaskCard({ task, onToggle, onDelete, onSuggest, busy }) {
  return (
    <article className={`task-card ${task.completed ? 'task-done' : ''}`}>
      <button className={`check ${task.completed ? 'checked' : ''}`} onClick={() => onToggle(task)} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>{task.completed ? '✓' : ''}</button>
      <div className="task-body">
        <div className="task-title-row"><h3>{task.title}</h3><span className={`priority priority-${task.priority}`}>{task.priority}</span></div>
        {task.description && <p>{task.description}</p>}
        {task.deadline && <small>Due {new Date(task.deadline).toLocaleDateString()}</small>}
        <div className="task-actions">
          <button className="text-button" disabled={busy} onClick={() => onSuggest(task)}>AI description</button>
          <button className="text-button danger-text" disabled={busy} onClick={() => onDelete(task)}>Delete</button>
        </div>
      </div>
    </article>
  );
}
