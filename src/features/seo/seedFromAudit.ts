import { supabase } from '@/lib/supabase'

type SeedItem = {
  title: string
  status?: 'todo'|'in_progress'|'blocked'|'done'
  tags?: string[]
  notes: string
}

const tasks: SeedItem[] = [
  {
    title: 'Set canonical tags on all templates',
    notes: `**Goal:** Prevent duplicate content and consolidate signals.

**Do:**
- Add \`<link rel="canonical">\` to category, product, pagination, and blog templates.
- Point each page to its preferred, self-referencing canonical.
- For filtered/sorted/UTM variants, canonicalise to the clean URL.
- Verify with the URL Inspection tool (Search Console) and in rendered HTML.

**Checks:**
- One canonical tag per page.
- No cross-canonicals to non-indexable pages.
- Pagination pages have self-canonicals (unless explicitly consolidating).

**Done when:** Sample of 20 pages shows correct self-referencing canonicals.`
  },
  {
    title: 'Generate XML sitemaps and submit in Search Console',
    notes: `**Goal:** Ensure discoverability and fast inclusion.

**Do:**
- Create index sitemap \`/sitemap.xml\` linking to: \`/sitemap-products.xml\`, \`/sitemap-categories.xml\`, \`/sitemap-pages.xml\`, \`/sitemap-blog.xml\`.
- Include only **indexable** 200 pages (no noindex, no 404).
- Keep <50,000 URLs per file and <50MB uncompressed.
- Update daily on content changes.

**Checks:**
- Validate with \`curl\` and an online validator.
- Submit in GSC: Index → Sitemaps.

**Done when:** GSC shows “Success” and coverage errors trend down.`
  },
  {
    title: 'Fix duplicate titles & meta descriptions',
    notes: `**Goal:** Improve CTR and avoid duplication issues.

**Do:**
- Export title/meta from your CMS or via a crawl (Screaming Frog).
- For duplicates, add unique primary keyword + differentiator (brand, category, SKU).
- Keep titles ~55–60 chars; descriptions 120–155 chars, compelling and unique.

**Done when:** Duplicates reduced to near-zero; spot-check SERP snippets match intent.`
  },
  {
    title: 'Implement robots meta for thin/filtered pages',
    notes: `**Goal:** Reduce index bloat.

**Do:**
- Add \`<meta name="robots" content="noindex,follow">\` to thin, thank-you, filter/sort-only pages.
- Keep valuable landing pages indexable.

**Checks:** Crawl and confirm those pages are \`noindex\`.

**Done when:** “Excluded (by noindex)” count rises appropriately in GSC while clicks stay stable or improve.`
  },
  {
    title: 'Improve Core Web Vitals (LCP/CLS/INP)',
    notes: `**Goal:** Better UX and rankings support.

**Do:**
- **LCP:** Optimise hero image (preload, compressed, responsive sizes).
- **CLS:** Reserve space for images/fonts; avoid layout shift on add-to-cart.
- **INP:** Defer non-critical JS; use code-splitting; minimise third-party scripts.

**Checks:** Web Vitals in PageSpeed Insights + GSC → Experience → Core Web Vitals.

**Done when:** 75th percentile is green for mobile and desktop.`
  },
  {
    title: 'Add structured data (Product, Breadcrumb, Organization)',
    notes: `**Goal:** Rich results and better understanding.

**Do:**
- Product pages: \`Product\` with \`name\`, \`sku\`, \`brand\`, \`offers\` (price, availability), \`aggregateRating\` (if applicable).
- Sitewide: \`Organization\` (logo, sameAs), \`BreadcrumbList\`.
- Validate with Rich Results Test.

**Done when:** Rich results eligible in GSC Enhancements, no critical errors.`
  },
  {
    title: 'Consolidate HTTP/HTTPS and www/non-www',
    notes: `**Goal:** Single canonical host.

**Do:**
- Force one scheme/host (e.g., \`https://www.platesexpress.co.uk\`) via 301s.
- Update \`<link rel=canonical>\`, sitemap URLs, and internal links to the canonical host.

**Checks:** \`curl -I\` on alternates returns 301 → canonical.

**Done when:** Only one host variant is accessible without redirect chains.`
  },
  {
    title: 'Internal linking from top pages to priority categories',
    notes: `**Goal:** Distribute PageRank and improve crawl paths.

**Do:**
- Identify top pages (GSC/GA4) and add contextual links to key categories/products.
- Use descriptive anchor text; avoid over-optimisation.

**Done when:** Each priority category has 5–10 new internal links from high-traffic pages.`
  },
  {
    title: 'Add Hreflang (if multiple locales)',
    notes: `**Goal:** Correct geo/language targeting.

**Do:**
- For each variant, add reciprocal \`hreflang\` and \`x-default\`.
- Use absolute URLs; ensure each cluster is complete.

**Done when:** GSC International Targeting shows no hreflang errors.`
  },
  {
    title: '404/410 cleanup and redirects',
    notes: `**Goal:** Preserve equity and reduce errors.

**Do:**
- Export 404s from logs/GSC.
- Redirect valuable legacy URLs to best-match pages; 410 truly dead content.
- Avoid redirect chains (>1 hop).

**Done when:** GSC “Not found (404)” is trending down; key legacy URLs 301 to relevant pages.`
  },
  {
    title: 'Tagging: analytics and events for SEO funnels',
    notes: `**Goal:** Measure impact.

**Do:**
- Ensure GA4 + key events (view_item, add_to_cart, begin_checkout) fire correctly.
- Label SEO landings in reports.

**Done when:** You can segment SEO traffic by task area and see conversions.`
  },
  {
    title: 'Content briefs for top 10 categories',
    notes: `**Goal:** Expand and align content.

**Do:**
- For each category: search intent, subtopics (H2s), FAQs (FAQPage schema), internal links, unique copy (300–600 words).
- Avoid keyword stuffing; write for users.

**Done when:** 10 briefs approved, pages updated or ready in CMS.`
  },
]

