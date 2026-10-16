import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://localhost:5173/")
        await page.wait_for_timeout(1000)
        
        # Click Entrar al workspace or Dashboard
        enter_btn = page.locator("button:has-text('Entrar al workspace')").first
        if await enter_btn.is_visible():
            await enter_btn.click()
        else:
            await page.click("button:has-text('Dashboard')")
        await page.wait_for_timeout(1000)
        
        # Click on Mapa de Flujos in visible desktop sidebar
        journey_btn = page.locator(".app > aside.sidebar nav button:has-text('Mapa de Flujos')")
        await journey_btn.click()
        await page.wait_for_timeout(1500)
        
        # 1. Test mouse wheel zoom
        viewport = page.locator(".journey-canvas-viewport")
        # Spin wheel down to zoom in
        await viewport.hover()
        await page.mouse.wheel(0, -300)
        await page.wait_for_timeout(500)
        await page.screenshot(path="web/public/evidence/runs/journey-wheel-zoomed.png")
        print("Captura con wheel zoom guardada en: web/public/evidence/runs/journey-wheel-zoomed.png")

        # 2. Click Maximizar Tablero (collapses sidebar)
        toggle_btn = page.locator("button:has-text('Maximizar Tablero')")
        if await toggle_btn.is_visible():
            await toggle_btn.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="web/public/evidence/runs/journey-maximized.png")
            print("Captura con tablero maximizado guardada en: web/public/evidence/runs/journey-maximized.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
