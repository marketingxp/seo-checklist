import { supabase } from '@/lib/supabase'
import { addDays } from 'date-fns'

type NewItem = {
  title: string
  notes?: string
  tags?: string[]
  status?: 'todo' | 'in_progress' | 'blocked' | 'done'
  due_date?: string | null
  position?: number
}

const todayISO = () => new Date().toISOString().slice(0, 10)
const due = (days: number) => addDays(new Date(), days).toISOString().slice(0, 10)

export async function seedPlatesExpressSEO() {
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({ name: 'SEO Launch – Plates Express', color: '#0EA5E9' })
    .select()
    .single()
  if (pErr) throw pErr

  const items: NewItem[] = [
    { title: 'Add global noindex on STAGING: meta + X-Robots + robots.txt',
      notes: 'Add <meta name="robots" content="noindex,nofollow">, X-Robots-Tag: noindex,nofollow, and robots.txt Disallow: / on staging. Remove at launch.',
      tags: ['P0','Indexation','Tech','Staging'], status: 'todo', due_date: due(0) },
    { title: 'Self-canonical on ALL staging URLs (no cross-domain)', tags: ['P0','Canonicals','Tech','Staging'], status: 'todo', due_date: due(0) },
    { title: 'Replace cross-environment links on staging with relative URLs', notes: 'E.g. “How to Fit” linking to prod → use relative /how-to-fit.',
      tags: ['P0','Internal Linking','Tech','Staging'], status: 'todo', due_date: due(0) },
    { title: 'Fix Mini page <title>/H1 mismatch', tags: ['P0','Metadata','Content'], status: 'todo', due_date: due(1) },
    { title: 'Prepare PROD XML sitemaps (canonical, indexable only)', tags: ['P0','Sitemaps','Tech','Prod'], status: 'todo', due_date: due(1) },
    { title: 'Lock down / decommission staging after launch', tags: ['P1','Ops','Staging'], status: 'todo', due_date: due(3) },
    { title: 'Remove/410 legacy private-plate content; 301 /cheap-number-plates/ → /replacement-number-plates/', tags: ['P1','Redirects','Content','Prod'], status: 'todo', due_date: due(2) },
    { title: 'Add default OG/Twitter tags by template', tags: ['P1','Social','Metadata','Content'], status: 'todo', due_date: due(2) },
    { title: 'Security headers + compression (HSTS, CSP, CTO, XFO, Brotli/Gzip)', tags: ['P1','Headers','Ops'], status: 'todo', due_date: due(3) },
    { title: 'CWV hardening: LCP images → AVIF/WebP; preload fonts; split builder JS', tags: ['P2','Performance','Tech'], status: 'todo', due_date: due(14) },
    { title: 'Expand manufacturer/model pages (legal sizes, fitting) + interlink', tags: ['P2','Content','IA'], status: 'todo', due_date: due(21) },
    { title: 'Publish compliance hub: BS AU 145e, DVLA rules, documents needed', tags: ['P2','Content','Compliance'], status: 'todo', due_date: due(21) },
    { title: 'VERIFY staging isn’t indexable (crawl check)', tags: ['Risk','Indexation','Staging'], status: 'todo', due_date: todayISO() },
    { title: 'Audit for cross-env anchors on staging', tags: ['Risk','Internal Linking','Staging'], status: 'todo', due_date: todayISO() },
    { title: 'Check canonical targets on staging (self-canonical only)', tags: ['Risk','Canonicals','Staging'], status: 'todo', due_date: todayISO() },
    { title: 'Confirm sitemap policy (no staging maps; prod only)', tags: ['Risk','Sitemaps'], status: 'todo', due_date: todayISO() },
    { title: 'Rewrite residual “private plates” language to manufacturing intent', tags: ['Content','Cannibalisation','Rewrite'], status: 'todo', due_date: due(5) },
  ]

  const payload = items.map((i, idx) => ({
    project_id: project.id,
    title: i.title,
    notes: i.notes ?? null,
    tags: i.tags ?? [],
    status: i.status ?? 'todo',
    due_date: i.due_date ?? null,
    position: (idx + 1) * 1000,
  }))

  const { error: iErr } = await supabase.from('items').insert(payload)
  if (iErr) throw iErr

  return project
}
