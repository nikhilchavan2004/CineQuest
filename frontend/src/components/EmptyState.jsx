export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--border-hover)] bg-[color:var(--surface)]/70 p-8 text-center">
      <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
