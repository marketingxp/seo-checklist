import { supabase } from '@/lib/supabase'

type SeedItem = {
  title: string
  status?: 'todo'|'in_progress'|'blocked'|'done'
  tags?: string[]
  notes: string
}

export const tasks: SeedItem[] = [
  {
    title: 'Block staging from Google (noindex + robots + header)',
    tags: ['P0 • Critical', 'Indexation'],
    notes: `**Why it matters:** Prevents duplicate content and accidental indexation of staging.
**Implement:**
1) Send \`X-Robots-Tag: noindex, nofollow\` on all staging responses.  
2) Add \`<meta name="robots" content="noindex,nofollow">\` to the base layout.  
3) \`/robots.txt\`:  
\`\`\`
User-agent: *
Disallow: /
\`\`\`
4) Remove all three on production.
**Acceptance:** Staging returns noindex,nofollow; robots disallows /; test a few URLs with curl and “View Source”.`
  },
  {
    title: 'Fix cross-environment links (staging must not link to prod)',
    tags: ['P0 • Critical', 'Internal Linking'],
    notes: `**Why it matters:** QA should remain within staging; cross-links leak crawls and skew tests.
**Implement:** Replace absolute prod links with relative links (/path) or use an environment base URL helper.  
**Acceptance:** JS-off crawl on staging never hits prod; sampled templates show only relative/env-aware URLs.`
  },
  {
    title: 'Set self-referencing canonicals on every template',
    tags: ['P0 • Critical', 'Canonicals'],
    notes: `**Why it matters:** Consolidates signals and avoids duplicate indexation.
**Implement:** Add \`<link rel="canonical" href="{absolute self URL}">\` to product, category, builder, blog, pagination.  
Filtered/UTM pages canonicalise to the clean URL.  
**Acceptance:** Sample of 20 URLs show correct self-canonicals matching the page’s own canonical host.`
  },
  {
    title: 'Clean XML sitemaps (prod only) and submit to GSC',
    tags: ['P0 • Critical', 'Sitemaps'],
    notes: `**Why it matters:** Ensures fast discovery of indexable pages only.
**Implement:** Sitemap index at \`/sitemap.xml\` → \`/sitemap-products.xml\`, \`/sitemap-categories.xml\`, \`/sitemap-pages.xml\`, \`/sitemap-blog.xml\`.  
Include only 200/indexable pages; keep <50,000 URLs/file and <50MB.  
**Acceptance:** GSC shows “Success”; no staging URLs in sitemaps.`
  },
  {
    title: 'Standardise Titles and H1s (intent-aligned, unique)',
    tags: ['P1 • High', 'Content Quality'],
    notes: `**Why it matters:** Matching Title/H1 improves relevance and CTR.
**Implement:**  
- Create a template policy: Title ≈ intent + primary keyword + brand; H1 mirrors but human.  
- Fix pages where model “Mini” shows 4D language or mismatched wording.  
**Acceptance:** No duplicates in a crawl; Title/H1 pairs are unique and aligned per template.`
  },
  {
    title: 'Remove marketplace/“private plates” semantics from money pages',
    tags: ['P1 • High', 'Content Strategy'],
    notes: `**Why it matters:** The site is a manufacturer; marketplace terms confuse users and search engines.
**Implement:**  
- Rewrite or remove legacy content referencing “cheap private plates”.  
- 301 legacy URLs (e.g., \`/cheap-number-plates/\`) to the best manufacturing target (e.g., \`/replacement-number-plates/\`).  
**Acceptance:** No marketplace phrasing left on category/product/builder pages; redirects tested and relevant.`
  },
  {
    title: 'Structured Data: Organization, WebSite, Breadcrumb, FAQ',
    tags: ['P1 • High', 'Structured Data'],
    notes: `**Why it matters:** Rich results improve visibility and interpretation.
**Implement:**  
- Sitewide \`Organization\` (logo, sameAs) + \`WebSite\`.  
- \`BreadcrumbList\` on categories/builders.  
- \`FAQPage\` for compliance/legal/common questions.  
**Acceptance:** Rich Results Test passes; GSC Enhancements show eligible items with no critical errors.`
  },
  {
    title: 'Optional: Product schema on configurable builder pages',
    tags: ['P2 • Medium', 'Structured Data'],
    notes: `**Why it matters:** May enable price/availability rich snippets if pricing is visible.
**Implement:** \`Product\` with \`name\`, \`sku\`, \`brand\`, \`offers\` (price, availability), and rating if present.  
**Acceptance:** Rich Results Test passes for builder/product pages without warnings on required fields.`
  },
  {
    title: 'Core Web Vitals (LCP/INP/CLS) per key template',
    tags: ['P1 • High', 'Performance'],
    notes: `**Why it matters:** UX & rankings support; faster build pages convert better.
**Implement:**  
- **LCP:** Preload hero, serve AVIF/WebP, responsive sizes, inline critical CSS.  
- **INP:** Code-split builder JS, defer non-critical, reduce third-party.  
- **CLS:** Reserve space for images/fonts; avoid shifting banners.  
**Acceptance:** 75th percentile green in PSI + GSC for Home/Category/Builder (mobile & desktop).`
  },
  {
    title: 'Improve internal linking to priority categories',
    tags: ['P2 • Medium', 'Internal Linking'],
    notes: `**Why it matters:** Distributes authority; improves crawl paths and rankings to money pages.
**Implement:** Add contextual anchors from high-traffic pages to priority categories (Maker, Replacement, Motorcycle, etc.).  
**Acceptance:** Money pages reachable in ≤3 clicks (JS-off); +5–10 new relevant internal links each.`
  },
  {
    title: 'Redirect hygiene: enforce single canonical host',
    tags: ['P1 • High', 'Redirects'],
    notes: `**Why it matters:** Prevents split signals and crawl waste.
**Implement:** 301: http→https, non-www→www (or preferred); remove chains; update canonical, sitemaps, and internal links to canonical host.  
**Acceptance:** Alternate hosts 301 in one hop to canonical; no chains in spot checks.`
  },
  {
    title: 'Robots meta for thin/utility pages (noindex,follow)',
    tags: ['P2 • Medium', 'Indexation'],
    notes: `**Why it matters:** Reduces index bloat; focuses crawl on valuable pages.
**Implement:** Apply \`<meta name="robots" content="noindex,follow">\` to thin, thank-you, filter-only, and test pages.  
**Acceptance:** Crawl shows expected sets as noindex; GSC “Excluded (by noindex)” rises appropriately.`
  },
  {
    title: 'Security headers + caching policy',
    tags: ['P2 • Medium', 'Security & Ops'],
    notes: `**Why it matters:** Baseline security + fast repeat views.
**Implement:** HSTS (1y incl. subdomains), \`X-Content-Type-Options: nosniff\`, \`X-Frame-Options: DENY\`, CSP \`default-src 'self'\`.  
Enable gzip/Brotli; cache hashed assets with \`Cache-Control: public, max-age=31536000, immutable\`.  
**Acceptance:** Security headers present; assets cached; HTML un-cached.`
  },
  {
    title: 'Analytics tagging for SEO funnels (GA4 events)',
    tags: ['P3 • Low', 'Analytics'],
    notes: `**Why it matters:** Lets you measure SEO → conversion impact.
**Implement:** Ensure GA4 & key events (view_item, add_to_cart, begin_checkout) fire; label SEO landings in reports.  
**Acceptance:** Dashboard can segment SEO traffic and see CVR by template.`
  },
  {
    title: 'Content briefs for top categories',
    tags: ['P3 • Low', 'Content Strategy'],
    notes: `**Why it matters:** Consistent, useful content that answers intent.
**Implement:** For each priority category: define search intent, outline H2s/subtopics, internal links, FAQs (FAQPage), and write 300–600 words of unique copy.  
**Acceptance:** Briefs approved and published; no duplication across categories.`
  }
]

// Create/find project
export async function getOrCreatePlatesExpressProject() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) throw new Error('Not signed in')
  const uid = user.user.id

  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', uid)
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

// Seed/Backfill
export async function seedPlatesExpressFromAudit(projectId: string) {
  if (!projectId) throw new Error('Missing projectId')
  const { data: current, error: curErr } = await supabase
    .from('items')
    .select('id,title,notes')
    .eq('project_id', projectId)
  if (curErr) throw curErr

  const map = new Map((current||[]).map(i => [i.title.trim().toLowerCase(), i]))
  const nowPos = () => Date.now() + Math.random()
  let inserted = 0, updated = 0

  for (const t of tasks) {
    const key = t.title.trim().toLowerCase()
    const found = map.get(key)
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

// Lightweight notes-template lookup by title
export function getNotesTemplateForTitle(title: string): string | null {
  const key = (title||'').trim().toLowerCase()
  const t = tasks.find(x => x.title.trim().toLowerCase() === key)
  return t ? t.notes : null
}
