export default function StateMessage({ type, title, message, actionLabel, onAction }) {
  return (
    <div className={`state state-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {type === 'loading' && <div className="spinner" aria-hidden="true" />}
      <p className="state-title">{title}</p>
      {message && <p className="muted">{message}</p>}
      {actionLabel && (
        <button type="button" className="btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}