export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  as: Component = 'button',
  ...props
}) {
  const variantClass =
    variant === 'secondary'
      ? 'border border-[color:var(--gold)] bg-[color:var(--surface-raised)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-hover)] hover:border-[color:var(--gold-bright)] hover:text-[color:var(--gold-bright)]'
      : 'bg-[linear-gradient(135deg,var(--burgundy),var(--accent))] text-[color:var(--text-primary)] hover:bg-[color:var(--accent-hover)] shadow-[0_12px_30px_rgba(184,58,69,0.24)] hover:shadow-[0_12px_30px_rgba(214,168,79,0.22)]'

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-250 ease-out focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2 focus:ring-offset-[#15120F] disabled:cursor-not-allowed disabled:opacity-60 hover:-translate-y-0.5 hover:shadow-lg ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
