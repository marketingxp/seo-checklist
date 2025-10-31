import { supabase } from '@/lib/supabase'
import { addDays } from 'date-fns'

type Status = 'todo'|'in_progress'|'blocked'|'done'
type NewItem = {
  title: string
  notes?: string
  tags?: string[]
  status?: Status
  due_date?: string|null
  position?: number
}

const due = (days: number) => addDays(new Date(), days).toISOString().slice(0,10)
const today = () => new Date().toISOString().slice(0,10)

/** Ensure the Plates Express project exists and return it */
export async function getOrCreatePlatesExpressProject() {
  const { data: existing, error: qErr } = await supabase
    .from('projects').select('*').eq('name','Plates Express').limit(1).maybeSingle()
  if (qErr) throw qErr
  if (existing) return existing
  const { data: created, error: iErr } = await supabase
    .from('projects').insert({ name: 'Plates Express', color: '#0EA5E9' }).select().single()
  if (iErr) throw iErr
  return created
}

/** Seed SEO tasks based on the audit. Safe to run multiple times (skips duplicates by title). */
export async function seedPlatesExpressFromAudit(projectId: string) {
  const tasks: NewItem[] = [
    // P0 (pre-launch must-fix)
    { title: 'Staging noindex (meta + X-Robots + robots.txt)', tags: ['P0','Indexation','Staging'], status: 'todo', due_date: today() },
    { title: 'Self-canonical on ALL staging URLs (no cross-domain)', tags: ['P0','Canonicals','Staging'], status: 'todo', due_date: today() },
    { title: 'Replace cross-environment links with relative URLs on staging', tags: ['P0','Internal Linking','Staging'], status: 'todo', due_date: today() },
    { title: 'Fix Mini template: correct <title>/H1 and legal size info', tags: ['P0','Metadata','Content'], status: 'todo', due_date: due(1) },
    { title: 'Prepare PROD XML sitemaps (indexable canonical URLs only)', tags: ['P0','Sitemaps','Prod'], status: 'todo', due_date: due(1) },

    // P1 (launch + 72h)
    { title: 'Decommission/lock down staging after launch', tags: ['P1','Ops','Staging'], status: 'todo', due_date: due(3) },
    { title: '410/redirect legacy “private plates” content; 301 /cheap-number-plates/ → /replacement-number-plates/', tags: ['P1','Redirects','Content'], status: 'todo', due_date: due(2) },
    { title: 'Default OG/Twitter tags by template', tags: ['P1','Social','Metadata','Content'], status: 'todo', due_date: due(2) },
    { title: 'Security headers + compression (HSTS, CSP, XFO, nosniff, Brotli/Gzip)', tags: ['P1','Headers','Ops'], status: 'todo', due_date: due(3) },

    // P2 (first 30 days)
    { title: 'CWV hardening: LCP AVIF/WebP, font preloads, route-split builder JS', tags: ['P2','Performance','Tech'], status: 'todo', due_date: due(14) },
    { title: 'Expand manufacturer/model pages + interlink to Maker/Replacement', tags: ['P2','Content','IA'], status: 'todo', due_date: due(21) },
    { title: 'Publish compliance hub (BS AU 145e, DVLA docs)', tags: ['P2','Content','Compliance'], status: 'todo', due_date: due(21) },

    // Risk Register quick checks
    { title: 'VERIFY staging isn’t indexable (crawl noindex + robots)', tags: ['Risk','Indexation','Staging'], status: 'todo', due_date: today() },
    { title: 'Audit cross-env anchors on staging', tags: ['Risk','Internal Linking','Staging'], status: 'todo', due_date: today() },
    { title: 'Check staging canonicals are self-referential', tags: ['Risk','Canonicals','Staging'], status: 'todo', due_date: today() },
    { title: 'Confirm sitemap policy: no staging sitemaps exposed', tags: ['Risk','Sitemaps'], status: 'todo', due_date: today() },

    // Content cleanup
    { title: 'Rewrite residual “private plates” language to manufacturing intent', tags: ['Content','Cannibalisation'], status: 'todo', due_date: due(5) },
  ]

  // dedupe by title (don’t insert if an item with same title already exists)
  const { data: existing, error: eErr } = await supabase
    .from('items').select('id,title').eq('project_id', projectId)
  if (eErr) throw eErr
  const have = new Set((existing ?? []).map(r => String(r.title)))

  const payload = tasks
    .filter(t => !have.has(t.title))
    .map((t, i) => ({
      project_id: projectId,
      title: t.title,
      notes: t.notes ?? null,
      tags: t.tags ?? [],
      status: t.status ?? 'todo',
      due_date: t.due_date ?? null,
      position: (i + 1) * 1000
    }))

  if (payload.length === 0) return { inserted: 0 }
  const { error: iErr } = await supabase.from('items').insert(payload)
  if (iErr) throw iErr
  return { inserted: payload.length }
}
