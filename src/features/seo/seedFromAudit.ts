import { supabase } from '@/lib/supabase'

type SeedItem = {
  title: string
  status?: 'todo'|'in_progress'|'blocked'|'done'
  tags?: string[]
  notes: string
}

// === Audit-driven task templates (Plates Express) ===
export const tasks: SeedItem[] = [
  {
    title: 'Staging: block indexation (noindex + robots + header)',
    tags: ['P0','indexation','staging'],
    notes: `**Why:** Staging must stay out of Google to avoid duplicate indexation.

**Do:**
- Send header: \`X-Robots-Tag: noindex, nofollow\`.
- Add global meta: \`<meta name="robots" content="noindex,nofollow">\`.
- \`/robots.txt\`: \`User-agent: *\\nDisallow: /\`.
- Remove all three at launch.

**Acceptance:** A crawl verifies noindex,nofollow on staging and robots disallow; prod is indexable. :contentReference[oaicite:0]{index=0}`
  },
  {
    title: 'Fix cross-environment links on staging',
    tags: ['P0','internal-linking','staging'],
    notes: `**Issue:** Staging pages link to prod (e.g., “how-to-fit” points at \`www.platesexpress.co.uk\`).  
**Fix:** Replace hardcoded absolute URLs with relative (/path) or env-aware base URL.  
**Why it matters:** Prevents crawl leakage and content parity issues during QA.  
**Done when:** All staging URLs use relative/env-aware links; JS-off crawl stays within staging. :contentReference[oaicite:1]{index=1}`
  },
  {
    title: 'Mini template: correct Title/H1 + unique metadata',
    tags: ['P0','metadata'],
    notes: `**Issue:** Mini Number Plates page shows a 4D title; H1 is “Mini Number Plate Builder” (mismatch).  
**Fix:** Set a unique, intent-aligned \`<title>\` and matching H1 for Mini; audit other model pages for the same issue.  
**Done when:** Titles/H1s are unique and reflect manufacturing intent (not marketplace). :contentReference[oaicite:2]{index=2}`
  },
  {
    title: 'Self-referential canonicals (staging & prod)',
    tags: ['P0','canonicals'],
    notes: `**Goal:** Ensure every URL declares itself as canonical.

**Do (staging):** Use self-canonicals pointing at the staging host; keep alongside noindex.  
**Do (prod):** Self-canonicals on the final \`www.\` host.  
**Params:** Canonicalise to the clean URL; keep UTMs/filters non-indexable.

**Done when:** A sample shows \`<link rel="canonical" href="https://<host>/<path>">\` matching the page’s own URL. :contentReference[oaicite:3]{index=3}`
  },
  {
    title: 'Prepare and submit clean XML sitemaps (prod only)',
    tags: ['P0','sitemaps'],
    notes: `**Scope:** Only indexable 200 pages; exclude staging.  
**Structure:** \`/sitemap.xml\` (index) → products, categories, pages, blog maps. Keep <50k URLs/file and <50MB uncompressed.  
**Process:** Validate, then submit in GSC after launch.

**Done when:** GSC shows “Success” and no staging URLs are present. :contentReference[oaicite:4]{index=4}`
  },
  {
    title: 'Remove “private plates” marketplace semantics',
    tags: ['P1','content'],
    notes: `**Issue:** Live contains marketplace-style phrases (e.g., “Cheap Private Number Plates Under £200”; legacy blog).  
**Fix:** Remove/redirect legacy pages or rewrite to manufacturing intent; update internal anchors accordingly.  
**Redirects:** 301 \`/cheap-number-plates/\` → \`/replacement-number-plates/\`; consider 410 for irrelevant legacy blog.  
**Done when:** Zero residual “private plates” language on money pages; redirects in place. :contentReference[oaicite:5]{index=5}`
  },
  {
    title: 'Structured data: Org, WebSite, Breadcrumb, FAQ (+Product if applicable)',
    tags: ['P1','schema'],
    notes: `**Add:** \`Organization\` (logo, sameAs), \`WebSite\`; \`BreadcrumbList\` for categories/builders; \`FAQPage\` for legal/compliance Qs.  
**Product:** For configurable plate pages with visible SKU/pricing, add \`Product\` (brand, material, offers, rating if present).  
**Avoid:** Any marketplace/private-plate entities.  
**Done when:** Rich Results Test passes; GSC Enhancements show eligibility/no critical errors. :contentReference[oaicite:6]{index=6}`
  },
  {
    title: 'Core Web Vitals: LCP, INP, CLS per template',
    tags: ['P2','performance'],
    notes: `**Targets:** LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.

**LCP:** Next-gen hero assets (AVIF/WebP), preload the LCP image, inline critical CSS.  
**INP:** Split builder JS by route; defer non-critical scripts; minimise third-party.  
**CLS:** Reserve image/font space; avoid layout-shifting banners.

**Done when:** Lab/field scores for Home/Category/Builder hit targets. :contentReference[oaicite:7]{index=7}`
  },
  {
    title: 'Internal linking: distribute equity to priority categories',
    tags: ['P2','internal-linking'],
    notes: `**Do:** From high-traffic pages, add descriptive anchors to Maker, Replacement, Motorcycle, and key category pages; keep intent clean.  
**Done when:** JS-off crawl reaches all money pages in ≤3 clicks; priority categories gain 5–10 contextual links each. :contentReference[oaicite:8]{index=8}`
  },
  {
    title: 'Security headers + redirect hygiene',
    tags: ['P1','security','ops'],
    notes: `**Headers:** HSTS (1y incl. subdomains), \`X-Content-Type-Options: nosniff\`, \`X-Frame-Options: DENY\`, CSP \`default-src 'self'\`.  
**Compression:** Gzip/Brotli on text assets; cache policy with proper \`Vary\`.  
**Redirects:** Enforce 301 for http→https and non-www→www; avoid chains.

**Done when:** Header checklists pass; all rewrites are single-hop 301. :contentReference[oaicite:9]{index=9}`
  }
]

// === Project bootstrap & seeding ===
export async function getOrCreatePlatesExpressProject() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) throw new Error('Not signed in')

  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('name', 'Plates Express')
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('projects')
    .insert([{ name: 'Plates Express', color: 'indigo' }])
    .select('id')
    .single()

  if (error) throw error
  return created
}

export async function seedPlatesExpressFromAudit(projectId: string) {
  if (!projectId) throw new Error('Missing projectId')

  const { data: current, error: curErr } = await supabase
    .from('items')
    .select('id,title,notes')
    .eq('project_id', projectId)

  if (curErr) throw curErr
  const has = new Map((current||[]).map(i => [i.title.trim().toLowerCase(), i]))
  const nowPos = () => Date.now() + Math.random()

  let inserted = 0, updated = 0
  for (const t of tasks) {
    const key = t.title.trim().toLowerCase()
    const found = has.get(key)
    if (!found) {
      const { error } = await supabase.from('items').insert([{
        project_id: projectId,
        title: t.title,
        status: t.status ?? 'todo',
        tags: t.tags ?? [],
        notes: t.notes,
        position: nowPos()
      }])
      if (error) throw error
      inserted++
    } else if (!found.notes || found.notes.trim() === '') {
      const { error } = await supabase.from('items').update({ notes: t.notes }).eq('id', found.id)
      if (error) throw error
      updated++
    }
  }
  return { inserted, updated }
}

// Lookup by title for auto-prefill in dialogs/creates
export function getNotesTemplateForTitle(title: string): string | null {
  const key = (title||'').trim().toLowerCase()
  const t = tasks.find(x => x.title.trim().toLowerCase() === key)
  return t ? t.notes : null
}
