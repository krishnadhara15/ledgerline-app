'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpenText, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENT_USER } from '@/lib/mock-data'

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/legend', label: 'Legend', icon: BookOpenText },
] as const

export function NavRail() {
  const pathname = usePathname()
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-card">
      <div className="px-5 pb-4 pt-5">
        <Link href="/dashboard" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <span className="font-display text-xl italic tracking-tight" style={{ fontFamily: 'var(--font-newsreader)' }}>
            Ledgerline
          </span>
        </Link>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          Every number, one click from its paper.
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 px-3">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm calm-transition outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active
                  ? 'bg-ai-soft font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-border px-5 py-4">
        <p className="text-sm font-medium">{CURRENT_USER}</p>
        <p className="text-[11px] text-muted-foreground">Reviewer · Green Growth CPAs</p>
      </div>
    </aside>
  )
}
