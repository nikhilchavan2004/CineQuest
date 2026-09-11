import logoUrl from '../assets/cinequest-logo.svg'

export default function CineQuestLogo({ className = '', showWordmark = true }) {
  return (
    <span className={`cinequest-logo inline-flex items-center gap-2 ${className}`.trim()}>
      <img src={logoUrl} alt="CineQuest logo" className="h-10 w-10 rounded-lg object-cover transition-transform duration-300 ease-out hover:scale-[1.02] hover:drop-shadow-[0_0_14px_rgba(214,168,79,0.9)]" />
      {showWordmark ? <span className="text-lg font-black tracking-tight text-[color:var(--text-primary)] transition-colors duration-250 hover:text-[color:var(--gold-bright)]">CineQuest</span> : null}
    </span>
  )
}
