import asyncio
import os
from playwright.async_api import async_playwright

async def run_evidence_capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Step 1: Landing Page
        print("Capturing Landing...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.screenshot(path="web/public/evidence/runs/01-landing-audit.png", full_page=False)

        # Step 2: Login Page
        print("Capturing Login...")
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        await page.screenshot(path="web/public/evidence/runs/02-login-inspection.png", full_page=False)

        # Step 3: Protected Route Guard (/client/dashboard redirects to /login)
        print("Capturing RBAC Guard...")
        await page.goto("http://localhost:5173/client/dashboard", wait_until="networkidle")
        await page.screenshot(path="web/public/evidence/runs/03-rbac-guard-redirect.png", full_page=False)

        # Step 4: Bug Divergence Evidence
        print("Capturing Bug Divergence...")
        await page.goto("http://localhost:5173/terms", wait_until="networkidle")
        await page.screenshot(path="web/public/evidence/bugs/bug-01-divergence-evidence.png", full_page=False)

        await browser.close()
        print("Captures completed successfully.")

if __name__ == "__main__":
    asyncio.run(run_evidence_capture())
