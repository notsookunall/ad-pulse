<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e10341af-fef8-4a1e-bc32-bccf24a2f263

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the environment variables in `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` for the AI Insights card
3. Run the app:
   `npm run dev`

## AI Insights

The client dashboard includes an `AI Campaign Insights` card that:

- Loads campaign data from Supabase
- Calculates campaign metrics like CTR, conversion rate, budget utilization, and performance score
- Sends those metrics to Gemini when `VITE_GEMINI_API_KEY` is configured
- Falls back to a local recommendation engine if the Gemini key is missing
- Auto-seeds demo campaigns and payments for brand-new client accounts so the dashboard is never empty during demos
