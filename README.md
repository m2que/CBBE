<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1K8-2FskAChYNN45UOYwgnPCffFXBuOgP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Branding Reference

- Source of truth for MarketLearn branding lives in the read-only landing-page project at `/Users/mamac3/Documents/1_apps/a_MarketLearn/ai-tools-landing`.
- Inspect these files first when making brand or UI-alignment changes:
  - `/Users/mamac3/Documents/1_apps/a_MarketLearn/ai-tools-landing/shared/brand/brand-assets.html`
  - `/Users/mamac3/Documents/1_apps/a_MarketLearn/ai-tools-landing/shared/brand/brand.css`
  - `/Users/mamac3/Documents/1_apps/a_MarketLearn/ai-tools-landing/shared/brand/load-icons.js`
  - `/Users/mamac3/Documents/1_apps/a_MarketLearn/ai-tools-landing/shared/brand/marketlearn-icons.svg`
  - `/Users/mamac3/Documents/1_apps/a_MarketLearn/ai-tools-landing/shared/templates/template-preview.html`
  - `/Users/mamac3/Documents/1_apps/a_MarketLearn/ai-tools-landing/shared/templates/template-preview.tsx`
- Treat the landing-page project as read-only. Do not edit it from this repo.
- Do not reference absolute local filesystem paths at runtime. Copy or adapt any required brand assets into CBBE so the deployed app remains self-contained.
- Reuse the shared MarketLearn icon system rather than creating one-off icons. In this repo, the local self-contained icon sprite lives in `components/BrandIconSprite.tsx` and the icon wrapper lives in `components/BrandIcon.tsx`.
- The current local brand base is in `assets/brand.css`, with app-specific overrides in `index.css`.
- Keep CBBE application logic, `/api/cbbe`, `/api/cbbe-scenario`, baseline report flow, and chart/output logic unchanged unless the task explicitly calls for product behavior changes.

## Next Session Priority

- The next major priority is the backend database layer.
- Start by inspecting whether the repo already has any persistence, auth, ORM, or database configuration.
- If there is no existing database setup, propose the smallest production-safe persistence plan first before implementation.
- Likely persistence targets:
  - saved baseline CBBE analyses
  - Scenario Lab sessions and results
  - rerun/comparison history for class use
  - timestamps, model metadata, and basic audit fields
- Keep the current `/api/cbbe` and `/api/cbbe-scenario` contracts stable unless a schema-backed extension is explicitly needed.
- Keep Gemini calls server-side.
- Prefer small, reviewable changes and document any schema decisions clearly.

## Live Issue Note

- Current live-site issue reported: `Test a scenario` fails with `We could not create a scenario right now. Please try again.`
- One confirmed production issue was Vercel runtime module resolution for Scenario Lab server helpers.
- The live route failed with errors like:
  - `Cannot find module '/var/task/lib/cbbeScenario'`
  - `Cannot find module '/var/task/api/cbbe-scenario-lib'`
- To avoid this class of issue, keep `api/cbbe-scenario.ts` self-contained for server-only helper logic instead of relying on sibling helper modules that may not bundle correctly in Vercel runtime.
- Another live issue was brittle JSON parsing from Gemini output. The app now uses more defensive JSON extraction/parsing for both `/api/cbbe` and Scenario Lab flows.
- If live behavior breaks again, check Vercel runtime logs first and verify whether the deployed production alias is actually pointing at the latest commit.
- Local success does not guarantee live success when Vercel runtime bundling differs from local dev resolution.
