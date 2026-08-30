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