export async function getOrCreatePlatesExpressProject() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) throw new Error('Not signed in')
  const uid = user.user.id

  // Find project
  const { data: existing, error: findErr } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', uid)
    .eq('name', 'Plates Express')
    .maybeSingle()
  if (findErr) throw findErr

  if (existing) return existing

  const { data: created, error: insErr } = await supabase
    .from('projects')
    .insert([{ name: 'Plates Express', color: 'indigo' }])
    .select('id')
    .single()

  if (insErr) throw insErr
  return created
}

export async function seedPlatesExpressFromAudit(projectId: string) {
  if (!projectId) throw new Error('Missing projectId')

  // Fetch existing items for this project
  const { data: current, error: curErr } = await supabase
    .from('items')
    .select('id,title,notes,position,status,tags')
    .eq('project_id', projectId)

  if (curErr) throw curErr
  const map = new Map((current||[]).map(i => [i.title.trim().toLowerCase(), i]))

  let inserted = 0
  let updated = 0
  const inserts: any[] = []
  const updates: any[] = []

  const nowPos = () => Date.now() + Math.random()

  for (const t of tasks) {
    const key = t.title.trim().toLowerCase()
    const found = map.get(key)
    if (!found) {
      inserts.push({
        project_id: projectId,
        title: t.title,
        status: t.status ?? 'todo',
        tags: t.tags ?? [],
        notes: t.notes,
        position: nowPos(),
      })
      inserted++
    } else if (!found.notes || found.notes.trim() === '') {
      updates.push({ id: found.id, notes: t.notes })
      updated++
    }
  }

  if (inserts.length) {
    const { error: insErr } = await supabase.from('items').insert(inserts)
    if (insErr) throw insErr
  }

  for (const u of updates) {
    const { error: upErr } = await supabase.from('items').update({ notes: u.notes }).eq('id', u.id)
    if (upErr) throw upErr
  }

  return { inserted, updated }
}
