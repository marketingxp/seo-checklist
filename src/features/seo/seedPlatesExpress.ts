import { supabase } from '@/lib/supabase'
import { addDays } from 'date-fns'
type NewItem = { title: string; notes?: string; tags?: string[]; status?: 'todo'|'in_progress'|'blocked'|'done'; due_date?: string|null; position?: number }
const due = (days: number) => addDays(new Date(), days).toISOString().slice(0, 10)
const today = () => new Date().toISOString().slice(0,10)

export async function seedPlatesExpressSEO() {
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({ name: 'SEO Launch – Plates Express', color: '#0EA5E9' })
    .select().single()
  if (pErr) throw pErr

  const items: NewItem[] = [
    { title: 'Staging noindex (meta + X-Robots + robots.txt)', tags: ['P0','Indexation','Staging'], status: 'todo', due_date: today() },
    { title: 'Self-canonical on ALL staging URLs', tags: ['P0','Canonicals','Staging'], status: 'todo', due_date: today() },
    { title: 'Replace cross-env anchors with relative links', tags: ['P0','Internal Linking','Staging'], status: 'todo', due_date: today() },
    { title: 'Fix Mini page <title>/H1 mismatch', tags: ['P0','Metadata'], status: 'todo', due_date: due(1) },
    { title: 'Prep PROD XML sitemaps (indexable only)', tags: ['P0','Sitemaps'], status: 'todo', due_date: due(1) },
    { title: 'Decommission staging after launch', tags: ['P1','Ops'], status: 'todo', due_date: due(3) },
    { title: '410/redirect legacy private-plates content', tags: ['P1','Redirects','Content'], status: 'todo', due_date: due(2) },
    { title: 'Default OG/Twitter tags', tags: ['P1','Metadata','Social'], status: 'todo', due_date: due(2) },
    { title: 'Security headers + compression', tags: ['P1','Headers','Ops'], status: 'todo', due_date: due(3) },
    { title: 'CWV: AVIF/WebP LCP; preload fonts; split builder JS', tags: ['P2','Performance'], status: 'todo', due_date: due(14) },
    { title: 'Expand manufacturer/model pages + interlink', tags: ['P2','Content','IA'], status: 'todo', due_date: due(21) },
    { title: 'Compliance hub (BS AU 145e / DVLA docs)', tags: ['P2','Content','Compliance'], status: 'todo', due_date: due(21) },
    { title: 'VERIFY staging isn’t indexable (crawl check)', tags: ['Risk','Indexation','Staging'], status: 'todo', due_date: today() },
    { title: 'Audit cross-env anchors on staging', tags: ['Risk','Internal Linking','Staging'], status: 'todo', due_date: today() },
    { title: 'Check staging canonicals (self-canonical)', tags: ['Risk','Canonicals','Staging'], status: 'todo', due_date: today() },
    { title: 'Confirm sitemap policy (no staging maps)', tags: ['Risk','Sitemaps'], status: 'todo', due_date: today() },
    { title: 'Rewrite “private plates” language to manufacturing intent', tags: ['Content','Cannibalisation'], status: 'todo', due_date: due(5) },
  ]

  const payload = items.map((i, idx) => ({
    project_id: project.id,
    title: i.title,
    notes: i.notes ?? null,
    tags: i.tags ?? [],
    status: i.status ?? 'todo',
    due_date: i.due_date ?? null,
    position: (idx + 1) * 1000
  }))
  const { error: iErr } = await supabase.from('items').insert(payload)
  if (iErr) throw iErr

  return project
}
