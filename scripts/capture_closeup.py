import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1600, "height": 1000})
        await page.goto("http://localhost:5173")
        await page.wait_for_timeout(2000)
        
        tab = page.locator("text=La Oficina")
        if await tab.count() > 0:
            await tab.first.click()
            await page.wait_for_timeout(1500)
        
        # Click Foco Antigravity
        focus_btn = page.locator("button:has-text('Foco: Antigravity')")
        if await focus_btn.count() > 0:
            await focus_btn.click()
            await page.wait_for_timeout(600)
            
        zoom_btn = page.locator("button:has-text('+')")
        if await zoom_btn.count() > 0:
            await zoom_btn.click()
            await page.wait_for_timeout(300)
            await zoom_btn.click()
            await page.wait_for_timeout(800)
            
        viewport = page.locator(".iso-viewport")
        if await viewport.count() > 0:
            await viewport.screenshot(path="web/public/evidence/runs/among-us-characters-closeup.png")
            print("Closeup captured successfully!")
        await browser.close()

asyncio.run(run())
