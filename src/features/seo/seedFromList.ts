import { supabase } from '@/lib/supabase'

type Status = 'todo'|'in_progress'|'blocked'|'done'
type SeedItem = {
  title: string
  status?: Status
  tags?: string[]
  notes: string
}

const P0 = 'P0 — Pre-launch MUST-FIX (today)'
const P1 = 'P1 — Launch window (+72h)'
const P2 = 'P2 — First 30 days'

function N(lines: string[]): string { return lines.join('\n') }

export const tasks: SeedItem[] = [
  // P0
  {
    title: 'Block staging from indexation',
    tags: [P0, 'Indexation'],
    notes: N([
      'Owner: Dev FE / Ops',
      'Why: If staging is indexable, Google can index duplicate pages and confuse rankings.',
      'How:',
      '- Add HTTP header: X-Robots-Tag: noindex,nofollow',
      '- Add <meta name="robots" content="noindex,nofollow"> to <head>',
      '- /robots.txt on staging: "User-agent: *" + "Disallow: /"',
      '- Remove all of the above on production at launch',
      'Done: A crawl of staging confirms noindex,nofollow on every page and robots Disallow: /. Production is indexable.'
    ])
  },
  {
    title: 'Self-canonicals on staging (switch to prod at launch)',
    tags: [P0, 'Canonicals'],
    notes: N([
      'Owner: Dev FE',
      'Why: Self-canonicals avoid duplicate signals and make the main URL explicit.',
      'How:',
      '- On staging: <link rel="canonical" href="https://{staging-host}{path}">',
      '- At launch switch all to the production host self-canonical',
      '- Parameter pages canonicalise to the clean URL',
      'Done: Sampled URLs on staging self-canonical to staging host; after launch, to the prod host.'
    ])
  },
  {
    title: 'Kill cross-environment links on staging',
    tags: [P0, 'Internal Linking'],
    notes: N([
      'Owner: Dev FE',
      'Why: Links to production from staging leak crawls and break QA.',
      'How:',
      '- Replace absolute prod links with relative (/path) or env-aware base URLs',
      '- Re-check “How-to Fit” and similar pages',
      'Done: JS-off crawl on staging never hits prod; spot checks show only relative/env-aware links.'
    ])
  },
  {
    title: 'Fix Mini page metadata (Title/H1)',
    tags: [P0, 'Metadata'],
    notes: N([
      'Owner: Dev FE / Content',
      'Why: Incorrect Title/H1 (e.g., 4D title leaking onto Mini) misleads Google and users.',
      'How:',
      '- Correct the Mini Plates template so Title and H1 match the page',
      '- Spot-check other model/manufacturer pages for the same mismatch',
      'Done: Mini and similar pages have unique, intent-aligned Title + H1 with no leakage.'
    ])
  },
  {
    title: 'Prep production XML sitemaps (no staging sitemaps exposed)',
    tags: [P0, 'Sitemaps'],
    notes: N([
      'Owner: SEO / Dev BE',
      'Why: Clean sitemaps allow fast discovery of canonical, indexable URLs.',
      'How:',
      '- Sitemap index at /sitemap.xml that points to products, categories, pages, blog maps',
      '- Include only 200, canonical, indexable production URLs',
      '- Keep each file < 50k URLs and < 50MB',
      'Done: GSC can fetch production sitemaps; no staging URLs present.'
    ])
  },

  // P1
  {
    title: 'Decommission staging host',
    tags: [P1, 'Environments'],
    notes: N([
      'Owner: Ops',
      'Why: After launch, staging should no longer be publicly reachable for users/crawlers.',
      'How:',
      '- Put staging behind auth, or 301 all sale.* URLs to production equivalents',
      '- Never canonicalise production to staging',
      'Done: Direct hits to staging require auth or 301 to prod; no canonical pointing to staging.'
    ])
  },
  {
    title: 'Remove legacy “private plates” content',
    tags: [P1, 'Content'],
    notes: N([
      'Owner: Content / SEO',
      'Why: Marketplace-style content confuses Google; you are a manufacturer.',
      'How:',
      '- 410 the legacy blog about buying/selling personalised plates',
      '- 301 /cheap-number-plates/ → /replacement-number-plates/ (or fully rewrite to manufacturing intent)',
      'Done: No marketplace phrasing on money pages; redirects tested and relevant.'
    ])
  },
  {
    title: 'Add social meta + FAQ schema',
    tags: [P1, 'Social & Schema'],
    notes: N([
      'Owner: Dev FE / Content',
      'Why: Social previews drive CTR; FAQ schema can produce rich results.',
      'How:',
      '- Add default OG/Twitter (title/description/image) per template',
      '- Add FAQPage schema to compliance/legal FAQ sections where present',
      'Done: URL debuggers show correct OG previews; Rich Results Test validates FAQ schema.'
    ])
  },
  {
    title: 'Harden headers & caching',
    tags: [P1, 'Security & Ops'],
    notes: N([
      'Owner: Ops',
      'Why: Security best practice and performance for repeat views.',
      'How:',
      '- HSTS (1y, includeSubDomains, preload), CSP baseline, X-Content-Type-Options: nosniff, X-Frame-Options: DENY',
      '- Enable gzip/brotli',
      '- Cache hashed assets (immutable, 1y), do not cache HTML',
      'Done: Security headers present; assets cached; HTML un-cached; no redirect chains.'
    ])
  },

  // P2
  {
    title: 'Performance hardening (LCP/INP/CLS)',
    tags: [P2, 'Performance'],
    notes: N([
      'Owner: Dev FE',
      'Why: Faster UX improves rankings and conversions.',
      'How:',
      '- Use next-gen hero images (AVIF/WebP) and preload LCP image & fonts',
      '- Route-level JS splitting for builder; defer non-critical scripts',
      '- Reserve image/font space to avoid CLS',
      'Done: Targets met: LCP ≤ 2.5s, INP ≤ 200 ms, CLS ≤ 0.1 on Home, Maker, Replacement, 3D/4D templates.'
    ])
  },
  {
    title: 'Expand model/manufacturer pages',
    tags: [P2, 'Content'],
    notes: N([
      'Owner: Content',
      'Why: Stronger intent coverage lifts rankings and conversion.',
      'How:',
      '- Add legal size matrices and fitting tips',
      '- Interlink to Maker/Replacement and relevant categories',
      'Done: Pages include legal/compliance info and contextual links; no duplication across pages.'
    ])
  },
  {
    title: 'Publish a compliance hub',
    tags: [P2, 'Content / Compliance'],
    notes: N([
      'Owner: Content / SEO',
      'Why: Central source of truth builds trust and earns long-tail.',
      'How:',
      '- BS AU 145e basics, DVLA rules, required documents',
      '- Warranty/materials page; link to builder and help pages',
      'Done: Hub published with internal links; FAQ schema added where suitable.'
    ])
  },

  // Redirects & canonicals
  {
    title: 'Redirect map live',
    tags: [P1, 'Redirects'],
    notes: N([
      'Owner: SEO / Dev',
      'Why: Consolidate signals and avoid broken journeys.',
      'How:',
      '- 301 /cheap-number-plates/ → /replacement-number-plates/',
      '- 410 the legacy personalised plates blog (or keep with noindex + contextual rewrite if needed)',
      'Done: Live checks show 301/410 as specified; no redirect chains.'
    ])
  },
  {
    title: 'Parameter policy & canonicals',
    tags: [P1, 'Canonicals'],
    notes: N([
      'Owner: Dev / SEO',
      'Why: Prevent parameter pages and trackers from polluting the index.',
      'How:',
      '- Allow only necessary builder params',
      '- Canonical all parameter pages to the clean URL',
      '- Block tracking params from indexing',
      'Done: Sampled parameter pages canonicalise correctly; GSC shows clean canonicalization.'
    ])
  },

  // Structured data
  {
    title: 'Structured data (sitewide)',
    tags: [P1, 'Schema'],
    notes: N([
      'Owner: Dev FE / SEO',
      'Why: Help search engines understand the site and enable enhancements.',
      'How:',
      '- Add Organization and WebSite on all pages',
      '- Add BreadcrumbList on categories/builders',
      'Done: Rich Results Test passes; Search Console shows eligible items.'
    ])
  },
  {
    title: 'Structured data (FAQs)',
    tags: [P1, 'Schema'],
    notes: N([
      'Owner: Dev FE / SEO',
      'Why: FAQ rich results can boost SERP real estate.',
      'How:',
      '- Add FAQPage schema on compliance/legal Q&A sections',
      '- Keep questions/answers visible on-page',
      'Done: Rich Results Test passes; FAQs appear eligible in GSC.'
    ])
  },
  {
    title: 'Structured data (Product where appropriate)',
    tags: [P2, 'Schema'],
    notes: N([
      'Owner: Dev FE / SEO',
      'Why: If plate products/configurator show price/availability, Product schema can enhance snippets.',
      'How:',
      '- Add Product with brand/material and offers (price, availability) where visible',
      '- Exclude marketplace/registration entities',
      'Done: Product schema validates for applicable pages; no required-field errors.'
    ])
  },

  // Social/Open Graph
  {
    title: 'Social/Open Graph template defaults',
    tags: [P1, 'Social'],
    notes: N([
      'Owner: Dev FE / Content',
      'Why: Correct previews increase sharing CTR.',
      'How:',
      '- Set unique OG title/description/image and Twitter Card per template (home, category, builder, article)',
      'Done: URL debuggers show correct previews on sample pages.'
    ])
  },

  // Error states
  {
    title: '404 / 410 error states',
    tags: [P1, 'Errors'],
    notes: N([
      'Owner: Dev FE',
      'Why: Good error UX keeps users on site; correct status codes guide Google.',
      'How:',
      '- Branded 404 with recovery links (Maker, Replacement, How-to, Contact)',
      '- 410 for removed legacy “private plates” URLs',
      'Done: 404/410 return correct codes; recovery links function.'
    ])
  },

  // QA checklist
  {
    title: 'QA — template pass/fail checks',
    tags: [P1, 'QA'],
    notes: N([
      'Owner: SEO / Dev FE',
      'Why: Prevents last-minute regressions.',
      'How (per template: Home, Maker, Replacement, 3D/4D):',
      '- Staging = noindex,nofollow; Prod = index,follow with correct self-canonicals',
      '- Titles/H1s are unique and reflect manufacturing intent',
      '- Key copy & nav visible with JS off',
      '- No cross-env anchors; internal links connect Maker, Replacement, Motorcycle, How-to',
      '- Valid schema (Org/WebSite/Breadcrumb/FAQ/Product where used)',
      '- OG/Twitter populated and validate correctly',
      '- Lab CWV: LCP ≤ 2.5s, INP ≤ 200 ms, CLS ≤ 0.1',
      '- Clean prod sitemaps only (no staging URLs)',
      'Done: All checks pass per template; issues tracked and resolved.'
    ])
  },

  // Measurement & tooling
  {
    title: 'Measurement & tooling setup',
    tags: [P1, 'Analytics'],
    notes: N([
      'Owner: SEO / Dev',
      'Why: You need proof that organic traffic converts.',
      'How:',
      '- GA4: add a launch annotation; confirm GA4 page titles reflect corrected metadata',
      '- GSC: verify www and temporarily blocked sale properties; submit only prod sitemap(s)',
      '- CWV monitoring: track by template (Home, Maker, Replacement, Category)',
      '- Optional: spot-check logs for Googlebot on prod only',
      'Done: GA4 and GSC confirm data; CWV dashboard set up; log spot-checks look clean.'
    ])
  }
]

// Ensure the project exists for current user (RLS)
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

// Insert new items; if a same-title exists with empty notes, fill notes
export async function seedPlatesExpressFromList(projectId: string) {
  const { data: current, error } = await supabase
    .from('items')
    .select('id,title,notes')
    .eq('project_id', projectId)
  if (error) throw error

  const map = new Map((current || []).map(i => [i.title.trim().toLowerCase(), i]))
  const pos = () => Date.now() + Math.random()
  let inserted = 0, updated = 0

  for (const t of tasks) {
    const key = t.title.trim().toLowerCase()
    const found = map.get(key)
    if (!found) {
      const { error: insErr } = await supabase.from('items').insert([{
        project_id: projectId,
        title: t.title,
        status: t.status ?? 'todo',
        tags: t.tags ?? [],
        notes: t.notes,
        position: pos()
      }])
      if (insErr) throw insErr
      inserted++
    } else if (!found.notes || found.notes.trim() === '') {
      const { error: upErr } = await supabase.from('items').update({ notes: t.notes }).eq('id', found.id)
      if (upErr) throw upErr
      updated++
    }
  }
  return { inserted, updated }
}
