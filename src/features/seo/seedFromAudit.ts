import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slug'

type SeedItem = {
  title: string
  status?: 'todo'|'in_progress'|'blocked'|'done'
  tags?: string[]
  notes: string
}

export const tasks: SeedItem[] = [
  {
    title: 'Block staging from Google (noindex + robots + header)',
    tags: ['P0 • Critical','Indexation'],
    notes: `Why: Prevents duplicate content and accidental indexation of staging.
How:
1) X-Robots-Tag: noindex,nofollow
2) <meta name="robots" content="noindex,nofollow">
3) /robots.txt → Disallow: /
4) Remove all three on production
Accept: Staging returns noindex,nofollow and robots disallows /; spot-check pages with curl and View Source.`
  },
  {
    title: 'Fix cross-environment links (staging must not link to prod)',
    tags: ['P0 • Critical','Internal Linking'],
    notes: `Why: QA/crawl should remain within staging.
How: Replace absolute prod links with relative (/path) or env-aware base URL.
Accept: JS-off crawl on staging never hits prod; sampled templates show only relative/env-aware URLs.`
  },
  {
    title: 'Set self-referencing canonicals on every template',
    tags: ['P0 • Critical','Canonicals'],
    notes: `Why: Consolidates signals; avoids duplicate indexation.
How: <link rel="canonical" href="{absolute self URL}"> on product/category/builder/blog/pagination; params canonicalise to clean URL.
Accept: Sample of 20 URLs shows correct self-canonicals matching page URL on the canonical host.`
  },
  {
    title: 'Clean XML sitemaps (prod only) and submit to GSC',
    tags: ['P0 • Critical','Sitemaps'],
    notes: `Why: Fast discovery of indexable pages only.
How: /sitemap.xml (index) → products, categories, pages, blog; include only 200/indexable; <50k URLs/file, <50MB.
Accept: GSC shows “Success”; no staging URLs in sitemaps.`
  },
  {
    title: 'Standardise Titles and H1s (intent-aligned, unique)',
    tags: ['P1 • High','Content Quality'],
    notes: `Why: Matching Title/H1 improves relevance and CTR.
How: Title = intent + primary keyword + brand; H1 mirrors human variant; fix Mini/4D mismatches; remove duplicates.
Accept: Crawl shows no duplicates; Title/H1 aligned per template.`
  },
  {
    title: 'Remove marketplace/“private plates” semantics from money pages',
    tags: ['P1 • High','Content Strategy'],
    notes: `Why: You’re a manufacturer; marketplace terms confuse users/search engines.
How: Rewrite/remove legacy content; 301 /cheap-number-plates/ → /replacement-number-plates/; update anchors.
Accept: No marketplace phrasing on category/product/builder pages; redirects relevant and tested.`
  },
  {
    title: 'Structured Data: Organization, WebSite, Breadcrumb, FAQ',
    tags: ['P1 • High','Structured Data'],
    notes: `Why: Rich results improve SERP visibility.
How: Sitewide Organization (logo, sameAs) + WebSite; BreadcrumbList on categories/builders; FAQPage for compliance/common Qs.
Accept: Rich Results Test passes; GSC Enhancements show eligibility without critical errors.`
  },
  {
    title: 'Optional: Product schema on configurable builder pages',
    tags: ['P2 • Medium','Structured Data'],
    notes: `Why: Enables price/availability rich snippets if pricing visible.
How: Product with name, sku, brand, offers (price, availability), rating if present.
Accept: Rich Results Test passes; no missing required fields.`
  },
  {
    title: 'Core Web Vitals (LCP/INP/CLS) per key template',
    tags: ['P1 • High','Performance'],
    notes: `Why: UX and rankings support; builder speed drives conversion.
How: LCP—preload hero, AVIF/WebP, responsive sizes, inline critical CSS. INP—code-split builder JS, defer non-critical, reduce third-party. CLS—reserve image/font space; avoid shifting banners.
Accept: 75th percentile green in PSI + GSC for Home/Category/Builder (mobile & desktop).`
  },
  {
    title: 'Improve internal linking to priority categories',
    tags: ['P2 • Medium','Internal Linking'],
    notes: `Why: Distributes authority and improves crawl paths.
How: Add contextual anchors from high-traffic pages to Maker/Replacement/Motorcycle etc.
Accept: Money pages <=3 clicks (JS-off); +5–10 relevant internal links each.`
  },
  {
    title: 'Redirect hygiene: enforce single canonical host',
    tags: ['P1 • High','Redirects'],
    notes: `Why: Prevents split signals and crawl waste.
How: 301 http→https and non-www→www (or preferred); remove chains; update canonical/sitemaps/internal links.
Accept: Alternates 301 in one hop; no chains in spot checks.`
  },
  {
    title: 'Robots meta for thin/utility pages (noindex,follow)',
    tags: ['P2 • Medium','Indexation'],
    notes: `Why: Reduces index bloat; focuses crawl budget.
How: <meta name="robots" content="noindex,follow"> on thin, thank-you, filter-only, test pages.
Accept: Expected sets are noindex; GSC “Excluded (by noindex)” rises appropriately.`
  },
  {
    title: 'Security headers + caching policy',
    tags: ['P2 • Medium','Security & Ops'],
    notes: `Why: Baseline security and fast repeat views.
How: HSTS (1y incl. subdomains), X-Content-Type-Options: nosniff, X-Frame-Options: DENY, CSP default-src 'self'; enable gzip/Brotli; cache hashed assets with public,max-age=31536000,immutable; do not cache HTML.
Accept: Headers present; assets cached; HTML uncached.`
  },
  {
    title: 'Analytics tagging for SEO funnels (GA4 events)',
    tags: ['P3 • Low','Analytics'],
    notes: `Why: Measure SEO → conversion impact.
How: Ensure GA4 + view_item/add_to_cart/begin_checkout fire; label SEO landings in reports.
Accept: Dashboard segments SEO traffic and shows CVR by template.`
  },
  {
    title: 'Content briefs for top categories',
    tags: ['P3 • Low','Content Strategy'],
    notes: `Why: Consistent content that satisfies intent.
How: For each priority category: define intent, outline H2s/subtopics, internal links, FAQs (FAQPage), write 300–600 words unique copy.
Accept: Briefs approved and published; no duplication across categories.`
  }
]

