# Homelab / Personal Site

An Astro-based static site with: a homelab/project showcase (with live GitHub repo embeds),
a resume page, an MTG collection inventory (imported from Archidekt), a board game inventory
with personal reviews, and a D&D campaign tracker.

No database, no backend — all content lives in JSON files in `src/data/`, and the whole
site builds to plain static HTML/CSS/JS that any free host can serve.

## 1. Local setup

You'll need [Node.js](https://nodejs.org) (v18+) installed.

```bash
cd homelab-site
npm install
npm run dev
```

Visit `http://localhost:4321` to see it live as you edit.

## 2. Editing content

Everything is plain JSON — no admin panel needed, just edit and save:

| File | Powers |
|---|---|
| `src/data/projects.json` | Homelab/Projects page. Set `github` to `"username/repo"` to pull in a live star count, description, etc. |
| `src/data/resume.json` | Resume page |
| `src/data/boardgames.json` | Board game inventory + your reviews |
| `src/data/mtg-collection.json` | MTG inventory (see Archidekt import below) |
| `src/data/dnd-campaigns.json` | D&D campaigns, characters, quests, notes |

After editing, just save the file — the dev server hot-reloads.

## 3. Importing your MTG collection from Archidekt

Archidekt doesn't have a public, browser-fetchable API for personal collections, so the
reliable way to sync is:

1. Go to your collection on [archidekt.com](https://archidekt.com/collections)
2. Use **Export → CSV**
3. Run:
   ```bash
   node scripts/import-archidekt-csv.mjs ~/Downloads/your-export.csv
   ```
4. This rewrites `src/data/mtg-collection.json`. Re-run it any time your collection changes
   and re-export.

## 4. Building for production

```bash
npm run build
```

Output goes to `dist/` — this is the folder you deploy.

## 5. Deploying (free static hosting)

**Recommended: Netlify or Vercel**, both have free tiers and connect directly to a GitHub repo:

1. Push this project to a GitHub repo.
2. On [Netlify](https://app.netlify.com) or [Vercel](https://vercel.com), click "New site/project from Git", pick the repo.
3. Build command: `npm run build`. Publish directory: `dist`.
4. It deploys automatically on every push.

**Alternative: GitHub Pages** — works too, but needs a small extra step for client-side
routing since this site uses dynamic `[slug]` pages; Netlify/Vercel handle that automatically
with zero config, which is why they're recommended here.

## 6. Pointing your existing domain at it

Your domain registration (currently sitting at Squarespace) and your site hosting are two
separate things — you can keep the domain registered there and still point it at Netlify/Vercel:

1. In Netlify/Vercel, add your domain under "Domain settings" — they'll give you DNS records (usually an A record + CNAME, or just a CNAME for a subdomain).
2. Log into wherever your domain's DNS is managed (likely your Squarespace domain dashboard) and update the DNS records to match what Netlify/Vercel gave you.
3. DNS changes can take a few hours to propagate.

If you get stuck finding the DNS settings in Squarespace, that's a quick thing I can help
walk through once you're at that step.
