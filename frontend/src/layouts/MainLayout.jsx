import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import Button from '../components/Button'
import CineQuestLogo from '../components/CineQuestLogo'
import { BRAND } from '../branding'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/wishlist', label: 'Wishlist' },
]

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text-primary)]">
      <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--bg)]/78 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3 rounded-full px-2 py-1 text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" aria-label="CineQuest home">
            <CineQuestLogo className="brand-logo" showWordmark={true} />
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-250 ease-out ${
                    isActive ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-hover)] border border-[color:var(--border-hover)]' : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-primary)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button as={NavLink} to="/wishlist" variant="secondary">
              My Wishlist
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-2 text-[color:var(--text-primary)] md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            ☰
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-[color:var(--border)] px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-hover)]' : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--text-primary)]"
              >
                My Wishlist
              </NavLink>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="cinematic-page">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-[color:var(--border)] bg-[color:var(--bg-secondary)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-[color:var(--text-muted)] sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <CineQuestLogo className="brand-logo small" showWordmark={false} />
            <span className="font-semibold uppercase tracking-[0.22em] text-[color:var(--text-primary)]">{BRAND.name}</span>
          </div>
          <span className="text-[color:var(--text-secondary)]">{BRAND.tagline}</span>
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
        </div>
      </footer>
    </div>
  )
}