// create/find project
export async function getOrCreatePlatesExpressProject() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) throw new Error('Not signed in')
  const { data: existing } = await supabase
    .from('projects').select('id')
    .eq('user_id', user.user.id)
    .eq('name', 'Plates Express')
    .maybeSingle()
  if (existing) return existing
  const { data: created, error } = await supabase
    .from('projects')
    .insert([{ name: 'Plates Express', color: 'indigo' }])
    .select('id').single()
  if (error) throw error
  return created
}

// seed/backfill using slug match
export async function seedPlatesExpressFromAudit(projectId: string) {
  if (!projectId) throw new Error('Missing projectId')
  const { data: current, error: curErr } = await supabase
    .from('items')
    .select('id,title,slug,notes')
    .eq('project_id', projectId)
  if (curErr) throw curErr

  const wanted = tasks.map(t => ({ ...t, slug: slugify(t.title) }))
  const have = new Map((current || []).map(i => [(i.slug || slugify(i.title)), i]))
  const nowPos = () => Date.now() + Math.random()

  let inserted = 0, updated = 0

  for (const t of wanted) {
    const found = have.get(t.slug)
    if (!found) {
      const { error } = await supabase.from('items').insert([{
        project_id: projectId,
        title: t.title,
        slug: t.slug,
        status: t.status ?? 'todo',
        tags: t.tags ?? [],
        notes: t.notes,
        position: nowPos()
      }])
      if (error) throw error
      inserted++
    } else if (!found.notes || found.notes.trim() === '' || !found.slug) {
      const { error } = await supabase.from('items')
        .update({ notes: t.notes, slug: t.slug })
        .eq('id', found.id)
      if (error) throw error
      updated++
    }
  }
  return { inserted, updated }
}

// lookup by slug (preferred) then by normalized title
export function getNotesTemplateForTitle(title: string): string | null {
  const slug = slugify(title)
  const hit = tasks.find(x => slugify(x.title) === slug)
  return hit ? hit.notes : null
}
